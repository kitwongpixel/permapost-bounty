# Nillion Keplr Chain Button

An open-source npm package plus demo app for the Nillion builder bounty:

- reusable React button for adding a Cosmos chain to Keplr
- configurable chain metadata
- graceful error handling when Keplr is missing or rejects the request
- live demo that adds NilChain testnet and shows a NIL balance snapshot

## Package

Install in another app:

```bash
npm install @kitwongpixel/keplr-chain-button
```

Use it:

```tsx
import {
  KeplrChainButton,
  NILCHAIN_TESTNET,
} from '@kitwongpixel/keplr-chain-button';

export function WalletGate() {
  return (
    <KeplrChainButton
      chainInfo={NILCHAIN_TESTNET}
      buttonText="Add NilChain to Keplr"
      connectAfterAdd
    />
  );
}
```

### Helper exports

- `addChainToKeplr(chainInfo)`
- `connectKeplrAccount(chainInfo)`
- `addAndConnectKeplrAccount(chainInfo)`
- `fetchBalanceSnapshot(chainInfo, address)`
- `formatTokenAmount(amount, decimals)`

## Demo

The demo app uses the same package and chain metadata. It targets the Nillion testnet chain:

- Chain ID: `nillion-chain-testnet-1`
- Bech32 prefix: `nillion`
- Denom: `unil`
- RPC: `https://testnet-rpc.lavenderfive.com/nillion/`
- REST: `https://testnet-rest.lavenderfive.com/nillion/`

The chain metadata mirrors the Nillion testnet registry entry and the docs page for NilChain testnet:

- `cosmos/chain-registry/testnets/nilliontestnet/chain.json`
- `https://docs.nillion.com/blind-computer/build/network-config`

## Run locally

```bash
npm install
npm run dev
```

## Build and check

```bash
npm run check
npm run build
```

## Notes

- The demo fetches balance using the RPC path and shows a helpful fallback if the network endpoint is unavailable.
- Keplr must be installed in the browser for chain addition and wallet connection.
