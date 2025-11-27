import type { Metadata } from "next";
import { PageTemplate } from "@/components/layouts/PageTemplate";

export const metadata: Metadata = {
  title: "문의하기",
  description:
    "워크라이프 대시보드 문의 – 제품 피드백과 파트너십 관련 요청을 보내주세요.",
};

const ContactPage = () => {
  return (
    <PageTemplate
      title="문의 & 지원"
      subtitle="Contact"
      description="제품 피드백, 파트너십, 교육용 라이선스 문의를 환영합니다."
      highlights={[
        "평일 10:00 ~ 19:00(KST) 내 응답",
        "CSM이 워크스페이스 셋업을 도와드립니다.",
        "Slack 커뮤니티에서 업데이트를 받을 수 있습니다.",
      ]}
      badge="Support"
      cta={{ label: "support@worklife-dashboard.com", href: "mailto:support@worklife-dashboard.com" }}
    >
      <section style={{ marginTop: 32, lineHeight: "1.7" }}>
        <h3>도움이 필요하신가요?</h3>
        <p>
          아래 정보를 함께 적어주시면 빠르게 도와드릴 수 있습니다.
        </p>
        <ul>
          <li>워크스페이스 이름 또는 이메일</li>
          <li>문의 유형 (기능 요청, 버그 제보, 결제 등)</li>
          <li>가능하다면 스크린샷 또는 영상</li>
        </ul>
      </section>
    </PageTemplate>
  );
};

export default ContactPage;
