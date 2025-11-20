"use client";

import NextLink from "next/link";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBolt,
  IconCalendarTime,
  IconChartHistogram,
  IconChecklist,
  IconCreditCardPay,
  IconMessage2,
  IconShieldCheck,
  IconTargetArrow,
  IconUsersGroup,
} from "@tabler/icons-react";

const heroStats = [
  { value: "14일", label: "루틴 구축 평균 기간" },
  { value: "92%", label: "기록 회고 습관 유지율" },
  { value: "24/7", label: "웹 · 모바일 어디서나" },
];

const features = [
  {
    title: "워크 & 라이프 타임라인",
    description:
      "출근길 메모부터 수업 노트까지, 하루의 순간을 하나의 타임라인으로 정리하세요.",
    details: ["모바일 퀵 캡처", "음성 → 텍스트", "분류 추천"],
    icon: IconChartHistogram,
  },
  {
    title: "스터디 & 업무 캘린더",
    description:
      "수업/미팅을 자동 동기화하고, 준비 체크리스트와 참고 자료를 옆에 붙여둘 수 있습니다.",
    details: ["구글/애플 캘린더 연동", "To-do & 자료 첨부", "리마인더"],
    icon: IconCalendarTime,
  },
  {
    title: "리플레이 노트",
    description:
      "중요한 회의나 강의를 구간별로 북마크하고, 다시 볼 때 필요한 포인트를 정리합니다.",
    details: ["타임태그 북마크", "공유 링크", "AI 요약 메모"],
    icon: IconUsersGroup,
  },
];

const workflows = [
  {
    title: "아침 루틴",
    description:
      "하루 목표와 수업/업무 일정을 빠르게 적어두고, 통근 중 모바일로 확인합니다.",
    icon: IconChecklist,
  },
  {
    title: "집중 세션 기록",
    description:
      "Pomodoro·스터디 세션이 끝날 때마다 결과와 느낌을 기록해 다음 과제를 준비합니다.",
    icon: IconCreditCardPay,
  },
  {
    title: "퇴근 후 회고",
    description:
      "하루를 돌아보고 내일 챙길 일을 정리하며, 개인/팀 공유 노트로 바로 전송합니다.",
    icon: IconTargetArrow,
  },
];

const testimonials = [
  {
    quote:
      "업무 중 적어둔 아이디어를 퇴근길에 이어서 보완할 수 있어요. 개인 메모와 팀 메모를 구분할 수 있어 부담 없이 기록합니다.",
    author: "김하늘 / 마케팅 매니저",
  },
  {
    quote:
      "학교-인턴 생활을 동시에 하다 보니 일정이 복잡했는데, 하나의 대시보드에서 정리하고 리마인드까지 받아 큰 도움이 됐어요.",
    author: "박지우 / 대학생 & 인턴",
  },
];

