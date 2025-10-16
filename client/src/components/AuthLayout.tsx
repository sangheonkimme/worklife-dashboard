import { Box, useMantineColorScheme, ActionIcon, Group } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Group
        justify="flex-end"
        p="md"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
        }}
      >
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
      </Group>

      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
