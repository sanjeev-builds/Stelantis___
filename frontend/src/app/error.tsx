"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

// Audit found no error boundary existed anywhere - an unhandled render
// exception fell through to Next's raw dev overlay / blank production page.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
      <AlertTriangle size={32} className="text-red-500" />
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Something went wrong</h1>
        <p className="mt-1 text-sm text-gray-500">
          The dashboard hit an unexpected error. This has been logged to the console.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}
