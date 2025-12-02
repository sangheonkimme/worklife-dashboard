"use client";

import NextLink from "next/link";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
  useMantineColorScheme,
  SimpleGrid,
  Divider,
  Center,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBolt,
  IconCalendarTime,
  IconChartHistogram,
  IconChecklist,
  IconCreditCardPay,
  IconUsersGroup,
  IconCloud,
  IconBrain,
  IconFocus2,
  IconTargetArrow,
  IconPlayerPlay,
  IconSparkles,
  IconTrendingUp,
  IconCheck,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@mantine/core";

const features = [
  {
    title: "통합 대시보드",
    description: "할 일, 캘린더, 루틴을 한눈에 관리하는 통합 대시보드",
    icon: IconChartHistogram,
    color: "worklife-navy",
  },
  {
    title: "노트 관리",
    description: "강의, 회의, 스터디 메모를 태그와 검색으로 빠르게 관리",
    icon: IconUsersGroup,
    color: "worklife-navy",
  },
  {
    title: "포커스 타이머",
    description: "포모도로 타이머로 집중하고 자동으로 기록 생성",
    icon: IconFocus2,
    color: "worklife-navy",
  },
  {
    title: "파일 관리",
    description: "PDF, 이미지, 템플릿을 한곳에서 관리하고 공유",
    icon: IconCloud,
    color: "worklife-navy",
  },
  {
    title: "재무 관리",
    description: "구독, 급여, 지출을 자동으로 추적하고 리마인드",
    icon: IconCreditCardPay,
    color: "worklife-navy",
  },
];

const workflows = [
  { title: "Morning Sync", description: "기상 후 루틴 자동 정렬", icon: IconChecklist },
  { title: "Study Session", description: "타임블록 + 노트 자동 연결", icon: IconBrain },
  { title: "Work Sprint", description: "스프린트 목표 실행 및 리마인드", icon: IconTargetArrow },
  { title: "Evening Review", description: "하루 회고 및 내일 계획", icon: IconCalendarTime },
  { title: "Auto Logging", description: "타임라인 자동 저장", icon: IconPlayerPlay },
  { title: "Drive Sync", description: "구글 드라이브 자동 연동", icon: IconCloud },
];

const stats = [
  { value: "+38%", label: "집중 시간 상승", icon: IconTrendingUp },
  { value: "85%", label: "루틴 유지율", icon: IconCheck },
  { value: "무료", label: "모든 기능 이용", icon: IconSparkles },
];

