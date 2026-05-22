/// <reference types="vite/client" />

interface Window {
  arweaveWallet?: {
    connect: (permissions: string[], appInfo?: { name?: string; logo?: string }) => Promise<void>;
    disconnect: () => Promise<void>;
    getPermissions: () => Promise<string[]>;
    getActiveAddress: () => Promise<string>;
  };
}
