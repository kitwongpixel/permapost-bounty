import { useMemo, useState } from 'react';
import {
  fetchBalanceSnapshot,
  formatTokenAmount,
  KeplrChainButton,
  NILCHAIN_TESTNET,
  type BalanceSnapshot,
  type KeplrConnectionSnapshot,
} from '@kitwongpixel/keplr-chain-button';

type ConnectionState =
  | { status: 'idle' }
  | { status: 'connected'; connection: KeplrConnectionSnapshot }
  | { status: 'error'; error: string };

function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'idle',
  });
  const [balanceState, setBalanceState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; balance: BalanceSnapshot }
    | { status: 'error'; error: string }
  >({ status: 'idle' });

  const networkFacts = useMemo(
    () => [
      {
        label: 'Chain ID',
        value: NILCHAIN_TESTNET.chainId,
      },
      {
        label: 'Bech32 Prefix',
        value: NILCHAIN_TESTNET.bech32Config.bech32PrefixAccAddr,
      },
      {
        label: 'Denom',
        value: `${NILCHAIN_TESTNET.stakeCurrency.coinDenom} / ${NILCHAIN_TESTNET.stakeCurrency.coinMinimalDenom}`,
      },
      {
        label: 'RPC',
        value: NILCHAIN_TESTNET.rpc,
      },
    ],
    [],
  );

  async function refreshBalance(address: string) {
    setBalanceState({ status: 'loading' });

    try {
      const balance = await fetchBalanceSnapshot(NILCHAIN_TESTNET, address);
      setBalanceState({ status: 'ready', balance });
    } catch (error) {
      setBalanceState({
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load balance right now.',
      });
    }
  }

  function handleSuccess(snapshot: KeplrConnectionSnapshot) {
    setConnectionState({
      status: 'connected',
      connection: snapshot,
    });
    void refreshBalance(snapshot.address);
  }

  async function connectOrRefresh() {
    if (connectionState.status === 'connected') {
      await refreshBalance(connectionState.connection.address);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Nillion bounty demo</p>
          <h1>Add NilChain to Keplr with one reusable button.</h1>
          <p className="hero__lede">
            A small, installable React package plus a live demo that suggests the
            Nillion testnet chain, connects the wallet, and queries NIL balance
            with a graceful fallback if the balance endpoint is unavailable.
          </p>

          <div className="hero__actions">
            <KeplrChainButton
              chainInfo={NILCHAIN_TESTNET}
              buttonText="Add NilChain to Keplr"
              workingText="Opening Keplr..."
              successText="NilChain added"
              connectAfterAdd
              onSuccess={handleSuccess}
              onError={(error) =>
                setConnectionState({ status: 'error', error: error.message })
              }
              className="button button--primary"
            />
            <button
              type="button"
              className="button button--secondary"
              onClick={() => void connectOrRefresh()}
              disabled={connectionState.status !== 'connected'}
            >
              Refresh balance
            </button>
          </div>

          <div className="status-row">
            {connectionState.status === 'connected' ? (
              <span className="pill pill--success">
                Connected: {connectionState.connection.address}
              </span>
            ) : connectionState.status === 'error' ? (
              <span className="pill pill--error">{connectionState.error}</span>
            ) : (
              <span className="pill">Waiting for Keplr</span>
            )}

            {balanceState.status === 'ready' ? (
              <span className="pill pill--glow">
                Balance: {balanceState.balance.displayAmount}{' '}
                {balanceState.balance.symbol}
              </span>
            ) : balanceState.status === 'error' ? (
              <span className="pill pill--warn">{balanceState.error}</span>
            ) : balanceState.status === 'loading' ? (
              <span className="pill">Fetching balance...</span>
            ) : null}
          </div>
        </div>

        <aside className="hero__panel">
          <div className="panel panel--network">
            <div className="panel__top">
              <div>
                <p className="panel__eyebrow">Chain profile</p>
                <h2>{NILCHAIN_TESTNET.chainName}</h2>
              </div>
              {NILCHAIN_TESTNET.imageUrl ? (
                <img
                  className="chain-logo"
                  src={NILCHAIN_TESTNET.imageUrl}
                  alt="Nillion logo"
                />
              ) : null}
            </div>

            <dl className="facts">
              {networkFacts.map((fact) => (
                <div key={fact.label} className="fact">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>

      <section className="grid">
        <article className="panel">
          <p className="panel__eyebrow">Why this is useful</p>
          <h3>Reusable package, not a one-off demo button.</h3>
          <ul className="feature-list">
            <li>Custom button copy and chain info.</li>
            <li>Graceful errors when Keplr is missing or rejects a chain.</li>
            <li>Balance queries run against the RPC endpoint, so the demo still works when REST is flaky.</li>
          </ul>
        </article>

        <article className="panel">
          <p className="panel__eyebrow">Current balance</p>
          <h3>
            {balanceState.status === 'ready'
              ? `${balanceState.balance.displayAmount} ${balanceState.balance.symbol}`
              : 'No wallet connected yet'}
          </h3>
          <p className="muted">
            Keplr connection is the only required browser extension. The package
            exposes the reusable button and helpers separately.
          </p>
          <div className="mini-grid">
            <div>
              <span className="mini-label">Demo target</span>
              <strong>NilChain testnet</strong>
            </div>
            <div>
              <span className="mini-label">Denom</span>
              <strong>{formatTokenAmount('1000000', 6)} NIL</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
