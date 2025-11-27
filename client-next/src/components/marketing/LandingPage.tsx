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
  useMantineColorScheme,
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
  IconCloud,
  IconBrain,
  IconFocus2,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@mantine/core";

const heroStats = [
  { value: "+38%", label: "집중 시간 상승" },
  { value: "85%", label: "루틴 유지율" },
  { value: "14일", label: "무료 체험" },
];

const features = [
  {
    title: "WOLIDA Dash",
    description:
      "할 일, 캘린더, 루틴이 자동으로 정렬되는 하루 타임라인. 멀티 앱 전환 없이 흐름을 잇습니다.",
    details: ["루틴/과제 동기화", "타임블록·리마인드", "자동 정렬 타임라인"],
    icon: IconChartHistogram,
  },
  {
    title: "WOLIDA Notes",
    description:
      "강의·회의·스터디 메모를 태그와 자료로 묶어 Dash와 양방향 링크. 복습과 공유가 빠릅니다.",
    details: ["태그/검색", "자료·Drive 링크", "타임라인 연결"],
    icon: IconUsersGroup,
  },
  {
    title: "WOLIDA Focus",
    description:
      "포모도로·타임블록·방해금지로 집중을 설계하고, 끝나면 자동 로그로 남깁니다.",
    details: ["포커스 타이머", "자동 기록", "세션 리포트"],
    icon: IconFocus2,
  },
  {
    title: "WOLIDA Drive",
    description:
      "PDF·이미지·템플릿을 폴더/태그로 관리하고 노트·타임라인에서 바로 미리보기.",
    details: ["구글 드라이브 연동", "양방향 링크", "버전 관리"],
    icon: IconCloud,
  },
  {
    title: "WOLIDA Money",
    description:
      "구독/급여/지출을 주기별로 정리해 달력·알림에 연결. 결제 잊김을 줄입니다.",
    details: ["정기결제 리마인드", "지출 태그", "월간 리포트"],
    icon: IconCreditCardPay,
  },
];

const workflows = [
  {
    title: "Morning Sync",
    description: "기상 후 오늘의 루틴·캘린더·알림을 한 번에 정렬합니다.",
    icon: IconChecklist,
  },
  {
    title: "Study Session",
    description: "타임블록 + Focus 타이머 + 노트를 자동 연결해 학습 로그를 남깁니다.",
    icon: IconBrain,
  },
  {
    title: "Work Sprint",
    description: "스프린트 목표·자료·태스크를 한 보드에서 실행하고 리마인드 받기.",
    icon: IconTargetArrow,
  },
  {
    title: "Evening Review",
    description: "완료/미완료/메모를 회고 템플릿으로 정리하고 내일 계획을 생성.",
    icon: IconCalendarTime,
  },
  {
    title: "Auto Logging",
    description: "타이머·노트·캘린더 이벤트를 하루 타임라인에 자동 저장.",
    icon: IconPlayerPlay,
  },
  {
    title: "Drive Sync",
    description: "구글 드라이브 자료를 바로 링크·미리보기, 제출물 증빙까지 한 번에.",
    icon: IconCloud,
  },
];

const testimonials = [
  {
    quote:
      "포커스 타이머가 끝나면 자동으로 노트에 로그가 쌓여서 회고가 쉬워졌어요. 하루 흐름이 하나의 타임라인으로 정리됩니다.",
    author: "김하늘 / UX 디자이너",
  },
  {
    quote:
      "강의·과제·인턴 업무가 섞여 있었는데, WOLIDA에서 아침에 Sync만 하면 루틴이 자동으로 배치돼요. 집중 시간이 주간 단위로 보입니다.",
    author: "박지우 / 대학생 & 인턴",
  },
];