export const LandingPage = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const { user, isAuthenticated, isLoading, logout, isLoginLoading, isRegisterLoading, isGoogleLoginLoading } = useAuth();

  const isAuthMutating = isLoginLoading || isRegisterLoading || isGoogleLoginLoading;

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: isDark
          ? theme.colors.dark[7]
          : `linear-gradient(180deg, ${theme.colors.gray[0]} 0%, ${theme.white} 100%)`,
      }}
    >
      {/* Header */}
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          backgroundColor: isDark ? "rgba(26, 27, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        }}
      >
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Group gap="xs">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: theme.radius.md,
                  background: theme.colors["worklife-navy"][7],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconBolt size={20} color="white" />
              </Box>
              <Text fw={700} fz="xl">
                Worklife Dashboard
              </Text>
            </Group>
            <Group gap="sm">
              {isLoading ? (
                <Loader size="sm" />
              ) : isAuthenticated ? (
                <>
                  <Button component={NextLink} href="/dashboard" variant="subtle" radius="md">
                    대시보드
                  </Button>
                  <Button
                    variant="light"
                    radius="md"
                    onClick={() => void logout()}
                    loading={isAuthMutating}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Button component={NextLink} href="/login" variant="subtle" radius="md">
                    로그인
                  </Button>
                  <Button
                    component={NextLink}
                    href="/dashboard"
                    radius="md"
                    color="worklife-navy"
                  >
                    둘러보기
                  </Button>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box component="section" py={{ base: 60, md: 100 }}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Badge size="lg" radius="md" variant="light" color="worklife-navy">
              Work-Life OS
            </Badge>

            <Stack align="center" gap="md" maw={800}>
              <Title
                order={1}
                ta="center"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  lineHeight: 1.2,
                  fontWeight: 800,
                }}
              >
                일상을 OS처럼 관리하는
                <br />
                <Text
                  component="span"
                  c="worklife-navy.7"
                  fw={700}
                >
                  단 하나의 대시보드
                </Text>
              </Title>

              <Text fz="lg" c="dimmed" ta="center" maw={600}>
                할 일, 캘린더, 루틴, 공부, 업무, 노트, 포커스 타이머가 매일 자동으로 동기화되는
                Work-Life OS. 지금 바로 무료로 시작하세요.
              </Text>
            </Stack>

            <Group gap="md">
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    radius="md"
                    component={NextLink}
                    href="/dashboard"
                    color="worklife-navy"
                    rightSection={<IconArrowRight size={18} />}
                  >
                    대시보드 바로가기
                  </Button>
                  <Button
                    size="lg"
                    radius="md"
                    variant="light"
                    component={NextLink}
                    href="/settings"
                  >
                    설정
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    radius="md"
                    component={NextLink}
                    href="/dashboard"
                    color="worklife-navy"
                    rightSection={<IconArrowRight size={18} />}
                  >
                    둘러보기
                  </Button>
                  <Button
                    size="lg"
                    radius="md"
                    variant="default"
                    component={NextLink}
                    href="/login"
                  >
                    로그인
                  </Button>
                </>
              )}
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt="xl" w="100%">
              {stats.map(({ value, label, icon: Icon }) => (
                <Card key={label} p="xl" radius="md" withBorder>
                  <Stack align="center" gap="sm">
                    <Icon size={32} stroke={1.5} color={theme.colors["worklife-navy"][6]} />
                    <Text fw={700} fz={28}>
                      {value}
                    </Text>
                    <Text fz="sm" c="dimmed" ta="center">
                      {label}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" py={{ base: 60, md: 80 }} bg={isDark ? theme.colors.dark[8] : theme.colors.gray[0]}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="sm" maw={700}>
              <Badge variant="light" color="worklife-navy">
                핵심 기능
              </Badge>
              <Title order={2} ta="center">
                일상을 OS처럼, 루틴부터 프로젝트까지
              </Title>
              <Text c="dimmed" ta="center">
                루틴 → 포커스 → 기록 → 회고 흐름이 자동으로 이어집니다
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" w="100%">
              {features.map(({ title, description, icon: Icon, color }) => (
                <Card key={title} p="xl" radius="md" withBorder>
                  <Stack gap="md">
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: theme.radius.md,
                        background: `${theme.colors[color][isDark ? 8 : 1]}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={24} color={theme.colors[color][6]} />
                    </Box>
                    <Stack gap="xs">
                      <Text fw={600} fz="lg">
                        {title}
                      </Text>
                      <Text fz="sm" c="dimmed">
                        {description}
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Workflows Section */}
      <Box component="section" py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="sm" maw={700}>
              <Badge variant="light" color="worklife-navy">
                워크플로우
              </Badge>
              <Title order={2} ta="center">
                하루를 자동으로 정렬하는 Flow Engine
              </Title>
              <Text c="dimmed" ta="center">
                아침 Sync부터 저녁 회고까지 흐름을 자동으로 설계합니다
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md" w="100%">
              {workflows.map(({ title, description, icon: Icon }) => (
                <Card key={title} p="md" radius="md" withBorder style={{ textAlign: "center" }}>
                  <Stack gap="sm" align="center">
                    <Center
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: theme.radius.md,
                        background: theme.colors["worklife-navy"][7],
                      }}
                    >
                      <Icon size={20} color="white" />
                    </Center>
                    <Stack gap={4}>
                      <Text fw={600} fz="sm">
                        {title}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {description}
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box component="section" py={{ base: 60, md: 80 }} bg={isDark ? theme.colors.dark[8] : theme.colors.gray[0]}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="sm" maw={700}>
              <Badge variant="light" color="worklife-navy">
                사용자 후기
              </Badge>
              <Title order={2} ta="center">
                실제 사용자들의 변화
              </Title>
            </Stack>

            <Grid gutter="lg" w="100%">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card p="xl" radius="md" withBorder h="100%">
                  <Stack gap="md">
                    <Text fz="lg" fw={500} style={{ lineHeight: 1.6 }}>
                      "포커스 타이머가 끝나면 자동으로 노트에 로그가 쌓여서 회고가 쉬워졌어요. 하루
                      흐름이 하나의 타임라인으로 정리됩니다."
                    </Text>
                    <Divider />
                    <Text fz="sm" c="dimmed">
                      김하늘 / UX 디자이너
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card p="xl" radius="md" withBorder h="100%">
                  <Stack gap="md">
                    <Text fz="lg" fw={500} style={{ lineHeight: 1.6 }}>
                      "강의, 과제, 인턴 업무가 섞여 있었는데, Worklife Dashboard에서 아침에 Sync만 하면 루틴이
                      자동으로 배치돼요. 집중 시간이 주간 단위로 보입니다."
                    </Text>
                    <Divider />
                    <Text fz="sm" c="dimmed">
                      박지우 / 대학생 & 인턴
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box component="section" py={{ base: 60, md: 100 }}>
        <Container size="md">
          <Card
            p="xl"
            radius="xl"
            style={{
              background: isDark
                ? theme.colors["worklife-navy"][8]
                : theme.colors["worklife-navy"][7],
              border: "none",
            }}
          >
            <Stack align="center" gap="xl">
              <Stack align="center" gap="md" maw={600}>
                <Title order={2} c={isDark ? "gray.0" : "white"} ta="center">
                  오늘의 순간을 기록하고 내일의 성장을 준비하세요
                </Title>
                <Text c={isDark ? "gray.0" : "white"} fz="lg" ta="center">
                  지금 Worklife Dashboard로 나만의 Work-Life OS를 시작해보세요.
                  <br />
                  무료로 모든 기능을 이용할 수 있습니다.
                </Text>
              </Stack>
              <Group gap="md">
                <Button
                  size="lg"
                  radius="md"
                  component={NextLink}
                  href="/dashboard"
                  variant="white"
                  c="dark"
                  rightSection={<IconArrowRight size={18} />}
                >
                  둘러보기
                </Button>
                <Button size="lg" radius="md" variant="outline" c="white" component={NextLink} href="/login">
                  로그인
                </Button>
              </Group>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        py="xl"
        style={{
          borderTop: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        }}
      >
        <Container size="xl">
          <Group justify="space-between" wrap="wrap">
            <Text fz="sm" c="dimmed">
              © {new Date().getFullYear()} Worklife Dashboard. All rights reserved.
            </Text>
            <Group gap="lg" fz="sm">
              <Anchor component={NextLink} href="/terms" c="dimmed" underline="never">
                이용약관
              </Anchor>
              <Anchor component={NextLink} href="/privacy" c="dimmed" underline="never">
                개인정보 처리방침
              </Anchor>
              <Anchor component={NextLink} href="/contact" c="dimmed" underline="never">
                문의하기
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
