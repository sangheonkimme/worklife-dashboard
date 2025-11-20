import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const TransactionsLayout = ({ children }: { children: ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default TransactionsLayout;
