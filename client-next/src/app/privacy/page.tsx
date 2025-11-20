import type { Metadata } from "next";
import { PageTemplate } from "@/components/layouts/PageTemplate";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description:
    "워크라이프 대시보드 개인정보 처리방침 – 어떤 데이터를 수집하고 어떻게 보호하는지 확인하세요.",
};

const PrivacyPage = () => {
  return (
    <PageTemplate
      title="개인정보 처리방침"
      subtitle="Privacy Policy"
      description="워크라이프 대시보드가 수집·이용하는 데이터와 보관/파기 절차를 투명하게 안내합니다."
      badge="Privacy"
      cta={{ label: "문의하기", href: "/contact" }}
    >
      <section style={{ marginTop: 32, lineHeight: "1.7" }}>
        <h3>주요 내용</h3>
        <ul>
          <li>수집 항목: 계정, 루틴 데이터, 연결 서비스 토큰</li>
          <li>이용 목적: 서비스 제공, 맞춤형 추천, 고객 지원</li>
          <li>보관 기간: 계약 종료 시 파기 또는 법령 준수 기간</li>
          <li>제3자 제공: 명시적 동의 또는 법적 요구에 한정</li>
        </ul>
        <p>
          데이터 삭제 또는 정정 요청은 언제든 support@worklife-dashboard.com 으로 보내실 수
          있습니다.
        </p>
      </section>
    </PageTemplate>
  );
};

export default PrivacyPage;
