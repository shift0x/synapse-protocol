# Synapse Protocol

A decentralized knowledge monetization platform that enables domain experts to contribute specialized knowledge and earn rewards when AI models access that knowledge through Model Context Protocol (MCP) integrations.

Providing expert knowledge to agents allow builders to create smarter and more capable agents in less time

## Overview

Synapse Protocol creates a marketplace for expert knowledge where:

- **Experts** contribute specialized knowledge and earn rewards based on usage
- **AI Models** access high-quality, domain-specific knowledge through MCP calls
- **Liquidity Pools** manage token economics for knowledge contributors
- **Smart Contracts** handle transparent reward distribution and knowledge access tracking

The protocol bridges the gap between human expertise and AI model capabilities, creating economic incentives for knowledge sharing while providing AI agents with access to real-world experiences from domain experts.

## Architecture

The project consists of three main components:

### Smart Contracts (`/contracts`)
- **SynapseCore**: Main protocol contract managing deposits, expert pools, and reward distribution
- **KnowledgeExpertPool**: Individual pools for expert knowledge contributors
- **PoolFactory**: Creates and manages liquidity pools for knowledge tokens

### API Service (`/service`)
- **MCP Integration**: Model Context Protocol server for AI model integration
- **Database**: Supabase integration for knowledge storage and user management

### Web Frontend (`/web`)
- **React Application**: User interface for experts and consumers
- **Rainbow Kit**: Web3 wallet integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Supabase account (for service layer)

### Installation

Clone the repository:
```bash
git clone https://github.com/shift0x/synapse-protocol.git
cd synapse-protocol
```

## Running the Components

### 1. Smart Contracts

Navigate to the contracts directory and install dependencies:
```bash
cd contracts
npm install
```

**Available Commands:**
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sei testnet
npx hardhat run scripts/deploy.js --network sei_testnet

# Start local development network
npx hardhat node
```

**Environment Setup:**
Set the `SMART_CONTRACT_DEPLOYER` environment variable with your private key for deployment.

### 2. API Service

Navigate to the service directory and install dependencies:
```bash
cd service
npm install
```

**Environment Setup:**
Create a `.env` file with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

**Available Commands:**
```bash
# Development server
vercel dev

# Deploy to Vercel
vercel deploy

# Run locally (if not using Vercel)
npm start
```

**API Endpoints:**
- `/api/mcp` - Model Context Protocol server
- `/api/keys` - API key management
- `/api/topics` - Knowledge topic management
- `/api/chat` - Chat interface
- `/api/insights` - Expert insights

### 3. Web Frontend

Navigate to the web directory and install dependencies:
```bash
cd web
npm install
```

**Available Commands:**
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Serve production build locally
npm run serve
```

The web application will be available at `http://localhost:3000`

## Key Features

### For Experts
- **Knowledge Contribution**: Submit expertise through structured interviews
- **Token Rewards**: Earn tokens when your knowledge is accessed
- **Pool Management**: Participate in liquidity pools for knowledge tokens

### For AI Models & Developers
- **MCP Integration**: Direct access through Model Context Protocol
- **REST API**: Programmatic access to expert knowledge
- **Usage Tracking**: Transparent billing and usage analytics

## Technology Stack

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Node.js, TypeScript, Vercel Functions
- **Database**: Supabase
- **Frontend**: React, TypeScript
- **Web3**: Rainbow Kit, ethers.js, viem
- **AI Integration**: OpenAI API, Model Context Protocol

## Network Configuration

The protocol is configured for deployment on:
- **Sei Testnet**: Primary testnet deployment
- **Local Development**: Hardhat local network
