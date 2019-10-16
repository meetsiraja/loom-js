/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, Signer } from "ethers";
import { Provider } from "ethers/providers";

import { Gateway } from "./Gateway";

export class GatewayFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Gateway {
    return new Contract(address, _abi, signerOrProvider) as Gateway;
  }
}

const _abi = [
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
        name: "_valIndexes",
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
    payable: true,
    stateMutability: "payable",
    type: "fallback"
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
      }
    ],
    name: "ETHReceived",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "operator",
        type: "address"
      },
      {
        indexed: false,
        name: "from",
        type: "address"
      },
      {
        indexed: false,
        name: "tokenId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "contractAddress",
        type: "address"
      },
      {
        indexed: false,
        name: "data",
        type: "bytes"
      }
    ],
    name: "ERC721Received",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "operator",
        type: "address"
      },
      {
        indexed: false,
        name: "from",
        type: "address"
      },
      {
        indexed: false,
        name: "tokenId",
        type: "uint256"
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
      },
      {
        indexed: false,
        name: "data",
        type: "bytes"
      }
    ],
    name: "ERC721XReceived",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "operator",
        type: "address"
      },
      {
        indexed: false,
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        name: "tokenTypes",
        type: "uint256[]"
      },
      {
        indexed: false,
        name: "amounts",
        type: "uint256[]"
      },
      {
        indexed: false,
        name: "contractAddress",
        type: "address"
      },
      {
        indexed: false,
        name: "data",
        type: "bytes"
      }
    ],
    name: "ERC721XBatchReceived",
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
    constant: false,
    inputs: [
      {
        name: "tokenId",
        type: "uint256"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "contractAddress",
        type: "address"
      },
      {
        name: "_valIndexes",
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
    name: "withdrawERC721X",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "uid",
        type: "uint256"
      },
      {
        name: "contractAddress",
        type: "address"
      },
      {
        name: "_valIndexes",
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
    name: "withdrawERC721",
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
        name: "_valIndexes",
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
    name: "withdrawETH",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_operator",
        type: "address"
      },
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_tokenId",
        type: "uint256"
      },
      {
        name: "_amount",
        type: "uint256"
      },
      {
        name: "_data",
        type: "bytes"
      }
    ],
    name: "onERC721XReceived",
    outputs: [
      {
        name: "",
        type: "bytes4"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_operator",
        type: "address"
      },
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_types",
        type: "uint256[]"
      },
      {
        name: "_amounts",
        type: "uint256[]"
      },
      {
        name: "_data",
        type: "bytes"
      }
    ],
    name: "onERC721XBatchReceived",
    outputs: [
      {
        name: "",
        type: "bytes4"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_operator",
        type: "address"
      },
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_uid",
        type: "uint256"
      },
      {
        name: "_data",
        type: "bytes"
      }
    ],
    name: "onERC721Received",
    outputs: [
      {
        name: "",
        type: "bytes4"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getETH",
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
    constant: true,
    inputs: [
      {
        name: "uid",
        type: "uint256"
      },
      {
        name: "contractAddress",
        type: "address"
      }
    ],
    name: "getERC721",
    outputs: [
      {
        name: "",
        type: "bool"
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
        name: "tokenId",
        type: "uint256"
      },
      {
        name: "contractAddress",
        type: "address"
      }
    ],
    name: "getERC721X",
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