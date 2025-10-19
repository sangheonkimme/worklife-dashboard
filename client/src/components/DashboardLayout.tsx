import { useNavigate, useLocation } from "react-router-dom";
import {
  AppShell,
  Burger,
  Group,
  Title,
  ActionIcon,
  useMantineColorScheme,
  NavLink,
  Text,
  Avatar,
  Menu,
  Divider,
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
} from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();
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
      pageDescription: "",
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
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group gap="md">
              <Title order={3}>워크라이프 대시보드</Title>
              {currentPage && (
                <>
                  <Text c="dimmed">|</Text>
                  <div>
                    <Text fw={600} size="md">
                      {currentPage.pageTitle}
                    </Text>
                    {currentPage.pageDescription && (
                      <Text size="xs" c="dimmed">
                        {currentPage.pageDescription}
                      </Text>
                    )}
                  </div>
                </>
              )}
            </Group>
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

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
