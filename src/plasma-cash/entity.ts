import BN from 'bn.js'
import Web3 from 'web3'

import {
  EthereumPlasmaClient,
  IPlasmaCoin,
  IPlasmaDeposit,
  IPlasmaExitData
} from './ethereum-client'
import { DAppChainPlasmaClient } from './dappchain-client'
import { PlasmaCashTx } from './plasma-cash-tx'
import { Web3Signer } from '../solidity-helpers'

export interface IProofs {
  inclusion: { [blockNumber: string]: string }
  exclusion: { [blockNumber: string]: string }
  transactions: { [blockNumber: string]: PlasmaCashTx }
}

export interface IEntityParams {
  /** Web3 account for use on Ethereum */
  ethAccount: any // TODO: Type this properly, also this should probably be obtained from ethPlasmaClient
  ethPlasmaClient: EthereumPlasmaClient
  dAppPlasmaClient: DAppChainPlasmaClient
  /** Allows to override the amount of gas used when sending txs to Ethereum. */
  defaultGas?: string | number
  childBlockInterval: number
}

export interface IWeb3EventSub {
  unsubscribe(callback?: (error: Error, result: boolean) => void): void
}

// TODO: Maybe come up with a better name?
/**
 * Manages Plasma Cash related interactions between an Ethereum network (Ganache, Mainnet, etc.)
 * and a Loom DAppChain from the point of view of a single entity. An entity has two identities, one
 * on Ethereum, and one on the DAppChain, each identity has its own private/public key pair.
 */
export class Entity {
  private _web3: Web3
  // web3 account
  private _ethAccount: any // TODO: type this properly
  private _dAppPlasmaClient: DAppChainPlasmaClient
  private _ethPlasmaClient: EthereumPlasmaClient
  private _defaultGas?: string | number
  private _childBlockInterval: number

  get ethAddress(): string {
    return this._ethAccount.address
  }

  get plasmaCashContract(): any {
    return this._ethPlasmaClient.plasmaCashContract
  }

  constructor(web3: Web3, params: IEntityParams) {
    this._web3 = web3
    this._ethAccount = params.ethAccount
    this._ethPlasmaClient = params.ethPlasmaClient
    this._dAppPlasmaClient = params.dAppPlasmaClient
    this._defaultGas = params.defaultGas
    this._childBlockInterval = params.childBlockInterval
  }

  async transferTokenAsync(params: {
    slot: BN
    prevBlockNum: BN
    denomination: BN | number
    newOwner: Entity
  }) {
    const { slot, prevBlockNum, denomination, newOwner } = params
    const tx = new PlasmaCashTx({
      slot,
      prevBlockNum,
      denomination,
      newOwner: newOwner.ethAddress,
      prevOwner: this.ethAddress
    })
    await tx.signAsync(new Web3Signer(this._web3, this.ethAddress))
    await this._dAppPlasmaClient.sendTxAsync(tx)
  }

  getExitAsync(slot: BN): Promise<IPlasmaExitData> {
    return this._ethPlasmaClient.getExitAsync({ slot, from: this.ethAddress })
  }

  getCurrentBlockAsync(): Promise<BN> {
    return this._dAppPlasmaClient.getCurrentPlasmaBlockNumAsync()
  }

  getPlasmaCoinAsync(slot: BN): Promise<IPlasmaCoin> {
    return this._ethPlasmaClient.getPlasmaCoinAsync({ slot, from: this.ethAddress })
  }

  getBlockRootAsync(blockNumber: BN): Promise<string> {
    return this._ethPlasmaClient.getBlockRootAsync({ blockNumber, from: this.ethAddress })
  }

  checkMembershipAsync(leaf: string, root: string, slot: BN, proof: string): Promise<boolean> {
    return this._ethPlasmaClient.checkMembershipAsync({
      leaf,
      root,
      slot,
      proof,
      from: this.ethAddress
    })
  }

