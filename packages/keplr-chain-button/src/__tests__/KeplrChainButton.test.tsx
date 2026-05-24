import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KeplrChainButton, NILCHAIN_TESTNET } from '../index';

const experimentalSuggestChain = vi.fn().mockResolvedValue(undefined);
const enable = vi.fn().mockResolvedValue(undefined);
const getAccounts = vi.fn().mockResolvedValue([{ address: 'nillion1testaddress' }]);

afterEach(() => {
  vi.clearAllMocks();
  delete (window as Window & { keplr?: unknown }).keplr;
});

describe('KeplrChainButton', () => {
  it('suggests the chain and emits a success snapshot', async () => {
    (window as Window & { keplr?: unknown }).keplr = {
      experimentalSuggestChain,
      enable,
      getOfflineSigner: () => ({
        getAccounts,
      }),
    };

    const onSuccess = vi.fn();

    render(
      <KeplrChainButton
        chainInfo={NILCHAIN_TESTNET}
        onSuccess={onSuccess}
        buttonText="Add NilChain"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add NilChain' }));

    await waitFor(() => {
      expect(experimentalSuggestChain).toHaveBeenCalledTimes(1);
      expect(enable).toHaveBeenCalledWith(NILCHAIN_TESTNET.chainId);
      expect(onSuccess).toHaveBeenCalledWith({
        chainId: NILCHAIN_TESTNET.chainId,
        address: 'nillion1testaddress',
      });
    });

    expect(
      screen.getByText(/nillion1testaddress/),
    ).toBeTruthy();
  });

  it('shows a helpful status when Keplr is unavailable', () => {
    delete (window as Window & { keplr?: unknown }).keplr;

    render(
      <KeplrChainButton
        chainInfo={NILCHAIN_TESTNET}
        buttonText="Add NilChain"
      />,
    );

    expect(
      screen.getByText('Install Keplr to continue.'),
    ).toBeTruthy();
  });
});
