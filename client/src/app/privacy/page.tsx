import type { Metadata } from "next";
import PrivacyPageClient from "./PrivacyPageClient";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | Worklife Dashboard",
  description: "Worklife Dashboard 개인정보 처리방침",
};

const PrivacyPage = () => <PrivacyPageClient />;

export default PrivacyPage;
