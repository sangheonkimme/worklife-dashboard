import type { Metadata } from "next";
import { PageTemplate } from "@/components/layouts/PageTemplate";

export const metadata: Metadata = {
  title: "이용약관",
  description: "워크라이프 대시보드 이용약관 – 서비스 사용 조건과 책임 범위를 확인하세요.",
};

const TermsPage = () => {
  return (
    <PageTemplate
      title="이용약관"
      subtitle="Terms of Service"
      description="서비스 이용 시 적용되는 권리, 의무, 제한 사항을 안내합니다."
      badge="Legal"
      cta={{ label: "문의하기", href: "/contact" }}
    >
      <section style={{ marginTop: 32, lineHeight: "1.7" }}>
        <h3>핵심 조항 요약</h3>
        <ol>
          <li>서비스 이용 목적 및 허용 범위</li>
          <li>계정 보안과 데이터 책임</li>
          <li>결제, 환불, 계약 해지 조건</li>
          <li>콘텐츠 및 지적재산권</li>
          <li>분쟁 해결 및 준거법</li>
        </ol>
        <p>
          자세한 약관 전문은 워크스페이스 관리자 페이지에서 PDF로 내려받을 수 있으며,
          주요 변경 사항은 이메일과 제품 내 공지를 통해 안내드립니다.
        </p>
      </section>
    </PageTemplate>
  );
};

export default TermsPage;
