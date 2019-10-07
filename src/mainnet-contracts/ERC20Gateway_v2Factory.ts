/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, Signer } from "ethers";
import { Provider } from "ethers/providers";

import { ERC20Gateway_v2 } from "./ERC20Gateway_v2";

export class ERC20Gateway_v2Factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC20Gateway_v2 {
    return new Contract(address, _abi, signerOrProvider) as ERC20Gateway_v2;
  }
}

const _abi = [
  {
    constant: true,
    inputs: [],
    name: "vmc",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "loomAddress",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "nonces",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        name: "_vmc",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address"
      },
      {
        indexed: false,
        name: "kind",
        type: "uint8"
      },
      {
        indexed: false,
        name: "contractAddress",
        type: "address"
      },
      {
        indexed: false,
        name: "value",
        type: "uint256"
      }
    ],
    name: "TokenWithdrawn",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "loomCoinAddress",
        type: "address"
      }
    ],
    name: "LoomCoinReceived",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "from",
        type: "address"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "contractAddress",
        type: "address"
      }
    ],
    name: "ERC20Received",
    type: "event"
  },
  {
    constant: false,
    inputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "contractAddress",
        type: "address"
      },
      {
        name: "_signersIndexes",
        type: "uint256[]"
      },
      {
        name: "_v",
        type: "uint8[]"
      },
      {
        name: "_r",
        type: "bytes32[]"
      },
      {
        name: "_s",
        type: "bytes32[]"
      }
    ],
    name: "withdrawERC20",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "contractAddress",
        type: "address"
      }
    ],
    name: "depositERC20",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "contractAddress",
        type: "address"
      }
    ],
    name: "getERC20",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];
