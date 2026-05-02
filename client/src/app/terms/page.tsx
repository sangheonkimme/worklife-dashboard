import type { Metadata } from "next";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = {
  title: "이용약관 | Worklife Dashboard",
  description: "Worklife Dashboard 서비스 이용약관",
};

const TermsPage = () => <TermsPageClient />;

export default TermsPage;
