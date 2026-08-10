/**
 * Cross-browser WebExtension API (Chrome + Firefox).
 * Firefox exposes the promise-based `browser` namespace; Chrome uses `chrome`.
 */
export const browserAPI = globalThis.browser ?? globalThis.chrome;
