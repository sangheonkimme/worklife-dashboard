"use client";

import { Title, Text, Stack, List } from "@mantine/core";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const SERVICE_NAME = "Worklife Dashboard";
const EFFECTIVE_DATE = "2026년 5월 2일";

const sections = [
  { id: "art1", label: "제1조 (목적)" },
  { id: "art2", label: "제2조 (용어의 정의)" },
  { id: "art3", label: "제3조 (약관의 게시와 개정)" },
  { id: "art4", label: "제4조 (약관 외 준칙)" },
  { id: "art5", label: "제5조 (이용계약의 성립)" },
  { id: "art6", label: "제6조 (회원가입)" },
  { id: "art7", label: "제7조 (회원정보의 변경)" },
  { id: "art8", label: "제8조 (회원 탈퇴 및 자격 상실)" },
  { id: "art9", label: "제9조 (서비스의 제공)" },
  { id: "art10", label: "제10조 (서비스의 변경 및 중단)" },
  { id: "art11", label: "제11조 (이용자의 의무)" },
  { id: "art12", label: "제12조 (서비스 이용 제한)" },
  { id: "art13", label: "제13조 (게시물의 관리)" },
  { id: "art14", label: "제14조 (게시물의 저작권)" },
  { id: "art15", label: "제15조 (손해배상)" },
  { id: "art16", label: "제16조 (면책조항)" },
  { id: "art17", label: "제17조 (분쟁해결 및 관할)" },
];

const Article = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <Stack id={id} gap="sm" mt="xl">
    <Title order={2} fz="lg" mt="md">
      {title}
    </Title>
    {children}
  </Stack>
);

const NumberedClauses = ({ items }: { items: string[] }) => {
  const circled = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
  return (
    <Stack gap={6}>
      {items.map((text, idx) => (
        <Text key={idx}>
          {circled[idx] ?? `${idx + 1}.`} {text}
        </Text>
      ))}
    </Stack>
  );
};

