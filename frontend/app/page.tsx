"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, CheckCircle, XCircle, RotateCcw, Eye, Trophy } from "lucide-react"
import PayToSeeScore from "@/components/PayToSeeScore"
import ScoreDisplay from "@/components/ScoreDisplay"

// Global Farcaster ready signal - fires immediately when script loads
if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
  try {
    window.parent.postMessage({ type: 'sdk.actions.ready' }, '*')
    console.log('🌟 Global ready signal sent on script load')
  } catch (error) {
    console.warn('⚠️ Global ready signal failed:', error)
  }
}

// Question data structure
interface Question {
  id: number
  category: "Base" | "EVM" | "General"
  question: string
  options: string[]
  correctAnswer: "A" | "B" | "C" | "D"
  explanation: string
}

// Complete question pool (100 questions)
const questionPool: Question[] = [
  // Base Blockchain Questions (33 questions)
  {
    id: 1,
    category: "Base",
    question: "What is Base primarily known as in the blockchain ecosystem?",
    options: [
      "A) A Layer 1 Blockchain",
      "B) A Centralized Exchange",
      "C) An Ethereum Layer 2 Scaling Solution",
      "D) A Bitcoin Sidechain",
    ],
    correctAnswer: "C",
    explanation: "Base is an Ethereum Layer 2 scaling solution built by Coinbase.",
  },
  {
    id: 2,
    category: "Base",
    question: "Which major cryptocurrency company incubated the Base blockchain?",
    options: ["A) Binance", "B) Ripple", "C) Coinbase", "D) ConsenSys"],
    correctAnswer: "C",
    explanation: "Base was developed and incubated by Coinbase.",
  },
  {
    id: 3,
    category: "Base",
    question: "What open-source framework does Base leverage for its architecture?",
    options: ["A) Polkadot Substrate", "B) Cosmos SDK", "C) Optimism OP Stack", "D) Arbitrum Nitro"],
    correctAnswer: "C",
    explanation: "Base is built on the Optimism OP Stack framework.",
  },
  {
    id: 4,
    category: "Base",
    question: "What scaling technology does Base utilize to bundle transactions off-chain?",
    options: ["A) Zero-Knowledge Proofs", "B) State Channels", "C) Optimistic Rollups", "D) Sidechains"],
    correctAnswer: "C",
    explanation: "Base uses Optimistic Rollups to bundle transactions off-chain.",
  },
  {
    id: 5,
    category: "Base",
    question: "What is a key benefit of building applications on Base?",
    options: [
      "A) High transaction fees",
      "B) Limited EVM compatibility",
      "C) Seamless migration of existing Ethereum projects",
      "D) Centralized control over dApps",
    ],
    correctAnswer: "C",
    explanation: "Base's EVM compatibility allows seamless migration of existing Ethereum projects.",
  },
  {
    id: 6,
    category: "Base",
    question:
      "Base aims to facilitate 'sub-cent global payments' and foster 'creator-first monetization' as part of its purpose to onboard users to what?",
    options: [
      "A) Traditional banking systems",
      "B) Centralized exchanges",
      "C) On-chain activities",
      "D) Off-chain databases",
    ],
    correctAnswer: "C",
    explanation: "Base's mission is to onboard users to on-chain activities and Web3.",
  },
  {
    id: 7,
    category: "Base",
    question: "Base inherits robust security features from which blockchain?",
    options: ["A) Bitcoin", "B) Solana", "C) Ethereum mainnet", "D) Polkadot"],
    correctAnswer: "C",
    explanation: "Base inherits security from Ethereum mainnet as a Layer 2 solution.",
  },
  {
    id: 8,
    category: "Base",
    question:
      "What is the approximate transaction per second (TPS) capacity of Base, significantly higher than Ethereum's native capacity?",
    options: ["A) 15-20 TPS", "B) 100-200 TPS", "C) 1429-2000 TPS", "D) 5000+ TPS"],
    correctAnswer: "C",
    explanation: "Base can handle approximately 1429-2000 TPS, much higher than Ethereum's ~15 TPS.",
  },
  {
    id: 9,
    category: "Base",
    question:
      "Optimistic Rollups, used by Base, assume transactions are valid unless a 'fraud-proof' is submitted during a specified dispute period. How long is this typical dispute period?",
    options: ["A) 24 hours", "B) 3 days", "C) 7 days", "D) 30 days"],
    correctAnswer: "C",
    explanation: "The typical dispute period for Optimistic Rollups is 7 days.",
  },
  {
    id: 10,
    category: "Base",
    question: "What is one of the primary reasons Base is considered developer-friendly?",
    options: [
      "A) It uses a completely new programming language",
      "B) Its full compatibility with the Ethereum Virtual Machine (EVM)",
      "C) It requires specialized hardware for development",
      "D) It has limited documentation",
    ],
    correctAnswer: "B",
    explanation: "Base's full EVM compatibility makes it developer-friendly for Ethereum developers.",
  },
  {
    id: 11,
    category: "Base",
    question: "Which of the following is a key use case for Base, as mentioned in the report?",
    options: [
      "A) Traditional stock trading",
      "B) Centralized data storage",
      "C) Deployment of AI agents interacting with on-chain data",
      "D) Off-chain fiat currency transfers",
    ],
    correctAnswer: "C",
    explanation: "Base supports deployment of AI agents that interact with on-chain data.",
  },
  {
    id: 12,
    category: "Base",
    question: "Base supports 'gasless transactions' to simplify what aspect for users?",
    options: [
      "A) Smart contract auditing",
      "B) User onboarding and experience",
      "C) Node operation",
      "D) Token minting complexity",
    ],
    correctAnswer: "B",
    explanation: "Gasless transactions simplify user onboarding and improve user experience.",
  },
  {
    id: 13,
    category: "Base",
    question: "What program does Coinbase offer to support builders on Base with weekly ETH rewards?",
    options: [
      "A) Base Accelerator Fund",
      "B) Builder Rewards Program",
      "C) Coinbase Venture Capital",
      "D) Base Ecosystem Grant",
    ],
    correctAnswer: "B",
    explanation: "Coinbase offers the Builder Rewards Program with weekly ETH rewards.",
  },
  {
    id: 14,
    category: "Base",
    question: "What is the main goal of Base's strategic development by Coinbase?",
    options: [
      "A) To replace all other Layer 2 solutions",
      "B) To facilitate mass onboarding of users into the broader Web3 ecosystem",
      "C) To become a centralized alternative to Ethereum",
      "D) To exclusively support institutional investors",
    ],
    correctAnswer: "B",
    explanation: "Base aims to facilitate mass onboarding into the Web3 ecosystem.",
  },
  {
    id: 15,
    category: "Base",
    question: "What is the primary benefit of Base's low transaction fees for developers?",
    options: [
      "A) It allows them to earn more profit from their dApps",
      "B) It encourages experimentation and innovation by reducing prohibitive expenses",
      "C) It makes their dApps exclusive to high-net-worth individuals",
      "D) It eliminates the need for smart contract audits",
    ],
    correctAnswer: "B",
    explanation: "Low fees encourage experimentation and innovation by reducing barriers.",
  },
  {
    id: 16,
    category: "Base",
    question: "Base's architecture is designed to maximize efficiency while ensuring what?",
    options: ["A) Centralization", "B) Security", "C) Anonymity", "D) Proprietary control"],
    correctAnswer: "B",
    explanation: "Base maximizes efficiency while maintaining security through its Layer 2 design.",
  },
  {
    id: 17,
    category: "Base",
    question:
      "What is the term for the process where Optimistic Rollups bundle multiple transactions off-chain and submit them as a single, compressed transaction to the Ethereum mainnet?",
    options: ["A) Sharding", "B) Sidechaining", "C) Batching", "D) State Channeling"],
    correctAnswer: "C",
    explanation: "Batching is the process of bundling multiple transactions into a single submission.",
  },
  {
    id: 18,
    category: "Base",
    question: "What is the primary assumption of Optimistic Rollups?",
    options: [
      "A) All transactions are invalid until proven valid",
      "B) All transactions are valid unless proven wrong",
      "C) Transactions require immediate verification",
      "D) Transactions are verified by a central authority",
    ],
    correctAnswer: "B",
    explanation: "Optimistic Rollups assume transactions are valid unless proven otherwise.",
  },
  {
    id: 19,
    category: "Base",
    question: "What kind of funding does Base offer to builders that is described as 'fast, retroactive'?",
    options: ["A) Seed funding", "B) Venture capital", "C) Base Builder Grants", "D) Equity investments"],
    correctAnswer: "C",
    explanation: "Base offers fast, retroactive Base Builder Grants to support developers.",
  },
  {
    id: 20,
    category: "Base",
    question: "What is one of the key advantages of Base's EVM compatibility for developers?",
    options: [
      "A) It forces them to learn new programming languages",
      "B) It streamlines the development process and enhances productivity",
      "C) It limits their dApp deployment to a single chain",
      "D) It increases the complexity of smart contract migration",
    ],
    correctAnswer: "B",
    explanation: "EVM compatibility streamlines development and enhances productivity.",
  },
  {
    id: 21,
    category: "Base",
    question:
      "Base's focus on 'regulatory compliance and institutional adoption' is a benefit primarily due to the influence of which entity?",
    options: [
      "A) Ethereum Foundation",
      "B) Optimism Collective",
      "C) Coinbase",
      "D) Decentralized Autonomous Organizations (DAOs)",
    ],
    correctAnswer: "C",
    explanation: "Coinbase's influence brings regulatory compliance and institutional adoption focus.",
  },
  {
    id: 22,
    category: "Base",
    question: "What is the purpose of 'Dynamic Fraud Proofs' in optimistic rollups, as mentioned in the research?",
    options: [
      "A) To increase the challenge window to 30 days",
      "B) To achieve sub-second finality in ideal scenarios",
      "C) To eliminate the need for any dispute resolution",
      "D) To centralize transaction verification",
    ],
    correctAnswer: "B",
    explanation: "Dynamic Fraud Proofs aim to achieve sub-second finality in ideal scenarios.",
  },
  {
    id: 23,
    category: "Base",
    question: "What does Base aim to provide for creators, as part of its monetization strategy?",
    options: [
      "A) Traditional advertising revenue",
      "B) Creator-first monetization",
      "C) Centralized content distribution",
      "D) Off-chain royalty payments",
    ],
    correctAnswer: "B",
    explanation: "Base focuses on creator-first monetization strategies.",
  },
  {
    id: 24,
    category: "Base",
    question:
      "What is the term for the process of uniquely publishing a token on the blockchain to make it tradable, often handled by open marketplaces on Base?",
    options: ["A) Burning", "B) Staking", "C) Minting", "D) Swapping"],
    correctAnswer: "C",
    explanation: "Minting is the process of creating and publishing tokens on the blockchain.",
  },
  {
    id: 25,
    category: "Base",
    question:
      "Base is described as an 'open stack' that empowers builders, creators, and people everywhere to do what?",
    options: [
      "A) Only trade cryptocurrencies",
      "B) Build apps, grow businesses, create what they love, and earn onchain",
      "C) Operate centralized financial institutions",
      "D) Develop proprietary blockchain solutions only",
    ],
    correctAnswer: "B",
    explanation: "Base empowers users to build, create, and earn in the on-chain economy.",
  },
  {
    id: 26,
    category: "Base",
    question:
      "What kind of wallets are Smart Wallets on Base designed to be, facilitating user sign-up and sign-in processes?",
    options: [
      "A) Hardware-only wallets",
      "B) Universal accounts for the on-chain world",
      "C) Fiat-only wallets",
      "D) Centralized exchange accounts",
    ],
    correctAnswer: "B",
    explanation: "Smart Wallets serve as universal accounts for the on-chain world.",
  },
  {
    id: 27,
    category: "Base",
    question:
      "What is one of the key components of Base's Layer-2 architecture, as mentioned in the report, that bundles multiple transactions?",
    options: ["A) Shards", "B) Sidechains", "C) Rollups", "D) State Channels"],
    correctAnswer: "C",
    explanation: "Rollups are key components that bundle multiple transactions in Base's architecture.",
  },
  {
    id: 28,
    category: "Base",
    question: "What is the primary goal of Base's scalability features?",
    options: [
      "A) To limit the number of dApps",
      "B) To increase transaction fees",
      "C) To support a growing number of dApps and users",
      "D) To reduce network security",
    ],
    correctAnswer: "C",
    explanation: "Base's scalability features aim to support growing numbers of dApps and users.",
  },
  {
    id: 29,
    category: "Base",
    question:
      "What is the term for the process where a Layer 2 solution like Base handles transactions off-chain and then sends the data back to be recorded on the main blockchain?",
    options: [
      "A) On-chain processing",
      "B) Off-chain execution",
      "C) Direct Layer 1 interaction",
      "D) Centralized validation",
    ],
    correctAnswer: "B",
    explanation: "Off-chain execution describes Layer 2 transaction processing before mainnet recording.",
  },
  {
    id: 30,
    category: "Base",
    question: "What is one of the benefits of Base being built on the Optimism OP Stack?",
    options: [
      "A) It makes Base a Layer 1 blockchain",
      "B) It enhances decentralization and scalability",
      "C) It restricts Base to a closed ecosystem",
      "D) It removes the need for smart contracts",
    ],
    correctAnswer: "B",
    explanation: "The OP Stack enhances decentralization and scalability for Base.",
  },
  {
    id: 31,
    category: "Base",
    question: "What is the primary purpose of the 'challenge window' in Optimistic Rollups?",
    options: [
      "A) To speed up transaction finality",
      "B) To allow honest network validators to submit fraud proofs",
      "C) To increase transaction fees",
      "D) To prevent any transactions from being reverted",
    ],
    correctAnswer: "B",
    explanation: "The challenge window allows validators to submit fraud proofs if needed.",
  },
  {
    id: 32,
    category: "Base",
    question: "What kind of social networks does Base encourage using to grow applications and connect with users?",
    options: [
      "A) Centralized social media platforms",
      "B) Decentralized social graphs",
      "C) Private, invite-only networks",
      "D) Traditional email lists",
    ],
    correctAnswer: "B",
    explanation: "Base encourages using decentralized social graphs for user connection.",
  },
  {
    id: 33,
    category: "Base",
    question:
      "What is the name of the global program from Base that aims to foster the development of the next wave of on-chain applications?",
    options: ["A) Base Launchpad", "B) Base Innovators Guild", "C) Base Batches", "D) Base Ecosystem Fund"],
    correctAnswer: "C",
    explanation: "Base Batches is the global program fostering on-chain application development.",
  },
  // EVM Questions (33 questions)
  {
    id: 34,
    category: "EVM",
    question: "What is the primary function of the Ethereum Virtual Machine (EVM)?",
    options: [
      "A) To mine new Ether",
      "B) To store user data off-chain",
      "C) To execute smart contracts",
      "D) To manage cryptocurrency exchanges",
    ],
    correctAnswer: "C",
    explanation: "The EVM's primary function is to execute smart contracts on the Ethereum network.",
  },
  {
    id: 35,
    category: "EVM",
    question: "What programming language is most commonly used to write smart contracts for the EVM?",
    options: ["A) Python", "B) Java", "C) Solidity", "D) C++"],
    correctAnswer: "C",
    explanation: "Solidity is the most commonly used programming language for EVM smart contracts.",
  },
  {
    id: 36,
    category: "EVM",
    question: "What does 'gas' represent in the context of EVM transactions?",
    options: [
      "A) A unit of cryptocurrency",
      "B) A measure of computational effort required",
      "C) A type of smart contract",
      "D) A network security protocol",
    ],
    correctAnswer: "B",
    explanation: "Gas measures the computational effort required to execute operations on the EVM.",
  },
  {
    id: 37,
    category: "EVM",
    question: "What does it mean for the EVM to be 'Turing-complete'?",
    options: [
      "A) It can only perform basic arithmetic operations",
      "B) It can run any program",
      "C) It requires human intervention for execution",
      "D) It is limited to specific hardware",
    ],
    correctAnswer: "B",
    explanation: "Turing-complete means the EVM can theoretically run any computable program.",
  },
  {
    id: 38,
    category: "EVM",
    question: "What is the purpose of 'opcodes' in the EVM?",
    options: [
      "A) They are cryptographic keys",
      "B) They are smart contract addresses",
      "C) They are single-byte instructions the EVM executes",
      "D) They are network consensus mechanisms",
    ],
    correctAnswer: "C",
    explanation: "Opcodes are single-byte instructions that the EVM executes to perform operations.",
  },
  {
    id: 39,
    category: "EVM",
    question: "The EVM operates as a 'state machine,' meaning it changes Ethereum's global state in response to what?",
    options: [
      "A) Network traffic fluctuations",
      "B) Execution of smart contracts",
      "C) External market prices",
      "D) User interface interactions",
    ],
    correctAnswer: "B",
    explanation: "The EVM changes Ethereum's global state through smart contract execution.",
  },
  {
    id: 40,
    category: "EVM",
    question: "What is the primary reason the EVM is designed as a 'sandboxed and isolated environment'?",
    options: [
      "A) To allow direct access to external systems",
      "B) To enhance security and predictability",
      "C) To enable faster transaction processing",
      "D) To reduce gas costs",
    ],
    correctAnswer: "B",
    explanation: "The sandboxed environment enhances security and ensures predictable execution.",
  },
  {
    id: 41,
    category: "EVM",
    question: "What is the 'world state' within Ethereum, as managed by the EVM?",
    options: [
      "A) A record of all past transactions",
      "B) A comprehensive mapping between addresses (accounts) and their respective account states",
      "C) The total supply of Ether in circulation",
      "D) A list of all active network nodes",
    ],
    correctAnswer: "B",
    explanation: "The world state maps addresses to their account states, managed by the EVM.",
  },
  {
    id: 42,
    category: "EVM",
    question:
      "What data structure is used to efficiently store Ethereum's global state, allowing it to be reduced to a single root hash?",
    options: ["A) Linked List", "B) Hash Table", "C) Modified Merkle Patricia Trie", "D) Binary Tree"],
    correctAnswer: "C",
    explanation: "Ethereum uses a Modified Merkle Patricia Trie to store the global state efficiently.",
  },
  {
    id: 43,
    category: "EVM",
    question: "What is the 'Ethereum State Transition Function (STF)' responsible for?",
    options: [
      "A) Defining new opcodes for the EVM",
      "B) Deterministically producing a new state (S') given a current state (S) and a transaction (T)",
      "C) Calculating the total gas consumed by a block",
      "D) Managing the peer-to-peer network connections",
    ],
    correctAnswer: "B",
    explanation: "The STF deterministically produces new states from current states and transactions.",
  },
  {
    id: 44,
    category: "EVM",
    question: "What is the maximum depth of the EVM's stack, where each item is a 256-bit word?",
    options: ["A) 64 items", "B) 256 items", "C) 1024 items", "D) Unlimited"],
    correctAnswer: "C",
    explanation: "The EVM stack has a maximum depth of 1024 items, each being a 256-bit word.",
  },
  {
    id: 45,
    category: "EVM",
    question:
      "What type of data in the EVM is temporary, linear, and volatile, meaning it does not persist across transactions?",
    options: ["A) Storage", "B) World State", "C) Memory", "D) Account State"],
    correctAnswer: "C",
    explanation: "Memory in the EVM is temporary and volatile, not persisting across transactions.",
  },
  {
    id: 46,
    category: "EVM",
    question: "What is the primary purpose of the gas system in the EVM?",
    options: [
      "A) To generate new Ether",
      "B) To prevent network abuse (e.g., spam attacks) and ensure fair resource allocation",
      "C) To provide a fixed income for validators",
      "D) To determine the block difficulty",
    ],
    correctAnswer: "B",
    explanation: "The gas system prevents network abuse and ensures fair resource allocation.",
  },
  {
    id: 47,
    category: "EVM",
    question: "What happens if a transaction runs out of gas during execution in the EVM?",
    options: [
      "A) The transaction is partially completed",
      "B) The transaction is paused until more gas is added",
      "C) The transaction reverts, but the gas is still spent",
      "D) The transaction is automatically re-executed with higher gas",
    ],
    correctAnswer: "C",
    explanation: "When gas runs out, the transaction reverts but the gas fee is still consumed.",
  },
  {
    id: 48,
    category: "EVM",
    question: "What is the significance of EVM compatibility for other blockchain networks?",
    options: [
      "A) It forces them to use Ethereum's consensus mechanism",
      "B) It allows them to seamlessly run applications and deploy smart contracts originally developed for Ethereum",
      "C) It makes them centralized",
      "D) It limits their functionality to simple token transfers",
    ],
    correctAnswer: "B",
    explanation: "EVM compatibility allows other networks to run Ethereum applications seamlessly.",
  },
  {
    id: 49,
    category: "EVM",
    question: "What is a key benefit for developers when building on EVM-compatible blockchains?",
    options: [
      "A) They must learn entirely new programming languages for each chain",
      "B) They can leverage their existing knowledge of Solidity and other Ethereum-based tools",
      "C) They are restricted to a single blockchain network",
      "D) They face higher transaction costs",
    ],
    correctAnswer: "B",
    explanation: "Developers can use existing Solidity knowledge across EVM-compatible chains.",
  },
  {
    id: 50,
    category: "EVM",
    question:
      "What is the term for the machine-readable instruction set for the EVM, into which high-level smart contracts are compiled?",
    options: ["A) Source Code", "B) Assembly Language", "C) Bytecode", "D) Pseudocode"],
    correctAnswer: "C",
    explanation: "Smart contracts are compiled into bytecode for EVM execution.",
  },
  {
    id: 51,
    category: "EVM",
    question: "What is the role of the 'Program Counter (PC)' in the EVM?",
    options: [
      "A) It calculates the gas cost of operations",
      "B) It tracks the next EVM instruction (opcode) to be executed",
      "C) It manages the network's peer-to-peer connections",
      "D) It stores permanent data on the blockchain",
    ],
    correctAnswer: "B",
    explanation: "The Program Counter tracks the next instruction to be executed in the EVM.",
  },
  {
    id: 52,
    category: "EVM",
    question: "What is the primary difference in how EVM and Cosmos state transitions charge gas?",
    options: [
      "A) EVM uses a flat fee per transaction, while Cosmos uses a percentage",
      "B) EVM uses a gas table for each OPCODE, while Cosmos uses a GasConfig for each CRUD operation",
      "C) EVM charges gas for storage only, while Cosmos charges for computation",
      "D) EVM has no gas, while Cosmos has fixed gas",
    ],
    correctAnswer: "B",
    explanation: "EVM uses gas tables for opcodes, while Cosmos uses GasConfig for CRUD operations.",
  },
  {
    id: 53,
    category: "EVM",
    question: "What is the maximum contract size that can be deployed (stored) on Ethereum?",
    options: ["A) 1 MB", "B) 10 KB", "C) 24,576 bytes (24KB)", "D) Unlimited"],
    correctAnswer: "C",
    explanation: "The maximum contract size on Ethereum is 24,576 bytes (24KB).",
  },
  {
    id: 54,
    category: "EVM",
    question: "What is the primary purpose of the 'PriorityFee' in EVM transactions, as part of EIP-1559?",
    options: [
      "A) To reduce the total transaction cost",
      "B) To go to the proposer as a tip or incentive to include the transaction in a block",
      "C) To cover the cost of data storage",
      "D) To refund users for failed transactions",
    ],
    correctAnswer: "B",
    explanation: "The PriorityFee serves as a tip to incentivize block proposers to include transactions.",
  },
  {
    id: 55,
    category: "EVM",
    question: "What is the term for the unique identifier for a deployed smart contract on the Ethereum network?",
    options: ["A) Transaction ID", "B) Block Hash", "C) Unique Address", "D) Gas Limit"],
    correctAnswer: "C",
    explanation: "Each deployed smart contract has a unique address on the Ethereum network.",
  },
  {
    id: 56,
    category: "EVM",
    question:
      "What is the main characteristic of the EVM's output, ensuring transaction predictability and network integrity?",
    options: ["A) Randomness", "B) Determinism", "C) Variability", "D) Centralization"],
    correctAnswer: "B",
    explanation: "The EVM's deterministic output ensures predictability and network integrity.",
  },
  {
    id: 57,
    category: "EVM",
    question: "What is the primary function of the 'Storage' component in the EVM?",
    options: [
      "A) To hold inputs and outputs of smart contract instructions temporarily",
      "B) To store temporary, linear data during contract execution",
      "C) To provide persistent and modifiable state for accounts and smart contracts",
      "D) To track the next opcode to be executed",
    ],
    correctAnswer: "C",
    explanation: "Storage provides persistent, modifiable state for accounts and smart contracts.",
  },
  {
    id: 58,
    category: "EVM",
    question:
      "What is the role of 'Geth' (go-Ethereum) in the context of the EVM and Ethereum's State Transition Function?",
    options: [
      "A) It is a high-level programming language for smart contracts",
      "B) It is a primary client implementation that embodies the STF and EVM execution engine",
      "C) It is a consensus mechanism used by Ethereum",
      "D) It is a tool for calculating gas costs",
    ],
    correctAnswer: "B",
    explanation: "Geth is a primary Ethereum client implementation containing the STF and EVM.",
  },
  {
    id: 59,
    category: "EVM",
    question: "What is the purpose of the 'gas limit' in an EVM transaction?",
    options: [
      "A) To set the minimum gas price",
      "B) To define the maximum computational steps allowed for the transaction's execution",
      "C) To determine the transaction's priority",
      "D) To specify the amount of Ether to be transferred",
    ],
    correctAnswer: "B",
    explanation: "Gas limit defines the maximum computational steps allowed for transaction execution.",
  },
  {
    id: 60,
    category: "EVM",
    question: "What is the primary benefit of EVM compatibility for decentralized applications (dApps)?",
    options: [
      "A) It restricts dApps to a single blockchain",
      "B) It allows dApps to be easily deployed across multiple EVM-compatible chains",
      "C) It increases the development time for dApps",
      "D) It removes the need for smart contracts in dApps",
    ],
    correctAnswer: "B",
    explanation: "EVM compatibility allows easy deployment across multiple compatible chains.",
  },
  {
    id: 61,
    category: "EVM",
    question:
      "What is the term for the process where smart contracts, written in high-level languages like Solidity, are converted into EVM bytecode?",
    options: ["A) Interpretation", "B) Compilation", "C) Execution", "D) Validation"],
    correctAnswer: "B",
    explanation: "Compilation converts high-level smart contract code into EVM bytecode.",
  },
  {
    id: 62,
    category: "EVM",
    question: "What is the primary incentive for miners (or validators) to process transactions on the EVM?",
    options: [
      "A) To reduce their own transaction fees",
      "B) To earn gas fees",
      "C) To gain control of the network",
      "D) To increase the block size",
    ],
    correctAnswer: "B",
    explanation: "Miners/validators are incentivized by earning gas fees from transaction processing.",
  },
  {
    id: 63,
    category: "EVM",
    question: "What is the purpose of the 'Stack' in the EVM's architecture?",
    options: [
      "A) To store persistent data",
      "B) To hold inputs and outputs of smart contract instructions",
      "C) To manage network connections",
      "D) To track the global state",
    ],
    correctAnswer: "B",
    explanation: "The Stack holds inputs and outputs of smart contract instructions during execution.",
  },
  {
    id: 64,
    category: "EVM",
    question: "What is the primary reason for the 'gas' system in the EVM, as it relates to network resources?",
    options: [
      "A) To make transactions free",
      "B) To ensure fair allocation and usage of computational resources",
      "C) To increase network latency",
      "D) To centralize resource control",
    ],
    correctAnswer: "B",
    explanation: "The gas system ensures fair allocation and usage of computational resources.",
  },
  {
    id: 65,
    category: "EVM",
    question:
      "What is the term for the process where the EVM ensures that, given the same input, it consistently produces the same output across all Ethereum client implementations?",
    options: ["A) Randomization", "B) Non-determinism", "C) Deterministic output", "D) Probabilistic outcome"],
    correctAnswer: "C",
    explanation: "Deterministic output ensures consistent results across all client implementations.",
  },
  {
    id: 66,
    category: "EVM",
    question: "What is the primary benefit of EVM compatibility for blockchains themselves?",
    options: [
      "A) It limits their functionality",
      "B) It enhances their functionality and reach by interoperating with Ethereum",
      "C) It makes them less secure",
      "D) It increases their development complexity",
    ],
    correctAnswer: "B",
    explanation: "EVM compatibility enhances blockchain functionality and Ethereum interoperability.",
  },
  // General Crypto Terms Questions (34 questions)
  {
    id: 67,
    category: "General",
    question: "What is a blockchain?",
    options: [
      "A) A centralized database",
      "B) A type of digital currency",
      "C) A decentralized digital ledger",
      "D) A specific smart contract",
    ],
    correctAnswer: "C",
    explanation: "A blockchain is a decentralized digital ledger that records transactions across multiple computers.",
  },
  {
    id: 68,
    category: "General",
    question: "What does 'non-fungible' mean in the context of NFTs?",
    options: [
      "A) It can be exchanged for an identical item",
      "B) It is a stable asset",
      "C) It is unique and cannot be replaced by an identical item",
      "D) It has no real-world value",
    ],
    correctAnswer: "C",
    explanation: "Non-fungible means unique and irreplaceable, which is the key characteristic of NFTs.",
  },
  {
    id: 69,
    category: "General",
    question: "What is the primary goal of Decentralized Finance (DeFi)?",
    options: [
      "A) To centralize financial control",
      "B) To replace traditional banks with intermediaries",
      "C) To offer peer-to-peer financial services on public blockchains",
      "D) To create new fiat currencies",
    ],
    correctAnswer: "C",
    explanation: "DeFi aims to provide peer-to-peer financial services without traditional intermediaries.",
  },
  {
    id: 70,
    category: "General",
    question:
      "Which consensus mechanism relies on participants 'staking' their digital tokens to validate transactions?",
    options: [
      "A) Proof-of-Work (PoW)",
      "B) Proof-of-Stake (PoS)",
      "C) Proof of Capacity (PoC)",
      "D) Proof of Authority (PoA)",
    ],
    correctAnswer: "B",
    explanation: "Proof-of-Stake requires participants to stake tokens to validate transactions.",
  },
  {
    id: 71,
    category: "General",
    question:
      "What type of crypto scam involves developers abandoning a project after collecting funds, leaving investors without recourse?",
    options: ["A) Phishing scam", "B) Pump and dump scheme", "C) Pig butchering scam", "D) Rug pull"],
    correctAnswer: "D",
    explanation: "A rug pull occurs when developers abandon a project after collecting investor funds.",
  },
  {
    id: 72,
    category: "General",
    question: "What is a 'private key' in cryptocurrency?",
    options: [
      "A) A public address for receiving funds",
      "B) A password that allows access to and management of crypto funds",
      "C) A type of digital currency",
      "D) A network validator",
    ],
    correctAnswer: "B",
    explanation: "A private key is a cryptographic password that allows access to cryptocurrency funds.",
  },
  {
    id: 73,
    category: "General",
    question:
      "Which term describes a digital currency whose value is pegged to an external reference, like the U.S. dollar?",
    options: ["A) Altcoin", "B) Stablecoin", "C) Meme coin", "D) Governance token"],
    correctAnswer: "B",
    explanation: "Stablecoins are designed to maintain stable value by pegging to external references.",
  },
  {
    id: 74,
    category: "General",
    question: "What is a DEX?",
    options: [
      "A) A centralized exchange platform",
      "B) A decentralized exchange for peer-to-peer token swaps",
      "C) A type of hardware wallet",
      "D) A blockchain oracle",
    ],
    correctAnswer: "B",
    explanation: "A DEX (Decentralized Exchange) enables peer-to-peer cryptocurrency trading without intermediaries.",
  },
  {
    id: 75,
    category: "General",
    question: "What is a 'Sybil attack' in crypto security?",
    options: [
      "A) A type of malware that steals private keys",
      "B) A security breach where a single entity creates multiple fraudulent nodes",
      "C) A scheme to artificially inflate token prices",
      "D) A method for recovering lost funds",
    ],
    correctAnswer: "B",
    explanation:
      "A Sybil attack involves creating multiple fake identities to gain disproportionate network influence.",
  },
  {
    id: 76,
    category: "General",
    question: "What is a 'whitepaper' in the context of a cryptocurrency project?",
    options: [
      "A) A legal document for regulatory compliance",
      "B) A detailed technical and financial treatise for the project",
      "C) A marketing brochure for investors",
      "D) A record of all past transactions",
    ],
    correctAnswer: "B",
    explanation: "A whitepaper is a comprehensive document outlining a project's technical and financial details.",
  },
  {
    id: 77,
    category: "General",
    question: "What is 'Yield Farming' in DeFi?",
    options: [
      "A) A method for cryptocurrency holders to generate passive income by locking their tokens in various DeFi protocols",
      "B) A process of creating new cryptocurrencies",
      "C) A type of agricultural investment using blockchain",
      "D) A way to reduce transaction fees",
    ],
    correctAnswer: "A",
    explanation: "Yield farming involves locking tokens in DeFi protocols to earn rewards and passive income.",
  },
  {
    id: 78,
    category: "General",
    question: "What is the primary characteristic of blockchain data once it's added to the chain?",
    options: [
      "A) It can be easily altered by any node",
      "B) It is mutable and temporary",
      "C) It is irreversible and immutable",
      "D) It is only visible to a central authority",
    ],
    correctAnswer: "C",
    explanation: "Blockchain data is immutable and irreversible once confirmed and added to the chain.",
  },
  {
    id: 79,
    category: "General",
    question: "What is 'GameFi'?",
    options: [
      "A) A new type of cryptocurrency exchange",
      "B) A fusion of online gaming with decentralized finance, often incorporating play-to-earn models",
      "C) A platform for traditional video games",
      "D) A financial service for game developers only",
    ],
    correctAnswer: "B",
    explanation: "GameFi combines gaming with DeFi, often featuring play-to-earn mechanics.",
  },
  {
    id: 80,
    category: "General",
    question: "What is a 'recovery phrase' (or 'seed phrase') used for in cryptocurrency?",
    options: [
      "A) To send transactions",
      "B) To recover access to funds if a wallet is lost or compromised",
      "C) To verify a transaction's authenticity",
      "D) To connect to a centralized exchange",
    ],
    correctAnswer: "B",
    explanation: "Recovery phrases allow users to restore wallet access if their device is lost or compromised.",
  },
  {
    id: 81,
    category: "General",
    question: "What is the main disadvantage of Proof-of-Work (PoW) consensus mechanisms?",
    options: [
      "A) Low security",
      "B) High energy consumption and processing times",
      "C) Centralization",
      "D) Inability to prevent double-spending",
    ],
    correctAnswer: "B",
    explanation: "PoW requires significant energy consumption and has slower processing times.",
  },
  {
    id: 82,
    category: "General",
    question: "What is a 'phishing scam' in the crypto space?",
    options: [
      "A) Artificially inflating a token's price",
      "B) Creating deceptive websites or emails to trick users into revealing sensitive information",
      "C) Abandoning a project after collecting funds",
      "D) Stealing funds through malware",
    ],
    correctAnswer: "B",
    explanation: "Phishing scams use deceptive communications to steal sensitive information like private keys.",
  },
  {
    id: 83,
    category: "General",
    question: "What is a 'blockchain oracle'?",
    options: [
      "A) A type of cryptocurrency wallet",
      "B) An entity that connects blockchains to external systems, enabling smart contracts to interact with real-world data",
      "C) A consensus mechanism",
      "D) A decentralized exchange",
    ],
    correctAnswer: "B",
    explanation: "Oracles provide external data to smart contracts, bridging blockchain and real-world information.",
  },
  {
    id: 84,
    category: "General",
    question: "What does 'FOMO' stand for in the context of crypto investing?",
    options: [
      "A) Future of Money Online",
      "B) Fear Of Missing Out",
      "C) Financial Opportunity Management Organization",
      "D) First-Order Market Operations",
    ],
    correctAnswer: "B",
    explanation: "FOMO (Fear Of Missing Out) describes the anxiety of missing profitable investment opportunities.",
  },
  {
    id: 85,
    category: "General",
    question: "What is 'Proof of Capacity (PoC)'?",
    options: [
      "A) A consensus mechanism that uses computational power",
      "B) A consensus mechanism that uses available hard drive space to decide mining rights",
      "C) A mechanism for staking tokens",
      "D) A method for burning coins",
    ],
    correctAnswer: "B",
    explanation: "Proof of Capacity uses available storage space rather than computational power for consensus.",
  },
  {
    id: 86,
    category: "General",
    question: "What is 'Proof of Authority (PoA)'?",
    options: [
      "A) A consensus mechanism where participants stake digital tokens",
      "B) A consensus mechanism where transactions are validated by approved accounts (validators) based on identity/reputation",
      "C) A mechanism that requires solving complex cryptographic puzzles",
      "D) A method for burning coins",
    ],
    correctAnswer: "B",
    explanation: "PoA relies on pre-approved validators with established identities and reputations.",
  },
  {
    id: 87,
    category: "General",
    question: "What is 'Proof of Burn (PoB)'?",
    options: [
      "A) A consensus mechanism that requires participants to stake tokens",
      "B) A consensus mechanism that involves irreversibly removing a certain number of coins from circulation",
      "C) A method for increasing the supply of a cryptocurrency",
      "D) A way to reduce transaction fees",
    ],
    correctAnswer: "B",
    explanation: "Proof of Burn requires destroying coins to participate in consensus, reducing total supply.",
  },
  {
    id: 88,
    category: "General",
    question: "What is a 'digital wallet' in cryptocurrency?",
    options: [
      "A) A physical device for storing cash",
      "B) Software programs that securely store private keys, public keys, and addresses to manage cryptocurrency",
      "C) A centralized bank account",
      "D) A platform for trading stocks",
    ],
    correctAnswer: "B",
    explanation: "Digital wallets are software that manage cryptographic keys and addresses for cryptocurrency.",
  },
  {
    id: 89,
    category: "General",
    question: "What is 'Gwei'?",
    options: [
      "A) A type of stablecoin",
      "B) A commonly used denomination of Ether (ETH), often used to express gas prices",
      "C) A new blockchain network",
      "D) A consensus mechanism",
    ],
    correctAnswer: "B",
    explanation: "Gwei is a denomination of Ether commonly used to express gas prices (1 ETH = 1 billion Gwei).",
  },
  {
    id: 90,
    category: "General",
    question: "What is a 'pump and dump' scheme?",
    options: [
      "A) A legitimate investment strategy",
      "B) A scheme where perpetrators artificially inflate the price of a cryptocurrency and then sell off their holdings",
      "C) A method for decentralized governance",
      "D) A way to provide liquidity to exchanges",
    ],
    correctAnswer: "B",
    explanation:
      "Pump and dump schemes artificially inflate prices before selling, leaving other investors with losses.",
  },
  {
    id: 91,
    category: "General",
    question: "What is 'Total Value Locked (TVL)' in DeFi?",
    options: [
      "A) The total number of transactions processed",
      "B) The total amount of underlying supply that a specific decentralized application or protocol is actively securing or holding",
      "C) The total market capitalization of a cryptocurrency",
      "D) The total number of users on a platform",
    ],
    correctAnswer: "B",
    explanation: "TVL measures the total value of assets locked in a DeFi protocol or application.",
  },
  {
    id: 92,
    category: "General",
    question: "What is 'Impermanent Loss' in DeFi?",
    options: [
      "A) A guaranteed profit from providing liquidity",
      "B) A risk that occurs when providing liquidity to DeFi liquidity pools, where the value of deposited assets fluctuates relative to when they were deposited",
      "C) A type of insurance policy for smart contracts",
      "D) A method for reducing gas fees",
    ],
    correctAnswer: "B",
    explanation: "Impermanent loss occurs when asset prices change after depositing in liquidity pools.",
  },
  {
    id: 93,
    category: "General",
    question: "What is a 'Centralized Exchange (CEX)'?",
    options: [
      "A) A platform for peer-to-peer trading without intermediaries",
      "B) A third-party platform that acts as an intermediary for buying and selling cryptocurrencies",
      "C) A type of hardware wallet",
      "D) A decentralized autonomous organization",
    ],
    correctAnswer: "B",
    explanation: "CEXs are traditional exchanges that act as intermediaries for cryptocurrency trading.",
  },
  {
    id: 94,
    category: "General",
    question: "What is 'Fiat Currency'?",
    options: [
      "A) A type of digital currency",
      "B) Any currency declared by a government to be legal tender, such as the U.S. dollar",
      "C) A cryptocurrency backed by gold",
      "D) A token used in decentralized finance",
    ],
    correctAnswer: "B",
    explanation: "Fiat currency is government-issued money not backed by physical commodities like gold.",
  },
  {
    id: 95,
    category: "General",
    question: "What is 'Blockchain Interoperability'?",
    options: [
      "A) The ability of a single blockchain to process all transactions",
      "B) The ability of different blockchain networks to communicate, share data, and transact with each other",
      "C) The process of converting one cryptocurrency to another",
      "D) The security measure that prevents double-spending",
    ],
    correctAnswer: "B",
    explanation: "Interoperability enables different blockchains to communicate and share data seamlessly.",
  },
  {
    id: 96,
    category: "General",
    question: "What is the 'NFT Floor Price'?",
    options: [
      "A) The highest price an NFT has ever sold for",
      "B) The average price of an NFT collection",
      "C) The lowest current price for an NFT within a specific collection",
      "D) The price at which an NFT was originally minted",
    ],
    correctAnswer: "C",
    explanation: "Floor price represents the lowest asking price for any NFT in a collection.",
  },
  {
    id: 97,
    category: "General",
    question: "What is the primary purpose of 'consensus mechanisms' in blockchain systems?",
    options: [
      "A) To centralize control of the network",
      "B) To achieve distributed agreement among network participants regarding the true and valid state of the ledger",
      "C) To increase transaction fees",
      "D) To enable off-chain transactions",
    ],
    correctAnswer: "B",
    explanation: "Consensus mechanisms ensure all network participants agree on the blockchain's valid state.",
  },
  {
    id: 98,
    category: "General",
    question: "What is a '51% attack'?",
    options: [
      "A) A type of phishing scam",
      "B) A potential threat to blockchain networks where a group of miners could gain control of over half of the network's mining power",
      "C) A scheme to artificially inflate token prices by 51%",
      "D) A method for recovering 51% of lost funds",
    ],
    correctAnswer: "B",
    explanation:
      "A 51% attack occurs when an entity controls majority network power, potentially allowing double-spending.",
  },
  {
    id: 99,
    category: "General",
    question: "What is the 'Mainnet' in cryptocurrency?",
    options: [
      "A) A test network for developers",
      "B) A fully functional, operational blockchain network where actual transactions take place",
      "C) A centralized server for storing cryptocurrency",
      "D) A private blockchain used by a single company",
    ],
    correctAnswer: "B",
    explanation: "Mainnet is the live, operational blockchain where real transactions and value transfers occur.",
  },
  {
    id: 100,
    category: "General",
    question: "What is the primary advice given to users to protect themselves from crypto scams?",
    options: [
      "A) Always invest in projects with anonymous developers",
      "B) Be skeptical of offers promising guaranteed profits or excessively high returns",
      "C) Share your private keys with trusted platforms",
      "D) Only use new, unaudited exchanges",
    ],
    correctAnswer: "B",
    explanation: "Being skeptical of guaranteed high returns is key to avoiding crypto scams.",
  },
]