export const LandingPage = () => {
  const theme = useMantineTheme();

  return (
    <Box
      style={{
        background: `linear-gradient(180deg, ${theme.colors["light-gray"][1]} 0%, ${theme.white} 70%)`,
        minHeight: "100vh",
      }}
    >
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.colors["light-gray"][3]}`,
          backgroundColor: "rgba(255,255,255,0.85)",
        }}
      >
        <Container size="lg" py="md">
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon radius="md" size="lg" variant="gradient">
                <IconBolt size={20} />
              </ThemeIcon>
              <Text fw={700} fz="lg">
                Worklife Dashboard
              </Text>
            </Group>
            <Group gap="sm">
              <Anchor
                component={NextLink}
                href="/login"
                fw={500}
                c="dark"
                style={{ textDecoration: "none" }}
              >
                로그인
              </Anchor>
              <Button component={NextLink} href="/signup" radius="md">
                무료로 시작하기
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      <Box component="main">
        <Box component="section" py={80}>
          <Container size="lg">
            <Grid align="center" gutter="xl">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="lg">
                  <Badge
                    size="lg"
                    variant="gradient"
                    gradient={{ from: "worklife-mint.5", to: "sky-blue.6" }}
                    w="fit-content"
                  >
                    더 똑똑한 팀 운영
                  </Badge>
                  <Stack gap="sm">
                    <Title order={1} style={{ fontSize: "48px", lineHeight: 1.2 }}>
                      직장인과 학생을 위한
                      <br />
                      <Text component="span" c="worklife-mint.7">
                        워크라이프 대시보드
                      </Text>
                    </Title>
                    <Text fz="lg" c="dimmed">
                      출근 전 준비, 강의 중 필기, 야근 후 회고까지 일상의 기록을 놓치지
                      마세요. 언제든 꺼내볼 수 있도록 워크와 라이프의 순간을 한 화면에
                      정리해드립니다.
                    </Text>
                  </Stack>
                  <Group gap="md" wrap="wrap">
                    <Button size="lg" radius="md" component={NextLink} href="/signup">
                      지금 무료 체험
                    </Button>
                    <Button
                      size="lg"
                      radius="md"
                      variant="light"
                      component={NextLink}
                      href="/login"
                    >
                      이미 계정이 있어요
                    </Button>
                  </Group>
                  <Divider />
                  <Group gap="xl" wrap="wrap">
                    {heroStats.map((stat) => (
                      <Stack gap={4} key={stat.label}>
                        <Text fw={700} fz={32}>
                          {stat.value}
                        </Text>
                        <Text fz="sm" c="dimmed">
                          {stat.label}
                        </Text>
                      </Stack>
                    ))}
                  </Group>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card
                  radius="xl"
                  padding="xl"
                  style={{
                    boxShadow: "0 30px 80px rgba(58,71,108,0.15)",
                    background: `linear-gradient(145deg, ${theme.colors["worklife-mint"][3]}, ${theme.colors["sky-blue"][3]})`,
                    border: "none",
                  }}
                >
                  <Stack gap="lg">
                    <Group justify="space-between">
                      <Stack gap={4}>
                        <Text fz="sm" fw={600}>
                          오늘의 하이라이트
                        </Text>
                        <Text c="dimmed" fz="sm">
                          통근길 · 캠퍼스 · 사무실 어디서든
                        </Text>
                      </Stack>
                      <Badge size="lg" radius="md" variant="light">
                        SYNC
                      </Badge>
                    </Group>
                    <Stack gap="sm">
                      <Text fw={600}>AM Study & PM Sprint</Text>
                      <Text fz="sm">
                        · 오전 강의 요약 완료, 복습 태그 3개 추가
                        <br />· 오후 제품 디자인 미팅 메모 공유됨
                      </Text>
                    </Stack>
                    <Divider variant="dashed" />
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                      <Stack gap={4}>
                        <Text c="dimmed" fz="sm">
                          오늘의 집중 시간
                        </Text>
                        <Title order={3}>3h 20m</Title>
                        <Text fz="sm" c="forestgreen">
                          +40m 어제보다 더 집중했어요
                        </Text>
                      </Stack>
                      <Stack gap={4}>
                        <Text c="dimmed" fz="sm">
                          남은 과제 & TODO
                        </Text>
                        <Title order={3}>완료 4 / 6</Title>
                        <Text fz="sm">리뷰 요청 1건</Text>
                      </Stack>
                    </SimpleGrid>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Container>
        </Box>

        <Box component="section" py={40}>
          <Container size="lg">
            <Card radius="lg" padding="xl" withBorder>
              <Group justify="space-between" align="center">
                <Stack gap={4}>
                  <Text fw={600}>직장·학교·사이드 프로젝트를 모두 챙기는 사람들에게</Text>
                  <Text fz="sm" c="dimmed">
                    캘린더, 메신저, 노트 앱을 전전하던 기록을 하나로 모아 시간과 에너지를
                    절약하세요.
                  </Text>
                </Stack>
                <Group gap="sm" wrap="wrap">
                  {["직장인", "대학생", "취업준비생", "스터디 모임"].map((label) => (
                    <Badge key={label} radius="sm" variant="light" color="worklife-mint.6">
                      {label}
                    </Badge>
                  ))}
                </Group>
              </Group>
            </Card>
          </Container>
        </Box>

        <Box component="section" py={60}>
          <Container size="lg">
            <Stack gap="xl">
              <Stack gap="sm" align="center">
                <Badge variant="light" color="worklife-mint.6">
                  Why Worklife Dashboard
                </Badge>
                <Title order={2}>일상과 업무 사이를 자연스럽게 연결</Title>
                <Text c="dimmed">
                  바쁜 직장인과 학습자 모두가 “기록 → 회고 → 공유” 흐름을 쉽게 반복할 수
                  있도록 설계했습니다.
                </Text>
              </Stack>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                {features.map(({ title, description, details, icon: Icon }) => (
                  <Card key={title} withBorder radius="lg" padding="xl">
                    <Stack gap="md">
                      <ThemeIcon size={48} radius="md" variant="light" color="worklife-mint.6">
                        <Icon size={28} />
                      </ThemeIcon>
                      <Title order={3}>{title}</Title>
                      <Text c="dimmed" fz="sm">
                        {description}
                      </Text>
                      <List spacing={6} size="sm" icon={<IconShieldCheck size={16} />}>
                        {details.map((item) => (
                          <List.Item key={item}>{item}</List.Item>
                        ))}
                      </List>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        <Box component="section" py={60} bg="var(--mantine-color-body)">
          <Container size="lg">
            <Grid gutter="xl" align="stretch">
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="md">
                  <Badge variant="light" color="worklife-mint.6">
                    Workflows
                  </Badge>
                  <Title order={2}>당신의 루틴을 그대로 옮겨오세요</Title>
                  <Text c="dimmed">
                    하루를 이루는 루틴을 자주 쓰는 도구들과 연결하고, 필요할 때 바로 펼쳐볼 수
                    있도록 돕습니다.
                  </Text>
                  <List
                    spacing="sm"
                    size="sm"
                    icon={
                      <ThemeIcon size={24} radius="xl" variant="light" color="worklife-mint.6">
                        <IconBolt size={16} />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>Slack · 이메일 연결로 실시간 알림</List.Item>
                    <List.Item>Google Drive 연동 증빙 보관</List.Item>
                    <List.Item>팀/권한 별 뷰 & 승인 단계 설정</List.Item>
                  </List>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 7 }}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  {workflows.map(({ title, description, icon: Icon }) => (
                    <Card key={title} radius="lg" padding="lg" withBorder>
                      <Stack gap="sm">
                        <ThemeIcon size={40} radius="md" variant="gradient">
                          <Icon size={24} />
                        </ThemeIcon>
                        <Title order={4}>{title}</Title>
                        <Text fz="sm" c="dimmed">
                          {description}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </Grid.Col>
            </Grid>
          </Container>
        </Box>

        <Box component="section" py={60}>
          <Container size="lg">
            <Stack gap="xl">
              <Stack gap="sm" align="center">
                <Badge variant="light" color="worklife-mint.6">
                  Voices
                </Badge>
                <Title order={2}>사용자들이 전하는 변화</Title>
                <Text c="dimmed">
                  작은 팀일수록 자동화의 가치를 먼저 느꼈습니다. 이미 쓰고 있는 SaaS와
                  연동되어 더욱 빠르게 적응할 수 있어요.
                </Text>
              </Stack>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {testimonials.map(({ quote, author }) => (
                  <Card key={author} padding="xl" radius="lg" withBorder>
                    <Stack gap="md">
                      <ThemeIcon radius="xl" size={48} variant="light" color="worklife-mint.6">
                        <IconMessage2 size={24} />
                      </ThemeIcon>
                      <Text fz="lg" fw={600} style={{ lineHeight: 1.5 }}>
                        “{quote}”
                      </Text>
                      <Text fz="sm" c="dimmed">
                        {author}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        <Box component="section" py={80}>
          <Container size="lg">
            <Card
              radius="xl"
              padding="xl"
              style={{
                background: `linear-gradient(120deg, ${theme.colors["worklife-mint"][4]}, ${theme.colors["sky-blue"][4]})`,
                boxShadow: "0 20px 60px rgba(41,110,104,0.2)",
                border: "none",
              }}
            >
              <Grid align="center">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack gap="sm">
                    <Title order={2} c="dark">
                      오늘의 순간을 기록하고 내일의 성장을 준비하세요
                    </Title>
                    <Text c="dark" fz="lg">
                      무료로 시작해 2주 동안 루틴을 설계해보세요. 학교, 회사, 사이드 프로젝트
                      어디에서든 이어서 기록할 수 있습니다.
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack gap="sm">
                    <Button
                      size="lg"
                      radius="md"
                      component={NextLink}
                      href="/signup"
                      leftSection={<IconShieldCheck size={18} />}
                    >
                      무료 체험 시작
                    </Button>
                    <Button
                      size="lg"
                      radius="md"
                      variant="white"
                      component={NextLink}
                      href="/login"
                    >
                      팀 계정으로 로그인
                    </Button>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          </Container>
        </Box>
      </Box>

      <Box
        component="footer"
        py="xl"
        style={{ borderTop: `1px solid ${theme.colors["light-gray"][3]}` }}
      >
        <Container size="lg">
          <Group justify="space-between">
            <Text fz="sm" c="dimmed">
              © {new Date().getFullYear()} Worklife Dashboard
            </Text>
            <Group gap="lg" fz="sm">
              {[
                { label: "이용약관", href: "/terms" },
                { label: "개인정보 처리방침", href: "/privacy" },
                { label: "문의하기", href: "/contact" },
              ].map(({ label, href }) => (
                <Anchor
                  key={label}
                  component={NextLink}
                  href={href}
                  c="dimmed"
                  underline="never"
                >
                  {label}
                </Anchor>
              ))}
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
