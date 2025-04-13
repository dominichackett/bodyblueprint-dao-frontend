# Body Blue Print DAO Frontend

A Next.js frontend application for the HealthDAO platform, a decentralized autonomous organization focused on health and wellness content. The application uses Web3Auth for authentication and connects to the HealthDAOGovernance smart contract.

## Features

- Web3Auth integration for wallet authentication
- Dashboard to view DAO status and recent proposals
- Create, view, and vote on proposals
- Third party download of DAO data
- Execute approved proposals
- Responsive design with Tailwind CSS


## Tech Stack

- **Frontend Framework**: Next.js with TypeScript
- **Authentication**: Web3Auth
- **Blockchain Interaction**: ethers.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask or another Web3 wallet
- Access to the HealthDAOGovernance smart contract

# Akave Storage Integration

## Check Relay Server to AKAVE Link to download content if user has access
https://github.com/dominichackett/bodyblueprint-dao-frontend/blob/7b8f643cb2fcad8c4de67d04832f778522a1d5ef/src/components/subscription/subscribe.tsx#L112-L127


## Relay Server to AKAVE Link

https://github.com/dominichackett/akaveserver/blob/main/server.js


## Screen Shots
### Home Page
![Home Page](https://github.com/dominichackett/bodyblueprint-dao-frontend/blob/master/public/index.png)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/health-dao-frontend.git
cd health-dao-frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
NEXT_PUBLIC_DAO_CONTRACT_ADDRESS=your_dao_contract_address
NEXT_PUBLIC_DAO_TOKEN_ADDRESS=your_dao_token_address
NEXT_PUBLIC_CHAIN_ID=your_chain_id
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Smart Contract Integration

The frontend interacts with the HealthDAOGovernance smart contract, which manages:

- DAO membership based on token holdings
- Proposal creation and voting
- Content retrieval pricing

## Deployment

The application can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

```bash
npm run build
# or
yarn build
```

## License

MIT
