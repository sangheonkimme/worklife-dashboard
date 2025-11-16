import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  IconMenu2,
  IconX,
  IconNotes,
  IconSettings,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { PomodoroWidget } from "./pomodoro/PomodoroWidget";
import { StopwatchWidget } from "./stopwatch/StopwatchWidget";
import logoPc from "@/assets/logo_pc.png";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUiStore } from "@/store/useUiStore";
import { useTranslation } from "react-i18next";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { setColorScheme: setMantineColorScheme } = useMantineColorScheme();
  const colorScheme = useUiStore((state) => state.colorScheme);
  const toggleColorScheme = useUiStore((state) => state.toggleColorScheme);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    status: settingsStatus,
    error: settingsError,
    refetch: refetchSettings,
  } = useUserSettings();

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
      path: "/transactions",
      aliasPaths: ["/expense"] as readonly string[],
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
      path: "/salary",
      aliasPaths: [] as readonly string[],
    },
    {
      key: "notes",
      icon: IconNotes,
      path: "/notes",
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
    (item) =>
      item.path === location.pathname ||
      item.aliasPaths?.includes(location.pathname)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
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
              onClick={() => navigate("/dashboard")}
              aria-label={t('layout.homeAria')}
            >
              <img
                src={logoPc}
                alt="WorkLife Dashboard"
                style={{ height: 32, objectFit: "contain", display: "block" }}
              />
            </UnstyledButton>
          </Group>

          <Group gap="sm">
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
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
                  onClick={() => navigate("/profile")}
                >
                {t('layout.menu.profile')}
              </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={14} />}
                  onClick={() => navigate("/settings")}
                >
                  {t('layout.menu.settings')}
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
            {currentPage?.pageTitle || t('layout.nav.dashboard.pageTitle')}
          </Title>
          {currentPage?.pageDescription && (
            <Text size="xs" c="dimmed" mb="xs">
              {currentPage.pageDescription}
            </Text>
          )}
          <Divider mb="sm" />
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
            {t('layout.nav.heading')}
          </Text>
        </AppShell.Section>

        <AppShell.Section grow>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              item.aliasPaths?.includes(location.pathname);

            return (
              <NavLink
                key={item.path}
                active={isActive}
                label={item.label}
                description={item.description}
                leftSection={<item.icon size={20} stroke={1.5} />}
                onClick={() => {
                  navigate(item.path);
                  closeMobile();
                }}
                mb="xs"
              />
            );
          })}
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <Text size="xs" c="dimmed" ta="center">
            {t('layout.footer')}
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {settingsStatus === "error" && (
          <Alert
            color="red"
            icon={<IconAlertTriangle size={18} />}
            mb="md"
            title={t('layout.alerts.settingsErrorTitle')}
            variant="light"
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="sm" fw={500}>
                  {settingsErrorText()}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('layout.alerts.settingsErrorHint')}
                </Text>
              </div>
              <Button size="xs" variant="light" onClick={() => refetchSettings()}>
                {t('layout.alerts.retry')}
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
            title={desktopOpened ? t('layout.toggle.close') : t('layout.toggle.open')}
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
    </AppShell>
  );
};