  async submitPlasmaBlockAsync(): Promise<BN> {
    await this._dAppPlasmaClient.debugFinalizeBlockAsync()
    const blockNum = await this._dAppPlasmaClient.getCurrentPlasmaBlockNumAsync()
    const block = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(blockNum)
    await this._ethPlasmaClient.debugSubmitBlockAsync({ block, from: this.ethAddress })
    return blockNum
  }

  submitPlasmaDepositAsync(deposit: IPlasmaDeposit): Promise<void> {
    return this._dAppPlasmaClient.debugSubmitDepositAsync(deposit)
  }

  async startExitAsync(params: { slot: BN; prevBlockNum: BN; exitBlockNum: BN }): Promise<object> {
    const { slot, prevBlockNum, exitBlockNum } = params

    // In case the sender is exiting a Deposit transaction, they should just create a signed
    // transaction to themselves. There is no need for a merkle proof.
    if (exitBlockNum.modn(this._childBlockInterval) !== 0) {
      const exitTx = new PlasmaCashTx({
        slot,
        prevBlockNum: new BN(0),
        denomination: 1,
        newOwner: this.ethAddress
      })
      await exitTx.signAsync(new Web3Signer(this._web3, this.ethAddress))
      return this._ethPlasmaClient.startExitAsync({
        slot,
        exitTx,
        exitBlockNum,
        from: this.ethAddress,
        gas: this._defaultGas
      })
    }

    // Otherwise, they should get the raw tx info from the blocks, and the merkle proofs.
    const exitBlock = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(exitBlockNum)
    const exitTx = exitBlock.findTxWithSlot(slot)
    if (!exitTx) {
      throw new Error(`Invalid exit block: missing tx for slot ${slot.toString(10)}.`)
    }
    const prevBlock = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(prevBlockNum)
    const prevTx = prevBlock.findTxWithSlot(slot)
    if (!prevTx) {
      throw new Error(`Invalid prev block: missing tx for slot ${slot.toString(10)}.`)
    }
    return this._ethPlasmaClient.startExitAsync({
      slot,
      prevTx,
      exitTx,
      prevBlockNum,
      exitBlockNum,
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }

  finalizeExitsAsync(): Promise<object> {
    return this._ethPlasmaClient.finalizeExitsAsync({
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }

  /**
   * @return Web3 subscription object that can be passed to stopWatchingAsync().
   */
  watchExit(slot: BN, fromBlock: BN): IWeb3EventSub {
    console.log(`Started watching events for Coin ${slot}`)
    return this.plasmaCashContract.events
      .StartedExit({
        filter: { slot: slot },
        fromBlock: 0
      })
      .on('data', (event: any, err: any) => {
        // console.log('Exit values: ', event.returnValues)
        this.challengeExitAsync(slot, event.returnValues.owner)
      })
      .on('error', (err: any) => console.log(err))
  }

  /**
   * @return Web3 subscription object that can be passed to stopWatchingAsync().
   */
  watchChallenge(slot: BN, fromBlock: BN): IWeb3EventSub {
    console.log(`Started watching challenges for Coin ${slot}`)
    return this.plasmaCashContract.events
      .ChallengedExit({
        filter: { slot: slot },
        fromBlock: 0
      })
      .on('data', (event: any, err: any) => {
        // console.log('Challenge values: ', event.returnValues)
        this.respondChallengeAsync(slot, event.returnValues.txHash, event.returnValues.challengingBlockNumber)
      })
      .on('error', (err: any) => console.log(err))
  }

  async challengeExitAsync(slot: BN, owner: String) {
    if (owner === this.ethAddress) {
      console.log('Exit is valid, continuing...')
      return
    } else {
      console.log('FOUND EXIT! CHALLENGING!!')
    }

    const coin = await this.getPlasmaCoinAsync(slot)
    const blocks = await this.getBlockNumbersAsync(coin.depositBlockNum)
    const proofs = await this.getCoinHistoryAsync(slot, blocks) // get only the inclusion proofs
    const exit = await this.getExitAsync(slot)

    for (let i in blocks) {
      const blk = blocks[i]
      if (!(blk.toString() in proofs.inclusion)) {
        continue
      }
      if (blk.gt(exit.exitBlock)) {
        console.log('Challenge Spent Coin!')
        await this.challengeAfterAsync({ slot: slot, challengingBlockNum: blk })
        break
      } else if (exit.prevBlock.lt(blk) && blk.lt(exit.exitBlock)) {
        console.log('Challenge Double Spend!!')
        await this.challengeBetweenAsync({ slot: slot, challengingBlockNum: blk })
        break
      } else if (blk.lt(exit.prevBlock)) {
        console.log('Challenge Invalid History!')
        // This should happen on the DAppChain side and return the specified tx, instead of the whole block
        const block = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(blk)
        const tx = block.findTxWithSlot(slot)
        await this.challengeBeforeAsync({
          slot: slot,
          prevBlockNum: tx.prevBlockNum,
          challengingBlockNum: blk
        })
        break
      }
    }
  }

  async respondChallengeAsync(slot: BN,  txHash: string, challengingBlockNum: BN) {
    const coin = await this.getPlasmaCoinAsync(slot)
    const blocks = await this.getBlockNumbersAsync(coin.depositBlockNum)
    // We challenge with the block that includes a transaction right after the challenging block
    const proofs = await this.getCoinHistoryAsync(slot, blocks)
    for (let i in blocks) {
      const blk = blocks[i]
      // check only inclusion blocks
      if (!(blk.toString() in proofs.inclusion)) { 
        continue
      }
      // challenge with the first block after the challengingBlock
      if (blk.gt(challengingBlockNum)) {
        this.respondChallengeAsync(slot, txHash, challengingBlockNum)
        break
      }
    }
  }

  async getCoinHistoryAsync(slot: BN, blockNumbers: BN[]): Promise<IProofs> {
    const inclProofs: { [blockNumber: string]: string } = {}
    const exclProofs: { [blockNumber: string]: string } = {}
    const txs: { [blockNumber: string]: PlasmaCashTx } = {}

    for (let i in blockNumbers) {
      const blockNumber = blockNumbers[i]
      const root = await this.getBlockRootAsync(blockNumber)

      // This should happen on the DAppChain side and return the specified tx, instead of the whole block
      const block = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(blockNumber)
      const tx = block.findTxWithSlot(slot)

      // If no tx was found add it to the eclusion proofs
      // TODO make this better when Dappchain API is updated
      if (
        tx ===
        new PlasmaCashTx({
          slot: new BN(0),
          prevBlockNum: new BN(0),
          denomination: new BN(0),
          newOwner: '0x0'
        })
      ) {
        exclProofs[blockNumber.toString()] = tx.proof
        continue
      }

      txs[blockNumber.toString()] = tx
      const included = await this.checkInclusionAsync(tx, root, slot, tx.proof)
      if (included) {
        inclProofs[blockNumber.toString()] = tx.proof
      } else {
        exclProofs[blockNumber.toString()] = tx.proof
      }
    }
    return {
      exclusion: exclProofs,
      inclusion: inclProofs,
      transactions: txs
    }
  }

  checkExclusionAsync(root: string, slot: BN, proof: string): Promise<boolean> {
    // keccak(uint256(0))
    const emptyHash = '0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563'
    return this.checkMembershipAsync(emptyHash, root, slot, proof)
  }

  async checkInclusionAsync(
    tx: PlasmaCashTx,
    root: string,
    slot: BN,
    proof: string
  ): Promise<boolean> {
    let ret
    if (tx.prevBlockNum.eq(new BN(0))) {
      ret = tx.hash === root
    } else {
      ret = await this.checkMembershipAsync(tx.hash, root, slot, proof)
    }
    return ret
  }

  async getBlockNumbersAsync(startBlock: any): Promise<BN[]> {
    const endBlock: BN = await this.getCurrentBlockAsync()
    const nextDepositBlock: BN = new BN(
      Math.ceil(startBlock / this._childBlockInterval) * this._childBlockInterval
    )
    const blockNumbers: BN[] = [startBlock]
    const interval = new BN(this._childBlockInterval)
    for (let i: BN = nextDepositBlock; i <= endBlock; i = i.add(interval)) {
      blockNumbers.push(i)
    }
    return blockNumbers
  }

  stopWatchingAsync(filter: IWeb3EventSub): Promise<boolean> {
    return new Promise((resolve, reject) => {
      filter.unsubscribe((err: Error, result: boolean) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  withdrawAsync(slot: BN): Promise<object> {
    return this._ethPlasmaClient.withdrawAsync({
      slot,
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }

  withdrawBondsAsync(): Promise<object> {
    return this._ethPlasmaClient.withdrawBondsAsync({
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }

  async challengeAfterAsync(params: { slot: BN; challengingBlockNum: BN }): Promise<object> {
    const { slot, challengingBlockNum } = params
    const challengingBlock = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(
      challengingBlockNum
    )
    const challengingTx = challengingBlock.findTxWithSlot(slot)
    if (!challengingTx) {
      throw new Error(`Invalid challenging block: missing tx for slot ${slot.toString(10)}.`)
    }
    return this._ethPlasmaClient.challengeAfterAsync({
      slot,
      challengingBlockNum,
      challengingTx,
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }

  async challengeBetweenAsync(params: { slot: BN; challengingBlockNum: BN }): Promise<object> {
    const { slot, challengingBlockNum } = params
    const challengingBlock = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(
      challengingBlockNum
    )
    const challengingTx = challengingBlock.findTxWithSlot(slot)
    if (!challengingTx) {
      throw new Error(`Invalid challenging block: missing tx for slot ${slot.toString(10)}.`)
    }
    return this._ethPlasmaClient.challengeBetweenAsync({
      slot,
      challengingBlockNum,
      challengingTx,
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }

  async challengeBeforeAsync(params: {
    slot: BN
    prevBlockNum: BN
    challengingBlockNum: BN
  }): Promise<object> {
    const { slot, prevBlockNum, challengingBlockNum } = params

    // In case the sender is exiting a Deposit transaction, they should just create a signed
    // transaction to themselves. There is no need for a merkle proof.
    if (challengingBlockNum.modn(this._childBlockInterval) !== 0) {
      const challengingTx = new PlasmaCashTx({
        slot,
        prevBlockNum: new BN(0),
        denomination: 1,
        newOwner: this.ethAddress
      })
      await challengingTx.signAsync(new Web3Signer(this._web3, this.ethAddress))
      return this._ethPlasmaClient.challengeBeforeAsync({
        slot,
        challengingTx,
        challengingBlockNum,
        from: this.ethAddress,
        gas: this._defaultGas
      })
    }

    // Otherwise, they should get the raw tx info from the blocks, and the merkle proofs.
    const exitBlock = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(challengingBlockNum)
    const challengingTx = exitBlock.findTxWithSlot(slot)
    if (!challengingTx) {
      throw new Error(`Invalid exit block: missing tx for slot ${slot.toString(10)}.`)
    }
    const prevBlock = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(prevBlockNum)
    const prevTx = prevBlock.findTxWithSlot(slot)
    if (!prevTx) {
      throw new Error(`Invalid prev block: missing tx for slot ${slot.toString(10)}.`)
    }
    return this._ethPlasmaClient.challengeBeforeAsync({
      slot,
      prevTx,
      challengingTx,
      prevBlockNum,
      challengingBlockNum,
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }

  async respondChallengeBeforeAsync(params: {
    slot: BN
    challengingTxHash: string
    respondingBlockNum: BN
  }): Promise<object> {
    const { slot, challengingTxHash, respondingBlockNum } = params
    const respondingBlock = await this._dAppPlasmaClient.getPlasmaBlockAtAsync(respondingBlockNum)
    const respondingTx = respondingBlock.findTxWithSlot(slot)
    if (!respondingTx) {
      throw new Error(`Invalid responding block: missing tx for slot ${slot.toString(10)}.`)
    }
    return this._ethPlasmaClient.respondChallengeBeforeAsync({
      slot,
      challengingTxHash,
      respondingBlockNum,
      respondingTx,
      from: this.ethAddress,
      gas: this._defaultGas
    })
  }
}
