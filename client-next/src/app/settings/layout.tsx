import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const SettingsRouteLayout = ({ children }: { children: ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default SettingsRouteLayout;
