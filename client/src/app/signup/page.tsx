import type { Metadata } from "next";
import SignupPageClient from "./SignupPageClient";

export const metadata: Metadata = {
  title: "회원가입",
  description:
    "Worklife Dashboard 계정을 만들어 가계부, 노트, 생산성 위젯을 시작하세요.",
};

const SignupPage = () => <SignupPageClient />;

export default SignupPage;
