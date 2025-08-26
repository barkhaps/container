// container/src/components/ErrorBoundary.tsx
"use client";

import React from "react";

export default class ErrorBoundary extends React.Component<
  { fallback?: React.ReactNode; children?: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { fallback?: React.ReactNode; children?: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[MF] Remote render error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 16, color: "red", border: "1px solid red" }}>
            <strong>Remote component crashed:</strong>{" "}
            {this.state.error.message}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
