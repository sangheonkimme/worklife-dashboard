import type { Metadata } from "next";
import { PageTemplate } from "@/components/layouts/PageTemplate";
import { AuthLayout } from "@/components/layouts/AuthLayout";

const highlights = [
  "14일 무료 체험 동안 모든 기능과 템플릿을 제한 없이 사용해보세요.",
  "팀 구성원을 초대해 역할 별 권한과 알림을 동시에 설정할 수 있습니다.",
  "학교·회사 이메일 모두 지원하며, 개인용 / 팀용 워크스페이스를 분리 관리합니다.",
];

export const metadata: Metadata = {
  title: "회원가입",
  description:
    "워크라이프 대시보드 회원가입 – 직장/캠퍼스 루틴을 통합할 새 워크스페이스를 만들어 보세요.",
};

const SignupPage = () => {
  return (
    <AuthLayout>
      <PageTemplate
        title="무료로 가입하고 루틴을 설계하세요"
        subtitle="Onboarding"
        description="워크와 라이프를 동시에 챙기는 사람들을 위한 워크스페이스를 2분 안에 시작합니다."
        highlights={highlights}
        badge="무료 14일 체험"
        cta={{ label: "이메일로 가입", href: "/signup" }}
        secondaryCta={{ label: "이미 계정이 있나요? 로그인", href: "/login" }}
      >
        <section style={{ marginTop: 32, lineHeight: "1.7" }}>
          <h3>가입 절차</h3>
          <ol>
            <li>이메일 또는 Google 계정으로 인증</li>
            <li>워크·라이프 목표 선택 및 추천 템플릿 적용</li>
            <li>루틴/캘린더/노트 연결 후 첫 기록 시작</li>
          </ol>
          <p>
            언제든 플랜을 변경하거나 팀을 추가할 수 있으며, 체험 기간 종료 전 알림을 통해
            과금 여부를 확인할 수 있습니다.
          </p>
        </section>
      </PageTemplate>
    </AuthLayout>
  );
};

export default SignupPage;
