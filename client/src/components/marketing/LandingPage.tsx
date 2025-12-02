"use client";

import { useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@mantine/core";
import { applyLanguageByIP } from "@/lib/i18n";

const featureKeys = [
  { key: "dashboard", icon: IconChartHistogram },
  { key: "notes", icon: IconUsersGroup },
  { key: "timer", icon: IconFocus2 },
  { key: "files", icon: IconCloud },
  { key: "finance", icon: IconCreditCardPay },
] as const;

const workflowKeys = [
  { key: "morningSync", icon: IconChecklist },
  { key: "studySession", icon: IconBrain },
  { key: "workSprint", icon: IconTargetArrow },
  { key: "eveningReview", icon: IconCalendarTime },
  { key: "autoLogging", icon: IconPlayerPlay },
  { key: "driveSync", icon: IconCloud },
] as const;

const statKeys = [
  { value: "+38%", labelKey: "focusTime", icon: IconTrendingUp },
  { value: "85%", labelKey: "routineRate", icon: IconCheck },
] as const;

export const LandingPage = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated, isLoading, logout, isLoginLoading, isRegisterLoading, isGoogleLoginLoading } = useAuth();
  const { t } = useTranslation("common");

  const isAuthMutating = isLoginLoading || isRegisterLoading || isGoogleLoginLoading;

  // 첫 방문자 IP 기반 언어 감지
  useEffect(() => {
    void applyLanguageByIP();
  }, []);

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
                    {t("landing.header.dashboard")}
                  </Button>
                  <Button
                    variant="light"
                    radius="md"
                    onClick={() => void logout()}
                    loading={isAuthMutating}
                  >
                    {t("landing.header.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button component={NextLink} href="/login" variant="subtle" radius="md">
                    {t("landing.header.login")}
                  </Button>
                  <Button
                    component={NextLink}
                    href="/dashboard"
                    radius="md"
                    color="worklife-navy"
                  >
                    {t("landing.header.explore")}
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
              {t("landing.hero.badge")}
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
                {t("landing.hero.title1")}
                <br />
                <Text
                  component="span"
                  c="worklife-navy.7"
                  fw={700}
                >
                  {t("landing.hero.title2")}
                </Text>
              </Title>

              <Text fz="lg" c="dimmed" ta="center" maw={600}>
                {t("landing.hero.description")}
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
                    {t("landing.hero.gotoDashboard")}
                  </Button>
                  <Button
                    size="lg"
                    radius="md"
                    variant="light"
                    component={NextLink}
                    href="/settings"
                  >
                    {t("landing.hero.settings")}
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
                    {t("landing.header.explore")}
                  </Button>
                  <Button
                    size="lg"
                    radius="md"
                    variant="default"
                    component={NextLink}
                    href="/login"
                  >
                    {t("landing.header.login")}
                  </Button>
                </>
              )}
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt="xl" w="100%">
              {statKeys.map(({ value, labelKey, icon: Icon }) => (
                <Card key={labelKey} p="xl" radius="md" withBorder>
                  <Stack align="center" gap="sm">
                    <Icon size={32} stroke={1.5} color={theme.colors["worklife-navy"][6]} />
                    <Text fw={700} fz={28}>
                      {value}
                    </Text>
                    <Text fz="sm" c="dimmed" ta="center">
                      {t(`landing.stats.${labelKey}`)}
                    </Text>
                  </Stack>
                </Card>
              ))}
              {/* "무료" stat - special case */}
              <Card p="xl" radius="md" withBorder>
                <Stack align="center" gap="sm">
                  <IconSparkles size={32} stroke={1.5} color={theme.colors["worklife-navy"][6]} />
                  <Text fw={700} fz={28}>
                    {t("landing.stats.free")}
                  </Text>
                  <Text fz="sm" c="dimmed" ta="center">
                    {t("landing.stats.free")}
                  </Text>
                </Stack>
              </Card>
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
                {t("landing.features.badge")}
              </Badge>
              <Title order={2} ta="center">
                {t("landing.features.title")}
              </Title>
              <Text c="dimmed" ta="center">
                {t("landing.features.description")}
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" w="100%">
              {featureKeys.map(({ key, icon: Icon }) => (
                <Card key={key} p="xl" radius="md" withBorder>
                  <Stack gap="md">
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: theme.radius.md,
                        background: `${theme.colors["worklife-navy"][isDark ? 8 : 1]}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={24} color={theme.colors["worklife-navy"][6]} />
                    </Box>
                    <Stack gap="xs">
                      <Text fw={600} fz="lg">
                        {t(`landing.features.${key}.title`)}
                      </Text>
                      <Text fz="sm" c="dimmed">
                        {t(`landing.features.${key}.description`)}
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
                {t("landing.workflows.badge")}
              </Badge>
              <Title order={2} ta="center">
                {t("landing.workflows.title")}
              </Title>
              <Text c="dimmed" ta="center">
                {t("landing.workflows.description")}
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md" w="100%">
              {workflowKeys.map(({ key, icon: Icon }) => (
                <Card key={key} p="md" radius="md" withBorder style={{ textAlign: "center" }}>
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
                        {t(`landing.workflows.${key}.title`)}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {t(`landing.workflows.${key}.description`)}
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
                {t("landing.testimonials.badge")}
              </Badge>
              <Title order={2} ta="center">
                {t("landing.testimonials.title")}
              </Title>
            </Stack>

            <Grid gutter="lg" w="100%">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card p="xl" radius="md" withBorder h="100%">
                  <Stack gap="md">
                    <Text fz="lg" fw={500} style={{ lineHeight: 1.6 }}>
                      &ldquo;{t("landing.testimonials.quote1.text")}&rdquo;
                    </Text>
                    <Divider />
                    <Text fz="sm" c="dimmed">
                      {t("landing.testimonials.quote1.author")}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card p="xl" radius="md" withBorder h="100%">
                  <Stack gap="md">
                    <Text fz="lg" fw={500} style={{ lineHeight: 1.6 }}>
                      &ldquo;{t("landing.testimonials.quote2.text")}&rdquo;
                    </Text>
                    <Divider />
                    <Text fz="sm" c="dimmed">
                      {t("landing.testimonials.quote2.author")}
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
                  {t("landing.cta.title")}
                </Title>
                <Text c={isDark ? "gray.0" : "white"} fz="lg" ta="center" style={{ whiteSpace: "pre-line" }}>
                  {t("landing.cta.description")}
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
                  {t("landing.header.explore")}
                </Button>
                <Button size="lg" radius="md" variant="outline" c="white" component={NextLink} href="/login">
                  {t("landing.header.login")}
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
                {t("landing.footer.terms")}
              </Anchor>
              <Anchor component={NextLink} href="/privacy" c="dimmed" underline="never">
                {t("landing.footer.privacy")}
              </Anchor>
              <Anchor component={NextLink} href="/contact" c="dimmed" underline="never">
                {t("landing.footer.contact")}
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
