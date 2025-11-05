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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSun,
  IconMoon,
  IconHome,
  IconUser,
  IconLogout,
  IconBell,
  IconReceipt,
  IconWallet,
  IconCalculator,
  IconMenu2,
  IconX,
  IconNotes,
} from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { WidgetDock } from "./widget-dock/WidgetDock";
import { WidgetSidePanel } from "./widget-dock/WidgetSidePanel";
import { PomodoroWidget } from "./pomodoro/PomodoroWidget";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      icon: IconHome,
      label: "대시보드",
      path: "/dashboard",
      description: "홈 대시보드",
      pageTitle: "대시보드",
      pageDescription: "자주쓰는 기능을 한 눈에 확인 할 수 있습니다.",
    },
    {
      icon: IconCalculator,
      label: "연봉계산기",
      path: "/salary",
      description: "실수령액 계산",
      pageTitle: "연봉 계산기",
      pageDescription: "2025년 기준 세율로 실수령액을 계산합니다",
    },
    {
      icon: IconWallet,
      label: "가계부",
      path: "/expense",
      description: "수입/지출 관리",
      pageTitle: "가계부",
      pageDescription: "수입과 지출을 관리합니다",
    },
    {
      icon: IconReceipt,
      label: "거래내역",
      path: "/transactions",
      description: "거래 내역 조회",
      pageTitle: "거래내역",
      pageDescription: "모든 거래 내역을 조회합니다",
    },
    {
      icon: IconNotes,
      label: "메모",
      path: "/notes",
      description: "메모 관리",
      pageTitle: "메모",
      pageDescription: "메모를 작성하고 관리합니다",
    },
  ];

  const currentPage = navItems.find((item) => item.path === location.pathname);

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
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => navigate("/dashboard")}
              title="홈으로 이동"
            >
              <IconHome size={24} />
            </ActionIcon>
            <Divider orientation="vertical" />
            <Title order={3}>워크라이프 대시보드</Title>
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
                <Menu.Label>계정</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={() => navigate("/profile")}
                >
                  프로필
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>위험 구역</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                >
                  로그아웃
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Title order={5} mb={4}>
            {currentPage?.pageTitle || "대시보드"}
          </Title>
          {currentPage?.pageDescription && (
            <Text size="xs" c="dimmed" mb="xs">
              {currentPage.pageDescription}
            </Text>
          )}
          <Divider mb="sm" />
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
            메뉴
          </Text>
        </AppShell.Section>

        <AppShell.Section grow>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              active={location.pathname === item.path}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size={20} stroke={1.5} />}
              onClick={() => navigate(item.path)}
              mb="xs"
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <Text size="xs" c="dimmed" ta="center">
            © 2024 워크라이프 대시보드
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}

        {/* Floating 메뉴 버튼 */}
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
            title={desktopOpened ? "메뉴 닫기" : "메뉴 열기"}
            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          >
            {desktopOpened ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </ActionIcon>
        </Affix>
      </AppShell.Main>

      {/* 위젯 독 */}
      <WidgetDock />

      {/* 위젯 사이드 패널 */}
      <WidgetSidePanel />

      {/* 포모도로 타이머 플로팅 위젯 */}
      <PomodoroWidget />
    </AppShell>
  );
};
