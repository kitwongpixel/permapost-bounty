# @kitwongpixel/keplr-chain-button

Reusable React utilities and a button component for suggesting NilChain testnet to Keplr.

## Install

```bash
npm install @kitwongpixel/keplr-chain-button
```

## Use

```tsx
import {
  KeplrChainButton,
  NILCHAIN_TESTNET,
} from '@kitwongpixel/keplr-chain-button';

export function WalletGate() {
  return <KeplrChainButton chainInfo={NILCHAIN_TESTNET} />;
}
```

## Exports

- `KeplrChainButton`
- `NILCHAIN_TESTNET`
- `addChainToKeplr`
- `connectKeplrAccount`
- `addAndConnectKeplrAccount`
- `fetchBalanceSnapshot`
- `formatTokenAmount`
