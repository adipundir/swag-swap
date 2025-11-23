"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const Providers = dynamic(() => import("./Providers"), {
  ssr: false,
});

export function ClientProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}

