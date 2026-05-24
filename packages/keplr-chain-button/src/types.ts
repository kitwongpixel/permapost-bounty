export interface KeplrCurrency {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  coinGeckoId?: string;
}

export interface KeplrBech32Config {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
}

export interface KeplrGasPriceStep {
  low: number;
  average: number;
  high: number;
}

export interface KeplrChainInfo {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bip44: {
    coinType: number;
  };
  bech32Config: KeplrBech32Config;
  currencies: KeplrCurrency[];
  feeCurrencies: KeplrCurrency[];
  stakeCurrency: KeplrCurrency;
  gasPriceStep: KeplrGasPriceStep;
  features?: string[];
  coinType?: number;
  beta?: boolean;
  imageUrl?: string;
}

export interface KeplrConnectionSnapshot {
  chainId: string;
  address: string;
}

export interface BalanceSnapshot {
  address: string;
  denom: string;
  amount: string;
  displayAmount: string;
  symbol: string;
  rpc: string;
  fetchedAt: string;
}
