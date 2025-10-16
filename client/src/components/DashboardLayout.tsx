import { useState } from 'react'
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
  rem,
  Divider,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconSun,
  IconMoon,
  IconHome,
  IconChartBar,
  IconSettings,
  IconUser,
  IconLogout,
  IconBell,
  IconDashboard,
  IconCalendar,
} from '@tabler/icons-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [active, setActive] = useState(0)

  const navItems = [
    { icon: IconHome, label: '홈', description: '대시보드 홈' },
    { icon: IconDashboard, label: '대시보드', description: '주요 지표' },
    { icon: IconChartBar, label: '분석', description: '데이터 분석' },
    { icon: IconCalendar, label: '일정', description: '캘린더' },
    { icon: IconSettings, label: '설정', description: '시스템 설정' },
  ]

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>워크라이프 대시보드</Title>
          </Group>

          <Group gap="sm">
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size="lg"
            >
              {colorScheme === 'dark' ? (
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
                    JD
                  </Avatar>
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>계정</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>
                  프로필
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  설정
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>위험 구역</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
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
          {navItems.map((item, index) => (
            <NavLink
              key={item.label}
              active={index === active}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size={20} stroke={1.5} />}
              onClick={() => setActive(index)}
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
  )
}
