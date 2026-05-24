import type { KeplrChainInfo } from './types';

export const NILCHAIN_TESTNET: KeplrChainInfo = {
  chainId: 'nillion-chain-testnet-1',
  chainName: 'NilChain Testnet',
  rpc: 'https://testnet-rpc.lavenderfive.com/nillion/',
  rest: 'https://testnet-rest.lavenderfive.com/nillion/',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'nillion',
    bech32PrefixAccPub: 'nillionpub',
    bech32PrefixValAddr: 'nillionvaloper',
    bech32PrefixValPub: 'nillionvaloperpub',
    bech32PrefixConsAddr: 'nillionvalcons',
    bech32PrefixConsPub: 'nillionvalconspub',
  },
  currencies: [
    {
      coinDenom: 'NIL',
      coinMinimalDenom: 'unil',
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'NIL',
      coinMinimalDenom: 'unil',
      coinDecimals: 6,
    },
  ],
  stakeCurrency: {
    coinDenom: 'NIL',
    coinMinimalDenom: 'unil',
    coinDecimals: 6,
  },
  gasPriceStep: {
    low: 0.0001,
    average: 0.0001,
    high: 0.00025,
  },
  features: ['ibc-transfer', 'stargate', 'no-legacy-stdTx'],
  imageUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/nilliontestnet/images/nil.png',
};