export const LandingPage = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
   const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isLoginLoading,
    isRegisterLoading,
    isGoogleLoginLoading,
  } = useAuth();

  const isAuthMutating = isLoginLoading || isRegisterLoading || isGoogleLoginLoading;

  return (
    <Box
      style={{
        background: isDark
          ? `linear-gradient(180deg, ${theme.colors.dark[8]} 0%, ${theme.colors.dark[7]} 70%)`
          : `linear-gradient(180deg, ${theme.colors.gray[0]} 0%, ${theme.white} 70%)`,
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
          borderBottom: `1px solid ${
            isDark ? theme.colors.dark[5] : theme.colors.gray[3]
          }`,
          backgroundColor: isDark ? "rgba(16,20,32,0.85)" : "rgba(255,255,255,0.85)",
        }}
      >
        <Container size="lg" py="md">
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon radius="md" size="lg" variant="gradient">
                <IconBolt size={20} />
              </ThemeIcon>
              <Text fw={700} fz="lg">
                WOLIDA
              </Text>
            </Group>
            <Group gap="sm">
              {isLoading ? (
                <Loader size="sm" />
              ) : isAuthenticated ? (
                <>
                  <Badge color="worklife-mint.6" variant="light">
                    {user?.name || user?.email || "로그인됨"}
                  </Badge>
                  <Button component={NextLink} href="/dashboard" radius="md">
                    대시보드
                  </Button>
                  <Button
                    variant="light"
                    radius="md"
                    onClick={() => {
                      void logout();
                    }}
                    loading={isAuthMutating}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Anchor
                    component={NextLink}
                    href="/login"
                    fw={500}
                    c={isDark ? "gray.0" : "dark"}
                    style={{ textDecoration: "none" }}
                  >
                    로그인
                  </Anchor>
                  <Button component={NextLink} href="/signup" radius="md" variant="light">
                    회원가입
                  </Button>
                  <Button component={NextLink} href="/dashboard" radius="md">
                    무료로 시작하기
                  </Button>
                </>
              )}
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
                    Work-Life OS
                  </Badge>
                  <Stack gap="sm">
                    <Title order={1} style={{ fontSize: "48px", lineHeight: 1.2 }}>
                      WOLIDA — 일상을 OS처럼 관리하는
                      <br />
                      <Text component="span" c="worklife-mint.7">
                        단 하나의 대시보드
                      </Text>
                    </Title>
                    <Text fz="lg" c="dimmed">
                      할 일/캘린더 앱을 넘어 루틴·공부·업무·노트·포커스 타이머·자료가 매일
                      자동으로 동기화되는 Work-Life OS. 14일 무료로 집중력과 흐름을 설계하세요.
                    </Text>
                  </Stack>
                  <Group gap="md" wrap="wrap">
                    {isAuthenticated ? (
                      <>
                        <Button size="lg" radius="md" component={NextLink} href="/dashboard">
                          대시보드 바로가기
                        </Button>
                        <Button
                          size="lg"
                          radius="md"
                          variant="light"
                          component={NextLink}
                          href="/settings"
                        >
                          프로필·설정
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="lg" radius="md" component={NextLink} href="/signup">
                          14일 무료로 시작
                        </Button>
                        <Button
                          size="lg"
                          radius="md"
                          variant="light"
                          component={NextLink}
                          href="/login"
                        >
                          팀 로그인
                        </Button>
                      </>
                    )}
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
                    boxShadow: isDark
                      ? "0 30px 80px rgba(0,0,0,0.35)"
                      : "0 30px 80px rgba(58,71,108,0.15)",
                    background: isDark
                      ? `linear-gradient(145deg, ${theme.colors["worklife-mint"][8]}, ${theme.colors["sky-blue"][8]})`
                      : `linear-gradient(145deg, ${theme.colors["worklife-mint"][3]}, ${theme.colors["sky-blue"][3]})`,
                    border: "none",
                  }}
                >
                  <Stack gap="lg">
                    <Group justify="space-between">
                      <Stack gap={4}>
                        <Text fz="sm" fw={600}>
                          Today OS Panel
                        </Text>
                        <Text c="dimmed" fz="sm">
                          루틴 · 캘린더 · 포커스 · 메모 자동 동기화
                        </Text>
                      </Stack>
                      <Badge size="lg" radius="md" variant="light">
                        SYNC ON
                      </Badge>
                    </Group>
                    <Stack gap="sm">
                      <Text fw={600}>Behavior-based Daily Sync</Text>
                      <Text fz="sm">
                        · 아침 루틴 정렬, 회의/강의 자동 배치
                        <br />· 포커스 타이머 종료 시 노트와 로그 자동 저장
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
                          어제보다 +40m, 세션 4회 로그 완료
                        </Text>
                      </Stack>
                      <Stack gap={4}>
                        <Text c="dimmed" fz="sm">
                          오늘의 루틴 진행률
                        </Text>
                        <Title order={3}>완료 6 / 8</Title>
                        <Text fz="sm">다음 알림: 오후 스프린트 2시</Text>
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
                  <Text fw={600}>Work & Life, Organized</Text>
                  <Text fz="sm" c="dimmed">
                    캘린더·노트·포커스·자료를 전전하던 시간을 줄이고, 하루를 하나의 OS처럼
                    설계하세요.
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
                  Why WOLIDA
                </Badge>
                <Title order={2}>일상을 OS처럼, 루틴부터 프로젝트까지 한 판에</Title>
                <Text c="dimmed">
                  “루틴 → 포커스 → 기록 → 회고” 흐름이 자동으로 이어지도록 설계했습니다.
                  멀티앱 전환을 줄이고 인지 부하를 낮춥니다.
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
                  <Title order={2}>Flow Engine으로 하루를 자동 정렬</Title>
                  <Text c="dimmed">
                    아침 Sync부터 저녁 회고, 학습/스프린트까지 흐름을 블록으로 설계하고
                    자동으로 로그를 남깁니다.
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
                    <List.Item>Google Drive 연동으로 자료·증빙 즉시 연결</List.Item>
                    <List.Item>포커스 타이머/노트/캘린더 자동 로그</List.Item>
                    <List.Item>루틴/스프린트 템플릿으로 반복 작업 단축</List.Item>
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
                  포커스·노트·캘린더가 한 흐름으로 묶이면서 집중과 회고가 쉬워집니다.
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
                background: isDark
                  ? `linear-gradient(120deg, ${theme.colors["worklife-mint"][8]}, ${theme.colors["sky-blue"][7]})`
                  : `linear-gradient(120deg, ${theme.colors["worklife-mint"][4]}, ${theme.colors["sky-blue"][4]})`,
                boxShadow: isDark
                  ? "0 20px 60px rgba(0,0,0,0.4)"
                  : "0 20px 60px rgba(41,110,104,0.2)",
                border: "none",
              }}
            >
              <Grid align="center">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack gap="sm">
                    <Title order={2} c={isDark ? "gray.0" : "dark"}>
                      오늘의 순간을 기록하고 내일의 성장을 준비하세요
                    </Title>
                    <Text c={isDark ? "gray.0" : "dark"} fz="lg">
                      지금 WOLIDA로 나만의 Work-Life OS를 시작해보세요. 14일 무료, 카드 등록
                      없이 바로 시작할 수 있습니다.
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack gap="sm">
                    <Button
                      size="lg"
                      radius="md"
                      component={NextLink}
                      href="/dashboard"
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
        style={{
          borderTop: `1px solid ${
            isDark ? theme.colors.dark[5] : theme.colors.gray[3]
          }`,
        }}
      >
        <Container size="lg">
          <Group justify="space-between">
            <Text fz="sm" c="dimmed">
              © {new Date().getFullYear()} WOLIDA
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
