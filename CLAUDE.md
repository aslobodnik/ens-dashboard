# ENS Wallets Dashboard

## Overview
Dashboard displaying ENS DAO operational contracts and working group multisig wallets with their balances and signers.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- wagmi + viem for Ethereum interactions
- Tanstack Query for data fetching

## Project Structure
```
src/
  app/
    client.tsx      # Main client component with tables
    page.tsx        # Server component - fetches blockchain data
    layout.tsx      # Root layout with fonts and providers
    globals.css     # Tailwind + theme variables
    types/types.ts  # TypeScript types
  components/ui/    # shadcn/ui components
```

## Design System
- **Theme**: Light constitutional/governance aesthetic
- **Fonts**: Libre Baskerville (serif headings), Source Sans 3 (body), JetBrains Mono (numbers)
- **Colors**: Parchment cream background, navy blue accents
- **Components**: Cards with subtle borders, clean tables

## Key Data Types
- `ContractInfo`: Base type for contracts with balances
- `MultiSig`: Extends ContractInfo with signers[] and threshold

## Environment Variables
- `NEXT_PUBLIC_ALCHEMY_URL`: Ethereum RPC endpoint

## Notes
- Threshold values from Safe contracts are bigints - use `Number()` to convert
- ENS names resolved via wagmi's useEnsName hook
- Avatars fetched from custom ENS API at ens-api.slobo.xyz
