// src/app/page.tsx
import React from "react";
import ClientOnlyRemoteCollecto from "../components/ClientOnlyRemoteCollecto";

export default function HomePage() {
  return (
    <main>
      <h1>Host App</h1>
      <ClientOnlyRemoteCollecto />
    </main>
  );
}
