# MetaMask Smart Account Demo

A React application demonstrating how to connect to MetaMask, create a MetaMask smart account, and send user operations with multiple transactions.

## Features

- Connect to MetaMask wallet
- Generate MetaMask smart account using the delegation toolkit
- Send user operations with multiple dummy transactions
- Display smart account address
- Show transaction status and user operation hash

## Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Sepolia testnet ETH for gas fees

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Make sure MetaMask is installed and you're connected to the Sepolia testnet
2. Click "Connect MetaMask Wallet" to connect your wallet and generate a smart account
3. The smart account address will be displayed
4. Click "Send User Operation" to send a bundled transaction with 3 dummy transfers
5. The user operation hash will be displayed when successful

## Configuration

The app is configured to use:
- Sepolia testnet
- Pimlico bundler for user operations
- MetaMask Hybrid implementation for smart accounts

## Files Structure

- `src/config.ts` - Configuration for smart account and bundler client
- `src/userOperation.ts` - User operation sending functionality
- `src/App.tsx` - Main React component with UI
- `src/main.tsx` - React entry point

## Note

Make sure you have test ETH on Sepolia testnet for gas fees. The app sends small amounts (0.001 ETH each) to dummy addresses for demonstration purposes.
