import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NILCHAIN_TESTNET,
  formatTokenAmount,
  getKeplrAvailability,
} from '../index';

describe('keplr package helpers', () => {
  afterEach(() => {
    delete (window as Window & { keplr?: unknown }).keplr;
  });

  it('formats token amounts using the requested decimals', () => {
    expect(formatTokenAmount('1230000', 6)).toBe('1.23');
    expect(formatTokenAmount('1000000', 6)).toBe('1');
    expect(formatTokenAmount('42', 0)).toBe('42');
  });

  it('exposes the NilChain testnet defaults', () => {
    expect(NILCHAIN_TESTNET.chainId).toBe('nillion-chain-testnet-1');
    expect(NILCHAIN_TESTNET.stakeCurrency.coinMinimalDenom).toBe('unil');
    expect(NILCHAIN_TESTNET.bech32Config.bech32PrefixAccAddr).toBe('nillion');
  });

  it('reports Keplr availability from the browser window', () => {
    (window as Window & { keplr?: unknown }).keplr = {} as never;

    expect(getKeplrAvailability()).toBe(true);
  });
});
