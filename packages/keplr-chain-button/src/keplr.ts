import type {
  BalanceSnapshot,
  KeplrChainInfo,
  KeplrConnectionSnapshot,
} from './types';

export class KeplrUnavailableError extends Error {
  constructor() {
    super('Keplr is not installed or not available in this browser.');
    this.name = 'KeplrUnavailableError';
  }
}

export class KeplrChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeplrChainError';
  }
}

export interface WindowWithKeplr extends Window {
  keplr?: KeplrBrowser;
}

export interface KeplrBrowser {
  experimentalSuggestChain: (chainInfo: unknown) => Promise<void>;
  enable: (chainId: string) => Promise<void>;
  getOfflineSigner: (chainId: string) => {
    getAccounts: () => Promise<Array<{ address: string }>>;
  };
}

export interface KeplrSuggestChainInfo extends KeplrChainInfo {
  readonly chainName: string;
}

function getKeplr(): KeplrBrowser {
  if (typeof window === 'undefined' || !window.keplr) {
    throw new KeplrUnavailableError();
  }

  return window.keplr;
}

export function getKeplrAvailability(): boolean {
  return typeof window !== 'undefined' && Boolean(window.keplr);
}

export async function addChainToKeplr(
  chainInfo: KeplrChainInfo,
): Promise<void> {
  const keplr = getKeplr();
  await keplr.experimentalSuggestChain({
    chainId: chainInfo.chainId,
    chainName: chainInfo.chainName,
    rpc: chainInfo.rpc,
    rest: chainInfo.rest,
    bip44: chainInfo.bip44,
    bech32Config: chainInfo.bech32Config,
    currencies: chainInfo.currencies,
    feeCurrencies: chainInfo.feeCurrencies,
    stakeCurrency: chainInfo.stakeCurrency,
    gasPriceStep: chainInfo.gasPriceStep,
    features: chainInfo.features ?? [],
  });
}

export async function connectKeplrAccount(
  chainInfo: KeplrChainInfo,
): Promise<KeplrConnectionSnapshot> {
  const keplr = getKeplr();
  await keplr.enable(chainInfo.chainId);
  const offlineSigner = keplr.getOfflineSigner(chainInfo.chainId);
  const [account] = await offlineSigner.getAccounts();

  if (!account?.address) {
    throw new KeplrChainError(
      `Keplr enabled ${chainInfo.chainId}, but no account address was returned.`,
    );
  }

  return {
    chainId: chainInfo.chainId,
    address: account.address,
  };
}

export async function addAndConnectKeplrAccount(
  chainInfo: KeplrChainInfo,
): Promise<KeplrConnectionSnapshot> {
  await addChainToKeplr(chainInfo);
  return connectKeplrAccount(chainInfo);
}

export async function fetchBalanceSnapshot(
  chainInfo: KeplrChainInfo,
  address: string,
): Promise<BalanceSnapshot> {
  if (!address) {
    throw new KeplrChainError('An address is required to fetch balance.');
  }

  const { StargateClient } = await import('@cosmjs/stargate');
  const client = await StargateClient.connect(chainInfo.rpc);
  const balance = await client.getBalance(address, chainInfo.stakeCurrency.coinMinimalDenom);

  return {
    address,
    denom: balance.denom,
    amount: balance.amount,
    displayAmount: formatTokenAmount(
      balance.amount,
      chainInfo.stakeCurrency.coinDecimals,
    ),
    symbol: chainInfo.stakeCurrency.coinDenom,
    rpc: chainInfo.rpc,
    fetchedAt: new Date().toISOString(),
  };
}

export function formatTokenAmount(amount: string, decimals: number): string {
  if (!amount) {
    return '0';
  }

  const raw = BigInt(amount);
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = raw / divisor;
  const fraction = raw % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const padded = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole.toString()}.${padded}`;
}
