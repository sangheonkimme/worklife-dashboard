"use client";

import { Title, Text, Stack, List, Table } from "@mantine/core";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const SERVICE_NAME = "Worklife Dashboard";
const EFFECTIVE_DATE = "2026년 5월 2일";
const CONTACT_EMAIL = "railit.biz@gmail.com";

const sections = [
  { id: "intro", label: "서문" },
  { id: "purpose", label: "1. 개인정보의 처리 목적" },
  { id: "items", label: "2. 처리하는 개인정보의 항목" },
  { id: "retention", label: "3. 처리 및 보유 기간" },
  { id: "destroy", label: "4. 개인정보의 파기 절차 및 방법" },
  { id: "thirdparty", label: "5. 개인정보의 제3자 제공" },
  { id: "consign", label: "6. 개인정보 처리의 위탁" },
  { id: "overseas", label: "7. 개인정보의 국외 이전" },
  { id: "rights", label: "8. 정보주체의 권리·의무 및 행사방법" },
  { id: "auto", label: "9. 자동화된 결정에 관한 사항" },
  { id: "cookies", label: "10. 자동 수집 장치(쿠키)의 운영" },
  { id: "security", label: "11. 안전성 확보 조치" },
  { id: "officer", label: "12. 개인정보 보호책임자" },
  { id: "remedy", label: "13. 권익침해 구제방법" },
  { id: "changes", label: "14. 처리방침의 변경" },
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

export const PrivacyPageClient = () => {
  return (
    <LegalPageLayout
      title="개인정보 처리방침"
      effectiveDate={EFFECTIVE_DATE}
      toc={sections}
    >
      <Article id="intro" title="서문">
        <Text>
          {SERVICE_NAME}(이하 &ldquo;서비스&rdquo;)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </Text>
      </Article>

      <Article id="purpose" title="1. 개인정보의 처리 목적">
        <Text>
          서비스는 다음의 목적을 위하여 개인정보를 처리하며, 처리한 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다. 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
        </Text>
        <List spacing={4}>
          <List.Item>홈페이지 회원가입 및 관리: 회원자격 유지·관리, 본인 확인, 부정 이용 방지</List.Item>
          <List.Item>서비스 제공: 가계부·노트·생산성 위젯 등 서비스 기능 제공, 콘텐츠 저장·표시</List.Item>
          <List.Item>고충 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보</List.Item>
        </List>
      </Article>

      <Article id="items" title="2. 처리하는 개인정보의 항목">
        <Text>서비스는 회원가입 및 서비스 제공을 위해 다음의 개인정보 항목을 처리하고 있습니다.</Text>
        <Table withColumnBorders highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>구분</Table.Th>
              <Table.Th>필수 항목</Table.Th>
              <Table.Th>수집 방법</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>회원가입 (이메일)</Table.Td>
              <Table.Td>이메일, 이름, 비밀번호(단방향 해시 저장)</Table.Td>
              <Table.Td>홈페이지 가입 양식</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>회원가입 (Google)</Table.Td>
              <Table.Td>이메일, 이름, 프로필 사진 URL, Google 식별자</Table.Td>
              <Table.Td>Google OAuth 인증</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>서비스 이용 과정</Table.Td>
              <Table.Td>이용자가 직접 입력한 거래 내역, 노트, 첨부파일, 설정 정보</Table.Td>
              <Table.Td>서비스 이용 중 입력</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>자동 수집</Table.Td>
              <Table.Td>접속 IP, 사용자 에이전트, 마지막 로그인 시각, 쿠키</Table.Td>
              <Table.Td>서비스 이용 시 자동 수집</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Article>

      <Article id="retention" title="3. 처리 및 보유 기간">
        <List spacing={4}>
          <List.Item>회원가입 정보: 회원 탈퇴 시까지</List.Item>
          <List.Item>서비스 이용 중 생성된 콘텐츠: 회원 탈퇴 시까지 (탈퇴 시 즉시 삭제)</List.Item>
          <List.Item>접속 기록(IP·로그): 통신비밀보호법에 따른 보존 기간(3개월)</List.Item>
          <List.Item>부정이용 기록: 1년</List.Item>
        </List>
        <Text>
          단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 그 기간 동안 회원정보를 보관합니다.
        </Text>
      </Article>

      <Article id="destroy" title="4. 개인정보의 파기 절차 및 방법">
        <List spacing={4}>
          <List.Item>
            <strong>파기 절차</strong>: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정 기간 저장된 후 파기됩니다. 별도 DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는 다른 목적으로 이용되지 않습니다.
          </List.Item>
          <List.Item>
            <strong>파기 방법</strong>: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법(영구 삭제 / 디스크 포맷)을 사용하여 파기합니다.
          </List.Item>
        </List>
      </Article>

      <Article id="thirdparty" title="5. 개인정보의 제3자 제공">
        <Text>
          서비스는 정보주체의 개인정보를 제1조(처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 제3자에게 제공합니다.
        </Text>
        <Text>
          현재 서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
        </Text>
      </Article>

      <Article id="consign" title="6. 개인정보 처리의 위탁">
        <Text>서비스는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</Text>
        <Table withColumnBorders highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>수탁업체</Table.Th>
              <Table.Th>위탁 업무</Table.Th>
              <Table.Th>위탁 기간</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Vercel Inc.</Table.Td>
              <Table.Td>프론트엔드 호스팅</Table.Td>
              <Table.Td>위탁 계약 종료 시까지</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Render Services Inc.</Table.Td>
              <Table.Td>백엔드 및 데이터베이스 호스팅</Table.Td>
              <Table.Td>위탁 계약 종료 시까지</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Google LLC</Table.Td>
              <Table.Td>OAuth 로그인 인증 처리</Table.Td>
              <Table.Td>회원 탈퇴 또는 서비스 종료 시까지</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Text fz="sm">
          서비스는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서에 명시하고 수탁자가 개인정보를 안전하게 처리하는지를 감독합니다.
        </Text>
      </Article>

      <Article id="overseas" title="7. 개인정보의 국외 이전">
        <Text>
          서비스의 위탁업체(Vercel, Render, Google) 중 일부는 미국 등 해외에 위치한 서버에서 데이터를 처리할 수 있습니다. 이 경우 개인정보의 국외 이전이 이루어지며, 이전되는 개인정보 항목·이전 국가·일시·방법·이전받는 자의 개인정보 보호책임자 연락처는 본 처리방침의 관련 조항에 따릅니다. 정보주체는 「개인정보 보호법」 제28조의8에 따라 국외 이전을 거부할 권리가 있으며, 거부 시 일부 서비스 이용이 제한될 수 있습니다.
        </Text>
      </Article>

      <Article id="rights" title="8. 정보주체의 권리·의무 및 행사방법">
        <Text>
          정보주체는 서비스에 대해 언제든지 다음 각 호의 권리를 행사할 수 있습니다.
        </Text>
        <List spacing={4}>
          <List.Item>개인정보 열람 요구</List.Item>
          <List.Item>오류 등이 있을 경우 정정 요구</List.Item>
          <List.Item>삭제 요구</List.Item>
          <List.Item>처리 정지 요구</List.Item>
          <List.Item>개인정보 전송 요구</List.Item>
        </List>
        <Text>
          위 권리 행사는 서비스 내 프로필·설정 페이지를 통해 직접 하시거나, 본 처리방침 제12조의 보호책임자 연락처로 서면·전화·이메일을 통해 요청하실 수 있으며, 서비스는 지체 없이 조치합니다.
        </Text>
      </Article>

      <Article id="auto" title="9. 자동화된 결정에 관한 사항">
        <Text>
          서비스는 정보주체의 권리 또는 의무에 중대한 영향을 미치는 자동화된 결정(완전히 자동화된 시스템에 의한 의사결정)을 수행하지 않습니다.
        </Text>
      </Article>

      <Article id="cookies" title="10. 자동 수집 장치(쿠키)의 운영">
        <List spacing={4}>
          <List.Item>
            서비스는 이용자의 인증 상태 유지를 위해 NextAuth가 발급한 세션 쿠키(httpOnly)를 사용합니다.
          </List.Item>
          <List.Item>
            세션 쿠키는 로그인 유지 외 목적으로 사용되지 않으며, 로그아웃 또는 만료 시 자동 삭제됩니다.
          </List.Item>
          <List.Item>
            서비스는 광고 추적용 쿠키나 외부 추적 픽셀을 사용하지 않습니다.
          </List.Item>
          <List.Item>
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.
          </List.Item>
        </List>
      </Article>

      <Article id="security" title="11. 안전성 확보 조치">
        <Text>
          서비스는 「개인정보 보호법」 제29조에 따라 다음과 같은 안전성 확보 조치를 취하고 있습니다.
        </Text>
        <List spacing={4}>
          <List.Item>
            <strong>관리적 조치</strong>: 내부관리계획 수립·시행, 정기적 직원 교육, 접근 권한 최소화
          </List.Item>
          <List.Item>
            <strong>기술적 조치</strong>: 비밀번호 단방향 해시(bcrypt) 저장, 인증 토큰 httpOnly 쿠키 보관, HTTPS 전송 구간 암호화, 접근통제 시스템 설치, 침입 차단 시스템 운영
          </List.Item>
          <List.Item>
            <strong>물리적 조치</strong>: 클라우드 호스팅 사업자(Vercel, Render)의 데이터센터 보안 정책 준수
          </List.Item>
        </List>
      </Article>

      <Article id="officer" title="12. 개인정보 보호책임자">
        <Text>
          서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
        </Text>
        <Table withColumnBorders highlightOnHover withTableBorder>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td style={{ width: 140 }}>구분</Table.Td>
              <Table.Td>개인정보 보호책임자</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>연락처(이메일)</Table.Td>
              <Table.Td>{CONTACT_EMAIL}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Article>

      <Article id="remedy" title="13. 권익침해 구제방법">
        <Text>
          정보주체는 개인정보 침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
        </Text>
        <List spacing={4}>
          <List.Item>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</List.Item>
          <List.Item>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</List.Item>
          <List.Item>대검찰청: (국번없이) 1301 (www.spo.go.kr)</List.Item>
          <List.Item>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</List.Item>
        </List>
      </Article>

      <Article id="changes" title="14. 처리방침의 변경">
        <Text>
          본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전(중대한 변경의 경우 30일 전)부터 서비스 내 공지사항을 통하여 고지합니다.
        </Text>
      </Article>

      <Stack gap="xs" mt="xl">
        <Text fz="sm" c="dimmed">부칙</Text>
        <Text fz="sm" c="dimmed">
          본 방침은 {EFFECTIVE_DATE}부터 시행됩니다.
        </Text>
      </Stack>
    </LegalPageLayout>
  );
};

export default PrivacyPageClient;
