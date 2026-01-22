# ENS Wallets

A dashboard for viewing ENS DAO treasury wallets, including operational contracts and working group multisigs.

## Features

- View ETH, ENS, and USDC balances across DAO wallets
- Display multisig configurations (signers and thresholds)
- Filter by working group (Public Goods, Ecosystem, Metagov)
- Click-to-copy wallet addresses
- ENS avatar resolution for signers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with CSS variables
- **Components**: shadcn/ui (Table, Avatar, Select, Tooltip)
- **Ethereum**: viem for contract reads, multicall batching
- **Fonts**: Libre Baskerville (headings), Source Sans 3 (body), JetBrains Mono (data)

## Getting Started

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Add your Alchemy URL to .env

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ALCHEMY_URL` | Alchemy Ethereum mainnet RPC URL |

## Data Sources

- Wallet balances: On-chain via Alchemy RPC
- ETH price: Chainlink price feed
- ENS avatars: ENS metadata service
- Multisig info: Safe contract reads (getOwners, getThreshold)

## Project Structure

```
src/
  app/
    client.tsx    # Main client component with tables
    page.tsx      # Server component for data fetching
    layout.tsx    # Root layout with fonts
    globals.css   # Theme variables and base styles
  components/
    ui/           # shadcn/ui components
  lib/
    utils.ts      # Utility functions
```
