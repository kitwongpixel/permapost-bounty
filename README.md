# PermaPost

PermaPost is a small permaweb-style app for browsing and publishing permanent postcards on Arweave.

## What it does

- Connects with ArConnect or Wander-compatible wallets through `window.arweaveWallet`
- Shows the connected wallet address and AR balance
- Lists recent on-chain transactions for the active wallet
- Searches transactions by tag
- Creates and posts a signed Arweave transaction containing a postcard entry

## Stack

- React
- TypeScript
- Vite
- Arweave JS

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

This app is designed to be deployed as a static permaweb frontend and use ArweaveJS plus wallet integration for on-chain interaction.