interface QuizState {
  currentQuestion: number
  selectedAnswers: Record<number, string>
  timeRemaining: number
  quizStarted: boolean
  quizCompleted: boolean
  selectedQuestions: Question[]
  startTime: number
}

export default function BlockchainIQQuiz() {
  // Immediate Farcaster ready signal - fires as soon as component mounts
  useEffect(() => {
    const sendReadySignal = () => {
      if (typeof window !== 'undefined' && window.parent) {
        try {
          window.parent.postMessage({ type: 'sdk.actions.ready' }, '*')
          console.log('🚀 Immediate ready signal sent')
        } catch (error) {
          console.warn('⚠️ Immediate ready signal failed:', error)
        }
      }
    }
    
    // Send immediately
    sendReadySignal()
    
    // Also send on window load as backup
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        window.addEventListener('load', sendReadySignal)
        return () => window.removeEventListener('load', sendReadySignal)
      }
    }
  }, [])

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: {},
    timeRemaining: 600, // 10 minutes in seconds
    quizStarted: false,
    quizCompleted: false,
    selectedQuestions: [],
    startTime: 0,
  })
  const [showResults, setShowResults] = useState(false)
  const [showDetailedResults, setShowDetailedResults] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  // Timer effect
  useEffect(() => {
    if (quizState.quizStarted && !quizState.quizCompleted && quizState.timeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }))
      }, 1000)
      return () => clearInterval(timer)
    } else if (quizState.timeRemaining === 0 && !quizState.quizCompleted) {
      // Auto-submit when time runs out
      handleSubmitQuiz()
    }
  }, [quizState.quizStarted, quizState.quizCompleted, quizState.timeRemaining])

  // Enhanced Farcaster Mini App integration with error handling
  useEffect(() => {
    // Always try to send ready signal for Farcaster - this is safe and ensures compatibility
    if (typeof window !== 'undefined') {
      try {
        // Primary ready signal - this is the main one Farcaster looks for
        window.parent.postMessage({ type: 'sdk.actions.ready' }, '*')
        
        // Additional ready signals for compatibility
        window.parent.postMessage({ 
          type: 'farcaster_frame_ready',
          data: { ready: true }
        }, '*')
        
        // Also try direct postMessage format
        window.parent.postMessage('sdk.actions.ready', '*')
        
        console.log('✅ Farcaster ready signals sent')
        
        // Enhanced detection for additional optimizations
        const isFarcasterMiniApp = window.parent !== window || 
                                  window.location !== window.parent.location ||
                                  document.referrer.includes('farcaster') ||
                                  window.navigator.userAgent.includes('Farcaster') ||
                                  window.location.hostname.includes('farcaster')
        
        if (isFarcasterMiniApp) {
          // Set viewport for mobile optimization in Farcaster
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
          }
          
          // Optimize body for frame experience
          document.body.style.overflow = 'auto'
          ;(document.body.style as any).WebkitOverflowScrolling = 'touch'
          document.body.classList.add('farcaster-optimized')
          
          // Listen for Farcaster frame events
          const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'farcaster.frame.resize') {
              console.log('Farcaster frame resized:', event.data)
            }
          }
          
          window.addEventListener('message', handleMessage)
          
          console.log('✅ BlockIQ optimized for Farcaster Mini App environment')
          
          return () => {
            window.removeEventListener('message', handleMessage)
          }
        }
        
      } catch (error) {
        console.warn('⚠️ Farcaster integration error:', error)
        // Fallback: try again after a short delay
        setTimeout(() => {
          try {
            window.parent.postMessage({ type: 'sdk.actions.ready' }, '*')
            console.log('✅ Farcaster ready signal sent (fallback)')
          } catch (e) {
            console.warn('⚠️ Fallback ready signal failed:', e)
          }
        }, 100)
      }
    }
  }, [])

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Farcaster-optimized share functionality for Mini App environment
  const handleFarcasterShare = (score: number, totalQuestions: number) => {
    if (typeof window !== 'undefined') {
      const shareText = `🧠 I just scored ${score}/${totalQuestions} on BlockIQ - the Blockchain IQ Quiz!\n\nTest your knowledge: `
      const shareUrl = window.location.href
      
      // Try Farcaster native sharing first
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'sdk.actions.share',
          data: {
            text: shareText,
            url: shareUrl
          }
        }, '*')
      } else {
        // Fallback to standard sharing
        if (navigator.share) {
          navigator.share({
            title: 'BlockIQ Quiz Results',
            text: shareText,
            url: shareUrl
          })
        } else {
          navigator.clipboard.writeText(shareText + shareUrl)
          alert('Results copied to clipboard!')
        }
      }
    }
  }

  // Enhanced Mobile-First Design Helper for Farcaster
  const isMobileView = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 || window.navigator.userAgent.includes('Farcaster')
    }
    return false
  }

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (quizState.timeRemaining <= 30) return "text-red-600"
    if (quizState.timeRemaining <= 120) return "text-orange-600"
    return "text-gray-600"
  }

  // Randomly select 10 questions from the pool
  const selectRandomQuestions = useCallback(() => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 10)
  }, [])

  // Start quiz
  const startQuiz = () => {
    const selectedQuestions = selectRandomQuestions()
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      timeRemaining: 600,
      quizStarted: true,
      quizCompleted: false,
      selectedQuestions,
      startTime: Date.now(),
    })
  }

  // Handle answer selection
  const selectAnswer = (answer: string) => {
    setQuizState((prev) => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [prev.currentQuestion]: answer,
      },
    }))
  }

  // Go to next question
  const nextQuestion = () => {
    if (quizState.currentQuestion < quizState.selectedQuestions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }))
    } else {
      handleSubmitQuiz()
    }
  }

  // Calculate score
  const calculateScore = () => {
    let correctAnswers = 0
    let incorrectAnswers = 0
    quizState.selectedQuestions.forEach((question, index) => {
      const userAnswer = quizState.selectedAnswers[index]
      if (userAnswer === question.correctAnswer) {
        correctAnswers++
      } else if (userAnswer) {
        incorrectAnswers++
      }
    })
    const baseScore = 100
    const correctPoints = correctAnswers * 10
    const incorrectPenalty = incorrectAnswers * 5
    // Time bonus calculation
    const completionTime = (Date.now() - quizState.startTime) / 1000 / 60 // in minutes
    let timeBonus = 0
    if (completionTime < 5) timeBonus = 20
    else if (completionTime < 7) timeBonus = 10
    else if (completionTime < 10) timeBonus = 5
    const finalScore = Math.max(50, Math.min(150, baseScore + correctPoints - incorrectPenalty + timeBonus))
    return {
      correctAnswers,
      incorrectAnswers,
      unanswered: 10 - correctAnswers - incorrectAnswers,
      baseScore,
      correctPoints,
      incorrectPenalty,
      timeBonus,
      finalScore,
      completionTime: Math.round(completionTime * 10) / 10,
      accuracy: Math.round((correctAnswers / 10) * 100),
    }
  }

  // Submit quiz
  const handleSubmitQuiz = () => {
    setQuizState((prev) => ({
      ...prev,
      quizCompleted: true,
    }))
    setShowPayment(true)
  }

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setPaymentCompleted(true)
    setShowPayment(false)
    setShowResults(true)
  }

  // Reset quiz
  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      timeRemaining: 600,
      quizStarted: false,
      quizCompleted: false,
      selectedQuestions: [],
      startTime: 0,
    })
    setShowResults(false)
    setShowDetailedResults(false)
    setPaymentCompleted(false)
    setShowPayment(false)
  }

  const currentQuestion = quizState.selectedQuestions[quizState.currentQuestion]
  const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestion]
  const progress = ((quizState.currentQuestion + 1) / 10) * 100

  // Welcome Screen - Optimized for Farcaster Mini App
  if (!quizState.quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="flex justify-center mb-2">
                <img 
                  src="/BlockIQ.png" 
                  alt="BlockIQ Logo" 
                  className="h-16 w-16 sm:h-24 sm:w-24 rounded-full shadow-lg border-4 border-blue-200 bg-white object-cover" 
                />
              </div>
              <CardTitle className="text-2xl sm:text-4xl font-extrabold text-blue-700 tracking-tight">BlockIQ</CardTitle>
              <CardDescription className="text-sm sm:text-lg text-gray-700 max-w-lg mx-auto px-2">
                <span className="block font-semibold text-blue-600 mb-2">Blockchain IQ Quiz</span>
                Test your knowledge of blockchain, Base, EVM, and crypto concepts.<br />
                Challenge yourself, pay to see your score, and share your results!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
              <div className="bg-blue-50/80 p-4 sm:p-6 rounded-xl space-y-3 sm:space-y-4 border border-blue-100">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg">How it works:</h3>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <span>10 randomly selected questions from our comprehensive database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span>10-minute time limit with automatic submission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                    <span>IQ-style scoring system (50-150 point range)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                    <span>Pay a small ETH fee to unlock your score and detailed results</span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <Button 
                  onClick={startQuiz} 
                  size="lg" 
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all touch-manipulation"
                >
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Payment Screen - Optimized for Farcaster Mini App
  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="text-center shadow-lg">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Quiz Complete!</CardTitle>
              <CardDescription className="text-sm sm:text-base px-2">
                You've finished the BlockIQ quiz! Pay 0.0001 ETH to unlock your detailed results and share your score on Farcaster.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  🎯 <strong>What you'll get:</strong><br />
                  • Your detailed IQ score breakdown<br />
                  • Time bonus calculations<br />
                  • Review of all questions & answers<br />
                  • Shareable results for Farcaster
                </p>
              </div>
              <PayToSeeScore 
                onPaymentSuccess={handlePaymentSuccess}
                disabled={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const scoreData = calculateScore()
    // Show our new ScoreDisplay component with Farcaster sharing
    if (paymentCompleted && !showDetailedResults) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <ScoreDisplay
            score={scoreData.correctAnswers}
            totalQuestions={10}
            timeSpent={Math.floor((Date.now() - quizState.startTime) / 1000)}
            onRestart={resetQuiz}
            onShowDetailed={() => setShowDetailedResults(true)}
            onShare={() => handleFarcasterShare(scoreData.correctAnswers, 10)}
          />
        </div>
      )
    }

    if (showDetailedResults) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Detailed Results Review</CardTitle>
                  <Button variant="outline" onClick={() => setShowDetailedResults(false)}>
                    Back to Summary
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quizState.selectedQuestions.map((question, index) => {
                    const userAnswer = quizState.selectedAnswers[index]
                    const isCorrect = userAnswer === question.correctAnswer
                    const wasAnswered = userAnswer !== undefined
                    return (
                      <div key={question.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant={isCorrect ? "default" : wasAnswered ? "destructive" : "secondary"}>
                            Q{index + 1}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-3">{question.question}</p>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => {
                                const optionLetter = String.fromCharCode(65 + optionIndex) // A, B, C, D
                                const isUserAnswer = userAnswer === optionLetter
                                const isCorrectAnswer = question.correctAnswer === optionLetter
                                return (
                                  <div
                                    key={optionIndex}
                                    className={`p-2 rounded border ${
                                      isCorrectAnswer
                                        ? "bg-green-50 border-green-200 text-green-800"
                                        : isUserAnswer && !isCorrectAnswer
                                          ? "bg-red-50 border-red-200 text-red-800"
                                          : "bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                      {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                                      <span className="text-sm">{option}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            {!wasAnswered && <p className="text-sm text-gray-500 mt-2">No answer selected</p>}
                            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <p className="text-sm text-blue-800">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-8 flex justify-center">
                  <Button onClick={resetQuiz} className="px-8">
                    Take New Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Brain className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Assessment Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{scoreData.finalScore}</div>
              <p className="text-xl text-gray-700 mb-4">Blockchain IQ Score</p>
              <div className="text-sm text-gray-600">
                {scoreData.finalScore >= 130 && "Exceptional blockchain knowledge"}
                {scoreData.finalScore >= 115 && scoreData.finalScore < 130 && "Above average understanding"}
                {scoreData.finalScore >= 100 && scoreData.finalScore < 115 && "Good foundational knowledge"}
                {scoreData.finalScore >= 85 && scoreData.finalScore < 100 && "Developing understanding"}
                {scoreData.finalScore < 85 && "Room for improvement - keep learning!"}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900">Score Breakdown:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Score:</span>
                  <span>{scoreData.baseScore} points</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Correct Answers ({scoreData.correctAnswers}/10):</span>
                  <span>+{scoreData.correctPoints} points</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Incorrect Answers ({scoreData.incorrectAnswers}):</span>
                  <span>-{scoreData.incorrectPenalty} points</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>Time Bonus:</span>
                  <span>+{scoreData.timeBonus} points</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Final Score:</span>
                  <span>{scoreData.finalScore} points</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg space-y-2">
              <h3 className="font-semibold text-gray-900">Performance Summary:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="ml-2 font-medium">{scoreData.accuracy}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Completion Time:</span>
                  <span className="ml-2 font-medium">{scoreData.completionTime} min</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setShowDetailedResults(true)} variant="outline">
                Review Answers
              </Button>
              <Button onClick={resetQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Quiz Interface
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header - Compact for mobile */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">BlockIQ Assessment</h1>
          </div>
          <div className={`flex items-center gap-2 text-base sm:text-lg font-mono ${getTimerColor()}`}>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            {formatTime(quizState.timeRemaining)}
          </div>
        </div>
        {/* Progress - Enhanced for mobile */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Question {quizState.currentQuestion + 1} of 10</span>
            <Badge variant="outline" className="text-xs sm:text-sm">{currentQuestion?.category}</Badge>
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />
        </div>
        {/* Question - Mobile-optimized */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 leading-relaxed">
              {currentQuestion?.question}
            </h2>
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                const isSelected = selectedAnswer === optionLetter
                return (
                  <button
                    key={index}
                    onClick={() => selectAnswer(optionLetter)}
                    className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all duration-200 touch-manipulation ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold">
                        {optionLetter}
                      </span>
                      <span className="text-sm sm:text-base">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
        {/* Navigation - Mobile-first */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 bg-gray-50 pt-4 pb-safe">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            {selectedAnswer ? "Answer selected ✓" : "Select an answer to continue"}
          </div>
          <Button 
            onClick={nextQuestion} 
            disabled={!selectedAnswer} 
            size="lg" 
            className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold touch-manipulation disabled:opacity-50"
          >
            {quizState.currentQuestion === 9 ? "Submit Assessment" : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  )
}