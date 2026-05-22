import React, { useEffect, useMemo, useState } from 'react';
import { arweave, fetchRecentTransactionsByAddress, formatAr, searchTransactionsByTag } from './lib/arweave';

type TxSummary = {
  id: string;
  owner?: { address?: string };
  tags?: Array<{ name: string; value: string }>;
  block?: { height?: number; timestamp?: number };
};

const APP_INFO = {
  name: 'PermaPost',
  logo: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 96 96%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 x2=%221%22%3E%3Cstop stop-color=%22%2300d8ff%22/%3E%3Cstop offset=%221%22 stop-color=%22%237c3aed%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%2296%22 height=%2296%22 rx=%2224%22 fill=%22url(%23g)%22/%3E%3Cpath d=%22M24 28h48v8H24zm0 16h48v8H24zm0 16h30v8H24z%22 fill=%22white%22/%3E%3C/svg%3E',
};

function formatDate(timestamp?: number) {
  if (!timestamp) return 'unknown';
  return new Date(timestamp * 1000).toLocaleString();
}

function tagValue(tags: TxSummary['tags'], name: string) {
  return tags?.find((tag) => tag.name === name)?.value ?? '—';
}

export function App() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<string>('');
  const [recent, setRecent] = useState<TxSummary[]>([]);
  const [queryTag, setQueryTag] = useState('App-Name');
  const [queryValue, setQueryValue] = useState('PermaPost');
  const [tagResults, setTagResults] = useState<TxSummary[]>([]);
  const [draftTitle, setDraftTitle] = useState('Hello from PermaPost');
  const [draftBody, setDraftBody] = useState('This postcard lives forever on Arweave.');
  const [status, setStatus] = useState('Connect a wallet to explore or publish.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const restore = async () => {
      if (!window.arweaveWallet) return;
      try {
        const permissions = await window.arweaveWallet.getPermissions();
        if (permissions.length === 0) return;
        const active = await window.arweaveWallet.getActiveAddress();
        setConnected(true);
        setAddress(active);
      } catch {
        // Ignore restore errors and wait for explicit connect.
      }
    };
    void restore();
  }, []);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [winston, txs] = await Promise.all([
          arweave.wallets.getBalance(address),
          fetchRecentTransactionsByAddress(address, 5),
        ]);
        if (cancelled) return;
        setBalance(formatAr(winston));
        setRecent(txs);
      } catch (err) {
        if (cancelled) return;
        setStatus(err instanceof Error ? err.message : 'Failed to load wallet data.');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const canPublish = useMemo(() => connected && address.length > 0, [connected, address]);

  const connectWallet = async () => {
    if (!window.arweaveWallet) {
      setStatus('Install ArConnect/Wander first.');
      return;
    }
    setBusy(true);
    try {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION'], APP_INFO);
      const active = await window.arweaveWallet.getActiveAddress();
      setConnected(true);
      setAddress(active);
      setStatus('Wallet connected.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setBusy(false);
    }
  };

  const disconnectWallet = async () => {
    if (!window.arweaveWallet) return;
    setBusy(true);
    try {
      await window.arweaveWallet.disconnect();
      setConnected(false);
      setAddress('');
      setBalance('');
      setRecent([]);
      setStatus('Disconnected.');
    } finally {
      setBusy(false);
    }
  };

  const runTagSearch = async () => {
    setBusy(true);
    try {
      const results = await searchTransactionsByTag(queryTag, queryValue, 10);
      setTagResults(results);
      setStatus(`Found ${results.length} transactions for ${queryTag}=${queryValue}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Tag search failed.');
    } finally {
      setBusy(false);
    }
  };

  const publishPostcard = async () => {
    if (!connected) {
      setStatus('Connect a wallet first.');
      return;
    }
    setBusy(true);
    try {
      const tx = await arweave.createTransaction({
        data: JSON.stringify({
          title: draftTitle,
          body: draftBody,
          createdAt: new Date().toISOString(),
          app: 'PermaPost',
        }),
      });
      tx.addTag('App-Name', 'PermaPost');
      tx.addTag('App-Version', '1.0.0');
      tx.addTag('Content-Type', 'application/json');
      tx.addTag('Type', 'postcard');
      tx.addTag('Title', draftTitle);

      await arweave.transactions.sign(tx);
      const response = await arweave.transactions.post(tx);

      setStatus(`Posted tx ${tx.id} (HTTP ${response.status}).`);
      const updated = await fetchRecentTransactionsByAddress(address, 5);
      setRecent(updated);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Postcard publish failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow">Arweave bounty #1</div>
        <h1>PermaPost</h1>
        <p className="lede">
          A small, polished permaweb app for exploring Arweave and publishing a signed postcard to the network.
        </p>

        <div className="actions">
          <button onClick={connectWallet} disabled={busy} className="primary">
            {connected ? 'Reconnect wallet' : 'Connect wallet'}
          </button>
          <button onClick={disconnectWallet} disabled={busy || !connected} className="secondary">
            Disconnect
          </button>
        </div>

        <p className="status">{status}</p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="card-label">Wallet</div>
          <div className="metric">{connected ? address : 'Not connected'}</div>
          <div className="submetric">{connected ? `${balance} AR available` : 'Connect with ArConnect / Wander to continue.'}</div>
        </article>

        <article className="card">
          <div className="card-label">Recent transactions</div>
          <div className="list">
            {recent.length === 0 ? (
              <div className="empty">No wallet transactions loaded yet.</div>
            ) : (
              recent.map((tx) => (
                <div key={tx.id} className="list-item">
                  <div className="row">
                    <span className="mono">{tx.id.slice(0, 12)}…</span>
                    <span>{formatDate(tx.block?.timestamp)}</span>
                  </div>
                  <div className="tags">
                    <span>{tagValue(tx.tags, 'App-Name')}</span>
                    <span>{tagValue(tx.tags, 'Type')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card wide">
          <div className="card-label">Tag explorer</div>
          <div className="form-row">
            <input value={queryTag} onChange={(e) => setQueryTag(e.target.value)} placeholder="Tag name" />
            <input value={queryValue} onChange={(e) => setQueryValue(e.target.value)} placeholder="Tag value" />
            <button onClick={runTagSearch} disabled={busy} className="secondary">Search</button>
          </div>
          <div className="list">
            {tagResults.length === 0 ? (
              <div className="empty">Search for any Arweave tag pair, for example App-Name / PermaPost.</div>
            ) : (
              tagResults.map((tx) => (
                <div key={tx.id} className="list-item">
                  <div className="row">
                    <span className="mono">{tx.id.slice(0, 12)}…</span>
                    <span>{formatDate(tx.block?.timestamp)}</span>
                  </div>
                  <div className="tags">
                    <span>{tagValue(tx.tags, 'App-Name')}</span>
                    <span>{tagValue(tx.tags, 'Type')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card wide">
          <div className="card-label">Publish postcard</div>
          <div className="form-grid">
            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Post title" />
            <textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} rows={4} placeholder="Post body" />
          </div>
          <button onClick={publishPostcard} disabled={busy || !canPublish} className="primary">
            Publish to Arweave
          </button>
        </article>
      </section>
    </main>
  );
}
