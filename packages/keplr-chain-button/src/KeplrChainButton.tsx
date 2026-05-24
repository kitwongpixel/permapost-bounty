import { useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import type { KeplrChainInfo, KeplrConnectionSnapshot } from './types';
import {
  addChainToKeplr,
  addAndConnectKeplrAccount,
  getKeplrAvailability,
  KeplrUnavailableError,
} from './keplr';

export interface KeplrChainButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onError'> {
  chainInfo: KeplrChainInfo;
  buttonText?: string;
  workingText?: string;
  successText?: string;
  connectAfterAdd?: boolean;
  onSuccess?: (snapshot: KeplrConnectionSnapshot) => void;
  onError?: (error: Error) => void;
}

export function KeplrChainButton({
  chainInfo,
  buttonText = `Add ${chainInfo.chainName}`,
  workingText = 'Waiting on Keplr...',
  successText = 'Chain added',
  connectAfterAdd = true,
  onSuccess,
  onError,
  onClick,
  className,
  disabled,
  ...buttonProps
}: KeplrChainButtonProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>(getKeplrAvailability() ? '' : 'Install Keplr to continue.');

  async function handleClick(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    setBusy(true);
    setMessage(workingText);

    try {
      if (connectAfterAdd) {
        const snapshot = await addAndConnectKeplrAccount(chainInfo);
        setMessage(`${successText}: ${snapshot.address}`);
        onSuccess?.(snapshot);
        return;
      }

      await addChainToKeplr(chainInfo);
      setMessage(successText);
      onSuccess?.({ chainId: chainInfo.chainId, address: '' });
    } catch (error) {
      const err =
        error instanceof Error ? error : new KeplrUnavailableError();
      setMessage(err.message);
      onError?.(err);
    } finally {
      setBusy(false);
    }
  }

  const isDisabled = Boolean(disabled) || busy;

  return (
    <div className="keplr-chain-button">
      <button
        {...buttonProps}
        type="button"
        className={className}
        disabled={isDisabled}
        onClick={handleClick}
      >
        {busy ? workingText : buttonText}
      </button>
      <p aria-live="polite" className="keplr-chain-button__status">
        {message}
      </p>
    </div>
  );
}
