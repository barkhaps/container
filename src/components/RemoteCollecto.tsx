// container/src/components/RemoteCollecto.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { ComponentType } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { loadRemoteModule } from "../lib/loadRemote";

// ✅ Make sure this URL returns 200 in the browser
const REMOTE_URL = "http://localhost:3001/_next/static/chunks/remoteEntry.js";
const SCOPE = "CollectoApp";
const MODULE = "./CollectoDashboard";

export default function RemoteCollecto() {
  const [Comp, setComp] = useState<ComponentType | null>(null);
  const [status, setStatus] = useState("Loading remote…");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        console.log("[MF] start load", { REMOTE_URL, SCOPE, MODULE });
        setStatus("Loading remoteEntry…");

        const mod = await loadRemoteModule<{ default: ComponentType }>({
          url: REMOTE_URL,
          scope: SCOPE,
          module: MODULE,
        });

        if (!cancelled) {
          console.log("[MF] module loaded", mod);
          const C = mod?.default;
          if (!C) throw new Error("Remote module missing default export");
          setComp(() => C);
          setStatus("Loaded");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[MF] load error:", e);
        if (!cancelled) {
          setErr(msg);
          setStatus("Failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div style={{ padding: 16, color: "red", border: "1px solid red" }}>
        <strong>Remote load failed:</strong> {err}
        <div style={{ marginTop: 8, color: "#555" }}>
          Check Network tab for <code>remoteEntry.js</code> and Console for stack.
        </div>
      </div>
    );
  }

  if (!Comp) {
    return (
      <div style={{ padding: 16, border: "1px dashed #999" }}>{status}</div>
    );
  }

  // ⬇️ If the remote crashes during render, you’ll SEE it now
  return (
    <ErrorBoundary>
      <Comp />
    </ErrorBoundary>
  );
}
