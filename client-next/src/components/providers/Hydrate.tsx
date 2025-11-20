"use client";

import { HydrationBoundary } from "@tanstack/react-query";
import type { DehydratedState } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface HydrateProps {
  state?: DehydratedState;
  children: ReactNode;
}

export const Hydrate = ({ state, children }: HydrateProps) => {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
};

export default Hydrate;
