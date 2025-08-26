// Types for Webpack Module Federation runtime
interface RemoteContainer {
  init(shareScope: unknown): Promise<void>;
  get(module: string): Promise<() => unknown>;
}

declare global {
  interface Window {
    [key: string]: RemoteContainer | undefined;
    __webpack_share_scopes__?: Record<string, unknown>;
  }
}

// Webpack runtime (declared so TS doesn’t complain if present)
declare const __webpack_init_sharing__:
  | ((scope: string) => Promise<void>)
  | undefined;

const cache = new Map<string, Promise<void>>();
const keyFor = (url: string, scope: string) => `${scope}@@${url}`;

function loadRemoteEntry(url: string, scope: string): Promise<void> {
  const key = keyFor(url, scope);
  const cached = cache.get(key);
  if (cached) return cached;

  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.type = "text/javascript";
    s.async = true;
    s.onload = () => {
      if (window[scope]) {
        console.log(`[MF] remoteEntry loaded: ${url} (scope=${scope})`);
        resolve();
      } else {
        reject(new Error(`[MF] remote loaded but window["${scope}"] not found`));
      }
    };
    s.onerror = () => reject(new Error(`[MF] failed to load ${url}`));
    document.head.appendChild(s);
  });

  cache.set(key, p);
  return p;
}

export async function loadRemoteModule<T = unknown>(opts: {
  url: string;      // e.g. http://localhost:3001/_next/static/chunks/remoteEntry.js
  scope: string;    // e.g. CollectoApp
  module: string;   // e.g. ./CollectoDashboard
}): Promise<T> {
  const { url, scope, module } = opts;

  await loadRemoteEntry(url, scope);

  // Initialize sharing if available (older/alt runtimes may not expose it)
  if (typeof __webpack_init_sharing__ === "function") {
    await __webpack_init_sharing__("default");
  } else {
    console.warn("[MF] __webpack_init_sharing__ not found; continuing without it");
  }

  const container = window[scope];
  if (!container) {
    throw new Error(`[MF] container "${scope}" not on window after remoteEntry load`);
  }

  // Initialize the remote container with the host’s share scope (if present)
  if (window.__webpack_share_scopes__) {
    await container.init(window.__webpack_share_scopes__.default ?? {});
  } else {
    console.warn("[MF] __webpack_share_scopes__ not found; continuing without it");
  }

  const factory = await container.get(module);
  const mod = factory();
  return mod as T;
}