export const TermsPageClient = () => {
  return (
    <LegalPageLayout
      title="이용약관"
      effectiveDate={EFFECTIVE_DATE}
      toc={sections}
    >
      <Article id="art1" title="제1조 (목적)">
        <Text>
          본 약관은 {SERVICE_NAME}(이하 &ldquo;서비스&rdquo;)가 제공하는 개인 생산성 및 가계부 관리 도구의 이용과 관련하여 서비스를 제공하는 자(이하 &ldquo;회사&rdquo;)와 이용자(이하 &ldquo;회원&rdquo;)의 권리·의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </Text>
      </Article>

      <Article id="art2" title="제2조 (용어의 정의)">
        <NumberedClauses
          items={[
            "“서비스”란 회사가 제공하는 가계부, 노트, 생산성 위젯 등 일체의 기능을 의미합니다.",
            "“회원”이란 본 약관에 동의하고 회사와 이용계약을 체결한 자를 말합니다.",
            "“계정”이란 회원의 식별과 서비스 이용을 위해 회원이 등록한 이메일·비밀번호 또는 Google OAuth 인증 정보를 말합니다.",
            "“게시물”이란 회원이 서비스 내에 게시·등록·업로드한 거래 내역, 노트, 첨부파일, 설정 등 일체의 콘텐츠를 의미합니다.",
          ]}
        />
      </Article>

      <Article id="art3" title="제3조 (약관의 게시와 개정)">
        <NumberedClauses
          items={[
            "회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 또는 연결 화면을 통해 게시합니다.",
            "회사는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.",
            "회사가 약관을 개정할 경우 적용일자 및 개정사유를 명시하여 적용일자 7일 전부터 공지합니다. 다만, 회원에게 불리하거나 중대한 변경의 경우 적용일자 30일 전부터 공지합니다.",
            "회원은 개정 약관에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 이용계약을 해지할 수 있습니다. 적용일자 이후에도 서비스를 계속 이용할 경우 개정 약관에 동의한 것으로 간주합니다.",
          ]}
        />
      </Article>

      <Article id="art4" title="제4조 (약관 외 준칙)">
        <Text>
          본 약관에 명시되지 않은 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보 보호법」 등 관련 법령 또는 일반 상관례에 따릅니다.
        </Text>
      </Article>

      <Article id="art5" title="제5조 (이용계약의 성립)">
        <NumberedClauses
          items={[
            "이용계약은 회원이 되고자 하는 자(이하 “가입신청자”)가 본 약관 및 개인정보 처리방침에 동의한 후 회사가 정한 양식에 따라 회원가입을 신청하고, 회사가 이를 승낙함으로써 성립합니다.",
            "회사는 가입신청자의 신청에 대하여 원칙적으로 서비스 이용을 승낙합니다. 다만 다음 각 호에 해당하는 경우에는 승낙을 거부하거나 사후에 이용계약을 해지할 수 있습니다.",
          ]}
        />
        <List spacing={4} withPadding>
          <List.Item>실명이 아니거나 타인의 정보를 이용한 경우</List.Item>
          <List.Item>허위의 정보를 기재하거나 회사가 요구하는 사항을 기재하지 않은 경우</List.Item>
          <List.Item>이용자의 귀책사유로 승낙이 불가능하거나 기타 본 약관에 위배되는 경우</List.Item>
        </List>
      </Article>

      <Article id="art6" title="제6조 (회원가입)">
        <NumberedClauses
          items={[
            "회원가입은 이메일·비밀번호 등록 또는 Google 계정을 통한 OAuth 인증으로 진행합니다.",
            "회원은 가입 시 본인의 정확한 정보를 제공해야 하며, 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.",
            "회원은 자신의 계정 비밀번호 및 인증 정보를 안전하게 관리할 책임을 지며, 계정 정보 유출로 인해 발생하는 손해에 대해서는 회원 본인이 책임집니다.",
          ]}
        />
      </Article>

      <Article id="art7" title="제7조 (회원정보의 변경)">
        <NumberedClauses
          items={[
            "회원은 서비스 내 프로필 페이지에서 자신의 이름, 비밀번호 등 회원정보를 언제든지 열람하고 수정할 수 있습니다.",
            "회원은 회원가입 신청 시 기재한 사항이 변경되었을 경우 즉시 이를 수정해야 하며, 수정하지 않아 발생한 불이익에 대해서는 회사가 책임을 지지 않습니다.",
          ]}
        />
      </Article>

      <Article id="art8" title="제8조 (회원 탈퇴 및 자격 상실)">
        <NumberedClauses
          items={[
            "회원은 언제든지 서비스 내 설정을 통해 회원 탈퇴를 신청할 수 있으며, 회사는 관련 법령이 정하는 바에 따라 즉시 이를 처리합니다.",
            "회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한·정지하거나 해지할 수 있습니다.",
          ]}
        />
        <List spacing={4} withPadding>
          <List.Item>가입 신청 시 허위 내용을 등록한 경우</List.Item>
          <List.Item>타인의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</List.Item>
          <List.Item>법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</List.Item>
        </List>
      </Article>

      <Article id="art9" title="제9조 (서비스의 제공)">
        <Text>회사는 회원에게 다음과 같은 서비스를 제공합니다.</Text>
        <List spacing={4}>
          <List.Item>수입·지출 내역 기록 및 카테고리·예산 관리</List.Item>
          <List.Item>급여 공제(4대 보험·소득세 등) 계산</List.Item>
          <List.Item>마크다운 기반의 노트 작성 및 첨부파일 관리</List.Item>
          <List.Item>구독 관리 및 캐시플로우 캘린더</List.Item>
          <List.Item>포모도로 타이머, 스톱워치, 체크리스트, 스티키 메모 등 생산성 위젯</List.Item>
          <List.Item>기타 회사가 추가로 개발하거나 다른 회사와의 제휴를 통해 제공하는 서비스</List.Item>
        </List>
      </Article>

      <Article id="art10" title="제10조 (서비스의 변경 및 중단)">
        <NumberedClauses
          items={[
            "회사는 운영상·기술상의 필요에 따라 서비스의 일부 또는 전부를 변경할 수 있으며, 변경 사항은 사전에 서비스 내 공지를 통해 안내합니다.",
            "회사는 시스템 점검·보수·교체, 통신두절, 천재지변 등 불가항력적 사유가 발생한 경우 서비스 제공을 일시적으로 중단할 수 있습니다.",
            "무료로 제공되는 서비스 특성상, 회사는 서비스의 변경·중단으로 인해 회원에게 발생한 손해에 대하여 별도의 보상 의무를 지지 않습니다. 다만 회사의 고의 또는 중과실로 인한 경우는 그러하지 아니합니다.",
          ]}
        />
      </Article>

      <Article id="art11" title="제11조 (이용자의 의무)">
        <Text>회원은 다음 각 호의 행위를 해서는 안 됩니다.</Text>
        <List spacing={4}>
          <List.Item>타인의 계정·인증 정보를 무단으로 사용하거나 양도·대여하는 행위</List.Item>
          <List.Item>서비스의 정상적인 운영을 방해하거나 보안을 우회하려는 행위</List.Item>
          <List.Item>서비스를 영리 목적의 자동화된 수단으로 이용하거나 무단으로 크롤링하는 행위</List.Item>
          <List.Item>법령, 공서양속, 사회 통념상 부적절한 게시물을 등록하는 행위</List.Item>
          <List.Item>제3자의 지적재산권·초상권·명예 등 권리를 침해하는 행위</List.Item>
        </List>
      </Article>

      <Article id="art12" title="제12조 (서비스 이용 제한)">
        <Text>
          회사는 회원이 본 약관 또는 관련 법령을 위반한 경우 사전 통지 없이 서비스 이용을 일시 정지하거나 영구적으로 제한할 수 있으며, 이로 인해 발생한 손해에 대하여는 회사가 책임을 지지 않습니다.
        </Text>
      </Article>

      <Article id="art13" title="제13조 (게시물의 관리)">
        <NumberedClauses
          items={[
            "회원의 게시물이 본 약관 또는 관련 법령에 위배되는 경우, 회사는 사전 통지 없이 해당 게시물을 비공개·삭제할 수 있습니다.",
            "회사는 게시물의 진실성·신뢰성 등 내용에 대해서는 검토 의무를 지지 않으며, 그 내용에 대한 책임은 게시한 회원에게 있습니다.",
          ]}
        />
      </Article>

      <Article id="art14" title="제14조 (게시물의 저작권)">
        <NumberedClauses
          items={[
            "회원이 서비스에 게시·등록한 게시물의 저작권은 해당 회원에게 귀속됩니다.",
            "회사는 회원의 게시물을 회원에게 서비스를 제공하기 위한 범위 내에서만 이용하며, 마케팅·광고·기계학습 등 다른 목적으로 사용하지 않습니다.",
            "회원이 회원 탈퇴 시 본인의 게시물은 처리방침에 따라 삭제됩니다.",
          ]}
        />
      </Article>

      <Article id="art15" title="제15조 (손해배상)">
        <Text>
          회사 또는 회원이 본 약관을 위반하여 상대방에게 손해를 입힌 경우, 위반 당사자는 그 손해에 대하여 배상할 책임을 집니다. 다만, 무료로 제공되는 서비스의 경우 회사의 고의 또는 중과실이 없는 한 손해배상 책임을 지지 않습니다.
        </Text>
      </Article>

      <Article id="art16" title="제16조 (면책조항)">
        <NumberedClauses
          items={[
            "회사는 천재지변, 전쟁, 통신두절, 정전 등 불가항력적 사유로 인하여 서비스를 제공할 수 없는 경우 책임이 면제됩니다.",
            "회사는 회원의 귀책사유로 인한 서비스 이용 장애 또는 데이터 손실에 대하여 책임을 지지 않습니다.",
            "회사가 제공하는 급여 계산, 통계, 캐시플로우 등은 참고용 정보이며, 세무·법률·재무적 결정의 근거로는 별도의 전문가 상담을 권장합니다.",
            "회사는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 분쟁에 대하여 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임도 없습니다.",
          ]}
        />
      </Article>

      <Article id="art17" title="제17조 (분쟁해결 및 관할)">
        <NumberedClauses
          items={[
            "회사와 회원 사이에 발생한 분쟁에 관하여는 대한민국 법령을 준거법으로 합니다.",
            "분쟁이 발생할 경우 양 당사자는 우선 상호 협의하여 해결하도록 노력하며, 협의가 이루어지지 않을 경우 「민사소송법」상의 관할법원에 소를 제기할 수 있습니다.",
          ]}
        />
      </Article>

      <Stack gap="xs" mt="xl">
        <Text fz="sm" c="dimmed">부칙</Text>
        <Text fz="sm" c="dimmed">
          본 약관은 {EFFECTIVE_DATE}부터 시행합니다.
        </Text>
      </Stack>
    </LegalPageLayout>
  );
};

export default TermsPageClient;
