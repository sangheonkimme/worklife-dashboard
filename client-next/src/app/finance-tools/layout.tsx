import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const FinanceToolsLayout = ({ children }: { children: ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default FinanceToolsLayout;
