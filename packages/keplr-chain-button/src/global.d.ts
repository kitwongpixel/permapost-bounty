export {};

declare global {
  interface Window {
    keplr?: import('./keplr').KeplrBrowser;
  }
}
