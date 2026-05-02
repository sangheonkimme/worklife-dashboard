import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "문의하기 | Worklife Dashboard",
  description: "Worklife Dashboard 문의 및 피드백 채널",
};

const ContactPage = () => <ContactPageClient />;

export default ContactPage;
