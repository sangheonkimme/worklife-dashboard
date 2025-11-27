"use client";

import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const ToolsLayout = ({ children }: { children: ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ToolsLayout;
