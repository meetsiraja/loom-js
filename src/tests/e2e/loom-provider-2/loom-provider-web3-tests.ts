import test from 'tape'
import { waitForMillisecondsAsync, getTestUrls } from '../../helpers'

import { deployContract2 } from '../../evm-helpers'
import Web3 from 'web3'
import { LoomProvider2 } from '../../../loom-provider-2'
import { BlockType } from 'web3/eth/types'

/**
 * Requires the SimpleStore solidity contract deployed on a loomchain.
 * go-loom/examples/plugins/evmexample/contract/SimpleStore.sol
 *
 * pragma solidity ^0.4.22;
 *
 * contract SimpleStore {
 *   uint value;
 *   constructor() public {
 *       value = 10;
 *   }
 *
 *   event NewValueSet(uint indexed _value);
 *
 *   function set(uint _value) public {
 *     value = _value;
 *     emit NewValueSet(value);
 *   }
 *
 *   function get() public view returns (uint) {
 *     return value;
 *   }
 * }
 *
 *
 */

const newContractAndClient = async () => {
  const { wsEth } = getTestUrls()
  const loomProvider = new LoomProvider2(wsEth)
  const from = await loomProvider.wallet.getAddress()
  const web3 = new Web3(loomProvider)

  const contractData =
    '0x608060405234801561001057600080fd5b50600a60008190555061010e806100286000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b114604e5780636d4ce63c146078575b600080fd5b348015605957600080fd5b5060766004803603810190808035906020019092919050505060a0565b005b348015608357600080fd5b50608a60d9565b6040518082815260200191505060405180910390f35b806000819055506000547fb922f092a64f1a076de6f21e4d7c6400b6e55791cc935e7bb8e7e90f7652f15b60405160405180910390a250565b600080549050905600a165627a7a72305820b76f6c855a1f95260fc70490b16774074225da52ea165a58e95eb7a72a59d1700029'

  const ABI = [
    {
      constant: false,
      inputs: [{ name: '_value', type: 'uint256' }],
      name: 'set',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'get',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    { inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor' },
    {
      anonymous: false,
      inputs: [{ indexed: true, name: '_value', type: 'uint256' }],
      name: 'NewValueSet',
      type: 'event'
    }
  ]

  const result = await deployContract2(loomProvider, contractData)

  const contract = new web3.eth.Contract(ABI, result.contractAddress, { from })

  return { contract, web3, from, loomProvider }
}

test('LoomProvider + Web3 + Event with not matching topic', async t => {
  t.plan(2)
  const { contract, loomProvider } = await newContractAndClient()

  try {
    const newValue = 1

    contract.events.NewValueSet({ filter: { _value: [4, 5] } }, (err: Error, event: any) => {
      if (err) t.error(err)
      else {
        t.fail('should not been dispatched')
      }
    })

    const tx = await contract.methods.set(newValue).send()
    t.equal(tx.status, true, 'SimpleStore.set should return correct status')

    const resultOfGet = await contract.methods.get().call()
    t.equal(+resultOfGet, newValue, `SimpleStore.get should return correct value`)

    await waitForMillisecondsAsync(1000)
  } catch (err) {
    t.error(err)
  }

  loomProvider.disconnect()
  t.end()
})

test('LoomProvider + Web3 + Multiple event topics', async t => {
  t.plan(3)
  const { contract, loomProvider } = await newContractAndClient()
  try {
    const newValue = 1

    contract.events.NewValueSet({ filter: { _value: [1, 2, 3] } }, (err: Error, event: any) => {
      if (err) t.error(err)
      else {
        t.equal(+event.returnValues._value, newValue, `Return value should be ${newValue}`)
      }
    })

    const tx = await contract.methods.set(newValue).send()
    t.equal(tx.status, true, 'SimpleStore.set should return correct status')

    const resultOfGet = await contract.methods.get().call()
    t.equal(+resultOfGet, newValue, `SimpleStore.get should return correct value`)

    await waitForMillisecondsAsync(1000)
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + getBlockNumber', async t => {
  const { loomProvider, web3 } = await newContractAndClient()

  try {
    const blockNumber = await web3.eth.getBlockNumber()
    t.assert(typeof blockNumber === 'number', 'Block number should be a number')
  } catch (err) {
    t.error(err)
  }

  loomProvider.disconnect()
  t.end()
})

test('LoomProvider + Web3 + getBlockByNumber', async t => {
  const { loomProvider, web3 } = await newContractAndClient()
  try {
    const blockNumber = await web3.eth.getBlockNumber()
    const blockInfo = await web3.eth.getBlock(blockNumber, false)
    t.equal(blockInfo.number, blockNumber, 'Block number should be equal')
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + getBlockHash', async t => {
  const { loomProvider, web3 } = await newContractAndClient()
  try {
    const blockNumber = await web3.eth.getBlockNumber()
    const blockInfo = await web3.eth.getBlock(blockNumber, false)
    const blockInfoByHash = await web3.eth.getBlock(blockInfo.hash as BlockType, false)
    t.assert(blockInfoByHash, 'Should return block info by hash')
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + getGasPrice', async t => {
  const { loomProvider, web3 } = await newContractAndClient()
  try {
    const gasPrice = await web3.eth.getGasPrice()
    t.equal(gasPrice, '0', "Gas price isn't used on Loomchain")
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + estimateGas', async t => {
  const { loomProvider, contract } = await newContractAndClient()
  try {
    const estimateGas = await contract.methods.set(10).estimateGas()
    t.equal(estimateGas, 0, 'Gas price estimate for current call')
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + getStorageAt', async t => {
  const { loomProvider, web3, contract } = await newContractAndClient()
  try {
    const storageValue = await web3.eth.getStorageAt(contract.options.address, 0x0, 'latest')
    t.equal(
      storageValue,
      '0x000000000000000000000000000000000000000000000000000000000000000a',
      'Storage value at 0x0 for contract SimpleStore'
    )
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + getBalance', async t => {
  const { loomProvider, web3, from } = await newContractAndClient()
  try {
    const balance = await web3.eth.getBalance(from)
    t.equal(balance, '0', 'Default balance is 0')
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + getTransactionReceipt', async t => {
  const { contract, loomProvider } = await newContractAndClient()
  try {
    const newValue = 1

    const tx = await contract.methods.set(newValue).send()
    t.assert(tx.events.NewValueSet.blockHash > 0, 'blockHash should be greater than 0')
    t.equal(tx.status, true, 'SimpleStore.set should return correct status')

    await waitForMillisecondsAsync(1000)
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})

test('LoomProvider + Web3 + Logs', async t => {
  const { contract, loomProvider, web3 } = await newContractAndClient()
  try {
    const newValue = 1

    await waitForMillisecondsAsync(1000)

    const blockNum = await web3.eth.getBlockNumber()
    const tx = await contract.methods.set(newValue).send()
    t.equal(tx.status, true, 'SimpleStore.set should return correct status')

    const events = await contract.getPastEvents('NewValueSet', {
      fromBlock: blockNum
    })

    t.assert(events.length > 0, 'Should have more than 0 events')

    await waitForMillisecondsAsync(1000)
  } catch (err) {
    t.error(err)
  }

  if (loomProvider) {
    loomProvider.disconnect()
  }

  t.end()
})