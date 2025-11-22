"use client";

import { useEffect } from "react";
import {
  AppShell,
  Group,
  Title,
  ActionIcon,
  useMantineColorScheme,
  NavLink,
  Text,
  Avatar,
  Menu,
  Divider,
  Affix,
  UnstyledButton,
  Alert,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSun,
  IconMoon,
  IconHome,
  IconUser,
  IconLogout,
  IconBell,
  IconWallet,
  IconCalculator,
  IconCurrencyWon,
  IconMenu2,
  IconX,
  IconNotes,
  IconSettings,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { StopwatchWidget } from "@/components/stopwatch/StopwatchWidget";
import { WidgetDock, WidgetModal } from "@/components/widget-dock";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUiStore } from "@/store/useUiStore";
import { useTranslation } from "react-i18next";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { setColorScheme: setMantineColorScheme } = useMantineColorScheme();
  const colorScheme = useUiStore((state) => state.colorScheme);
  const setColorSchemePreference = useUiStore(
    (state) => state.setColorSchemePreference
  );
  const { user, logout } = useAuth();
  const {
    settings,
    status: settingsStatus,
    error: settingsError,
    refetch: refetchSettings,
    updateSettings,
  } = useUserSettings();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMantineColorScheme(colorScheme);
  }, [colorScheme, setMantineColorScheme]);

  const { t } = useTranslation("system");

  const settingsErrorText = () => {
    if (typeof settingsError === "string" && settingsError.trim().length > 0) {
      return settingsError;
    }
    return t("layout.alerts.settingsErrorMessage");
  };
  const baseNavItems = [
    {
      key: "transactions",
      icon: IconWallet,
      path: "/dashboard/transactions",
      aliasPaths: ["/dashboard/expense"] as readonly string[],
    },
    {
      key: "dashboard",
      icon: IconHome,
      path: "/dashboard",
      aliasPaths: [] as readonly string[],
    },
    {
      key: "salary",
      icon: IconCalculator,
      path: "/dashboard/salary",
      aliasPaths: [] as readonly string[],
    },
    {
      key: "financeTools",
      icon: IconCurrencyWon,
      path: "/dashboard/finance-tools",
      aliasPaths: [] as readonly string[],
    },
    {
      key: "notes",
      icon: IconNotes,
      path: "/dashboard/notes",
      aliasPaths: [] as readonly string[],
    },
    {
      key: "settings",
      icon: IconSettings,
      path: "/dashboard/settings",
      aliasPaths: [] as readonly string[],
    },
  ] as const;

  const navItems = baseNavItems.map((item) => ({
    ...item,
    label: t(`layout.nav.${item.key}.label`),
    description: t(`layout.nav.${item.key}.description`),
    pageTitle: t(`layout.nav.${item.key}.pageTitle`),
    pageDescription: t(`layout.nav.${item.key}.pageDescription`),
  }));

  const currentPage = navItems.find(
    (item) => item.path === pathname || item.aliasPaths?.includes(pathname)
  );

  const handleColorSchemeToggle = async () => {
    const nextPreference = colorScheme === "dark" ? "light" : "dark";
    setColorSchemePreference(nextPreference);
    setMantineColorScheme(nextPreference);
    try {
      const currentAppearance = settings?.appearance;
      await updateSettings({
        appearance: {
          colorScheme: nextPreference,
          sidebarPinned: currentAppearance?.sidebarPinned ?? true,
          widgetDockPosition: currentAppearance?.widgetDockPosition ?? "right",
          widgetAutoClose: currentAppearance?.widgetAutoClose ?? true,
        },
      });
    } catch (error) {
      console.error("Failed to persist color scheme preference", error);
    }
  };

  const handleLogout = () => {
    void logout();
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <UnstyledButton
              component={Link}
              href="/dashboard"
              aria-label={t("layout.homeAria")}
            >
              <Image
                src="/logo_pc.png"
                alt="WorkLife Dashboard"
                width={128}
                height={32}
                priority
                style={{ height: 32, width: "auto" }}
              />
            </UnstyledButton>
          </Group>

          <Group gap="sm">
            <ActionIcon
              variant="default"
              onClick={() => void handleColorSchemeToggle()}
              size="lg"
            >
              {colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>

            <ActionIcon variant="default" size="lg">
              <IconBell size={18} />
            </ActionIcon>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="default" size="lg" radius="xl">
                  <Avatar size="sm" radius="xl" color="blue">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{t('layout.menu.account')}</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={() => router.push("/dashboard/profile")}
                >
                  {t("layout.menu.profile")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={14} />}
                  onClick={() => router.push("/dashboard/settings")}
                >
                  {t("layout.menu.settings")}
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>{t('layout.menu.danger')}</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                >
                  {t('layout.menu.logout')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Title order={5} mb={4}>
            {currentPage?.pageTitle || t("layout.nav.dashboard.pageTitle")}
          </Title>
          {currentPage?.pageDescription && (
            <Text size="xs" c="dimmed" mb="xs">
              {currentPage.pageDescription}
            </Text>
          )}
          <Divider mb="sm" />
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
            {t("layout.nav.heading")}
          </Text>
        </AppShell.Section>

        <AppShell.Section grow>
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || item.aliasPaths?.includes(pathname);

            return (
              <NavLink
                key={item.path}
                active={isActive}
                label={item.label}
                description={item.description}
                leftSection={<item.icon size={20} stroke={1.5} />}
                component={Link}
                href={item.path}
                onClick={() => closeMobile()}
                mb="xs"
              />
            );
          })}
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <Text size="xs" c="dimmed" ta="center">
            {t("layout.footer")}
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {settingsStatus === "error" && (
          <Alert
            color="red"
            icon={<IconAlertTriangle size={18} />}
            mb="md"
            title={t("layout.alerts.settingsErrorTitle")}
            variant="light"
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="sm" fw={500}>
                  {settingsErrorText()}
                </Text>
                <Text size="xs" c="dimmed">
                  {t("layout.alerts.settingsErrorHint")}
                </Text>
              </div>
              <Button
                size="xs"
                variant="light"
                onClick={() => refetchSettings()}
              >
                {t("layout.alerts.retry")}
              </Button>
            </Group>
          </Alert>
        )}

        {children}

        {/* Floating menu button */}
        <Affix position={{ bottom: 20, left: 20 }}>
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            color="blue"
            onClick={() => {
              toggleMobile();
              toggleDesktop();
            }}
            title={
              desktopOpened ? t("layout.toggle.close") : t("layout.toggle.open")
            }
            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          >
            {desktopOpened ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </ActionIcon>
        </Affix>
      </AppShell.Main>

      {/* Pomodoro floating widget */}
      <PomodoroWidget />

      {/* Stopwatch floating widget */}
      <StopwatchWidget />

      {/* Widget dock */}
      <WidgetDock />

      {/* Widget dock modal container */}
      <WidgetModal />
    </AppShell>
  );
};
