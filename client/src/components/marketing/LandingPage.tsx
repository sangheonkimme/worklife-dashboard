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
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
  useMantineColorScheme,
  SimpleGrid,
  Loader,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBolt,
  IconCalendarDollar,
  IconCalculator,
  IconCoins,
  IconLanguage,
  IconLayoutDashboard,
  IconNotebook,
  IconClockHour4,
  IconChecklist,
  IconTargetArrow,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { applyLanguageByIP } from "@/lib/i18n";

const featureKeys = [
  { key: "finance", icon: IconCoins },
  { key: "salary", icon: IconCalculator },
  { key: "subscription", icon: IconCalendarDollar },
  { key: "notes", icon: IconNotebook },
  { key: "productivity", icon: IconClockHour4 },
  { key: "i18n", icon: IconLanguage },
] as const;

const useCaseKeys = [
  { key: "expense", icon: IconCoins },
  { key: "note", icon: IconNotebook },
  { key: "focus", icon: IconTargetArrow },
  { key: "subscriptions", icon: IconCalendarDollar },
] as const;

const highlightKeys = [
  { titleKey: "title1", descKey: "desc1", icon: IconCoins },
  { titleKey: "title2", descKey: "desc2", icon: IconNotebook },
  { titleKey: "title3", descKey: "desc3", icon: IconLayoutDashboard },
] as const;

export const LandingPage = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const {
    isAuthenticated,
    isLoading,
    logout,
    isLoginLoading,
    isRegisterLoading,
    isGoogleLoginLoading,
  } = useAuth();
  const { t } = useTranslation("common");

  const isAuthMutating =
    isLoginLoading || isRegisterLoading || isGoogleLoginLoading;

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
          backgroundColor: isDark
            ? "rgba(26, 27, 30, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
          borderBottom: `1px solid ${
            isDark ? theme.colors.dark[4] : theme.colors.gray[2]
          }`,
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
                  <Button
                    component={NextLink}
                    href="/dashboard"
                    variant="subtle"
                    radius="md"
                  >
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
                  <Button
                    component={NextLink}
                    href="/login"
                    variant="subtle"
                    radius="md"
                  >
                    {t("landing.header.login")}
                  </Button>
                  <Button
                    component={NextLink}
                    href="/signup"
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
                <Text component="span" c="worklife-navy.7" fw={700}>
                  {t("landing.hero.title2")}
                </Text>
              </Title>

              <Text fz="lg" c="dimmed" ta="center" maw={600}>
                {t("landing.hero.description")}
              </Text>
            </Stack>

            <Group gap="md">
              {isAuthenticated ? (
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
              ) : (
                <>
                  <Button
                    size="lg"
                    radius="md"
                    component={NextLink}
                    href="/signup"
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

            {/* Highlights */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="xl" w="100%">
              {highlightKeys.map(({ titleKey, descKey, icon: Icon }) => (
                <Card key={titleKey} p="lg" radius="md" withBorder>
                  <Stack align="center" gap="sm">
                    <Icon
                      size={28}
                      stroke={1.5}
                      color={theme.colors["worklife-navy"][6]}
                    />
                    <Text fw={700} fz="lg">
                      {t(`landing.highlights.${titleKey}`)}
                    </Text>
                    <Text fz="sm" c="dimmed" ta="center">
                      {t(`landing.highlights.${descKey}`)}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        component="section"
        py={{ base: 60, md: 80 }}
        bg={isDark ? theme.colors.dark[8] : theme.colors.gray[0]}
      >
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

      {/* Use cases Section */}
      <Box component="section" py={{ base: 60, md: 80 }}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="sm" maw={700}>
              <Badge variant="light" color="worklife-navy">
                {t("landing.useCases.badge")}
              </Badge>
              <Title order={2} ta="center">
                {t("landing.useCases.title")}
              </Title>
              <Text c="dimmed" ta="center">
                {t("landing.useCases.description")}
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" w="100%">
              {useCaseKeys.map(({ key, icon: Icon }) => (
                <Card key={key} p="xl" radius="md" withBorder>
                  <Group align="flex-start" gap="md" wrap="nowrap">
                    <Box
                      style={{
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        borderRadius: theme.radius.md,
                        background: theme.colors["worklife-navy"][7],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} color="white" />
                    </Box>
                    <Stack gap={4}>
                      <Text fw={600}>
                        {t(`landing.useCases.${key}.title`)}
                      </Text>
                      <Text fz="sm" c="dimmed">
                        {t(`landing.useCases.${key}.description`)}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        component="section"
        py={{ base: 60, md: 100 }}
        bg={isDark ? theme.colors.dark[8] : theme.colors.gray[0]}
      >
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
                <IconChecklist size={36} color="white" />
                <Title order={2} c={isDark ? "gray.0" : "white"} ta="center">
                  {t("landing.cta.title")}
                </Title>
                <Text
                  c={isDark ? "gray.0" : "white"}
                  fz="lg"
                  ta="center"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {t("landing.cta.description")}
                </Text>
              </Stack>
              <Group gap="md">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    radius="md"
                    component={NextLink}
                    href="/dashboard"
                    variant="white"
                    c="dark"
                    rightSection={<IconArrowRight size={18} />}
                  >
                    {t("landing.hero.gotoDashboard")}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      radius="md"
                      component={NextLink}
                      href="/signup"
                      variant="white"
                      c="dark"
                      rightSection={<IconArrowRight size={18} />}
                    >
                      {t("landing.header.explore")}
                    </Button>
                    <Button
                      size="lg"
                      radius="md"
                      variant="outline"
                      c="white"
                      component={NextLink}
                      href="/login"
                    >
                      {t("landing.header.login")}
                    </Button>
                  </>
                )}
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
          borderTop: `1px solid ${
            isDark ? theme.colors.dark[4] : theme.colors.gray[2]
          }`,
        }}
      >
        <Container size="xl">
          <Group justify="space-between" wrap="wrap">
            <Text fz="sm" c="dimmed">
              © {new Date().getFullYear()} Worklife Dashboard. All rights reserved.
            </Text>
            <Group gap="lg" fz="sm">
              <Anchor
                component={NextLink}
                href="/terms"
                c="dimmed"
                underline="never"
              >
                {t("landing.footer.terms")}
              </Anchor>
              <Anchor
                component={NextLink}
                href="/privacy"
                c="dimmed"
                underline="never"
              >
                {t("landing.footer.privacy")}
              </Anchor>
              <Anchor
                component={NextLink}
                href="/contact"
                c="dimmed"
                underline="never"
              >
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
