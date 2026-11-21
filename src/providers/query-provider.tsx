"use client";

import { lazy, Suspense, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { makeQueryClient } from "@/lib/query-client";

// The default entry renders null when NODE_ENV !== "development"; the
// /production entry renders in every build.
const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools/production").then((m) => ({
    default: m.ReactQueryDevtools,
  })),
);

export function QueryProvider({ children }: { children: ReactNode }) {
  // One client per browser session; useState keeps it stable across re-renders.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Suspense fallback={null}>
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </Suspense>
    </QueryClientProvider>
  );
}
