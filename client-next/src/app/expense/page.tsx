import type { Metadata } from "next";
import { PageTemplate } from "@/components/layouts/PageTemplate";

export const metadata: Metadata = {
  title: "지출 요약",
  description:
    "워크라이프 대시보드 지출 요약 – 개인 생활비와 팀 비용을 한 번에 살펴보세요.",
};

const ExpensePage = () => {
  return (
    <PageTemplate
      title="지출 요약"
      subtitle="Expense Overview"
      description="주간/월간 지출을 빠르게 확인하고, 급여·장학금·수입 대비 리포트를 확인합니다."
      highlights={[
        "개인 지출 / 팀 비용 이중 분류",
        "예산 대비 초과 시 알림",
        "PDF, 스프레드시트 내보내기",
      ]}
      badge="Budgeting"
      cta={{ label: "세부 내역 보기", href: "/transactions" }}
    >
      <section style={{ marginTop: 32, lineHeight: "1.7" }}>
        <h3>보고 포맷</h3>
        <p>
          회계팀, 학교 행정실 혹은 스터디 모임에 공유할 수 있는 정형 보고서를 제공합니다.
          날짜 범위를 지정하면 자동으로 주요 지표와 그래프 이미지를 포함합니다.
        </p>
      </section>
    </PageTemplate>
  );
};

export default ExpensePage;
