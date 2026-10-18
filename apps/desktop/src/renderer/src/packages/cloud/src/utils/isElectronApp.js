// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/utils/isElectronApp.ts

var isElectronApp = () => typeof window !== "undefined" && !!window.api?.invoke;

export { isElectronApp };
