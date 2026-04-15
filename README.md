# Luxury-supply-chain-blockchain-project-for-IS6200
A blockchain-based luxury supply chain traceability system using Solidity, NFTs, and MetaMask.
# Blockchain-Based Luxury Supply Chain Traceability System

A blockchain-based luxury supply chain traceability system built with smart contracts, NFTs, and wallet interaction. This project aims to improve transparency, authenticity verification, and ownership tracking across the luxury goods supply chain.

## Overview

Traditional luxury supply chains often suffer from fragmented data, limited transparency, inefficient ownership transfer, and counterfeit risks. To address these issues, this project proposes a blockchain-based traceability system that records the lifecycle of luxury goods on-chain and links each product to an NFT-based digital identity.

The system is designed to support multiple stakeholders in the supply chain, including brands, manufacturers, logistics providers, and retailers. By combining smart contracts with NFT certification, the solution enables product creation, participant authorization, status updates, ownership transfer, and product recall in a transparent and auditable manner.

## Key Features

- Authorize supply chain participants by role
- Create product records on-chain
- Mint an NFT for each product as a digital certificate
- Transfer product ownership between authorized participants
- Update product lifecycle status with trace records
- Recall products and record recall reasons on-chain
- Provide full product traceability for authenticity verification

## Core Functions

### 1. Authorize Participants
The brand authorizes other participants in the system, including manufacturers, logistics providers, and retailers.

### 2. Create Product
The brand creates a new product record with details such as product name, SKU, description, and image URL.

### 3. Mint NFT
After product creation, the system mints a unique NFT for the product as its digital identity and ownership certificate.

### 4. Transfer Product
Authorized holders can transfer product ownership to another authorized participant.

### 5. Update Product Status
The current holder can update the lifecycle status of the product, such as:
- Created
- InProduction
- Produced
- InTransit
- Shipped
- InStore
- Sold
- Recalled

### 6. Recall Product
The brand can recall a product and store the recall reason on-chain.

## System Architecture

This project uses a dual-contract architecture:

- **Supply Chain Smart Contract**
  - Manages participants
  - Stores product information
  - Records lifecycle trace data
  - Handles ownership transfer
  - Supports recall operations

- **NFT Smart Contract**
  - Mints one NFT per product
  - Maps product IDs to NFT token IDs
  - Provides NFT ownership and certificate functions

## Tech Stack

- Solidity
- Remix IDE
- MetaMask
- JavaScript / HTML / CSS
- Ethereum-compatible test network

## Project Structure

```text
project-root/
├── contracts/
│   ├── supply_chain_smart.sol
│   └── NFT.sol
├── frontend/
│   └── ...frontend files...
├── docs/
│   ├── report.pdf
│   ├── use-case-diagram.png
│   ├── class-diagram.png
│   ├── activity-diagram.png
│   ├── state-diagram.png
│   └── test-screenshots/
├── README.md
└── .gitignore
