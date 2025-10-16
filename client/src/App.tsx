import { useState } from 'react'
import {
  Container,
  Title,
  Button,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  useMantineColorScheme,
  ActionIcon
} from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'

function App() {
  const [count, setCount] = useState(0)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>Vite + React + Mantine</Title>
          <ActionIcon
            onClick={() => toggleColorScheme()}
            variant="default"
            size="lg"
          >
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={500}>
                한글 폰트 테스트 (Pretendard)
              </Text>
              <Badge color="blue" variant="light">
                다크 테마
              </Badge>
            </Group>

            <Text c="dimmed">
              이것은 한글 텍스트입니다. Pretendard 폰트가 올바르게 적용되었는지 확인하세요.
            </Text>

            <Button
              onClick={() => setCount((count) => count + 1)}
              fullWidth
              variant="filled"
            >
              클릭 횟수: {count}
            </Button>

            <Text size="sm" c="dimmed" ta="center">
              버튼을 클릭하여 카운터를 증가시키세요
            </Text>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="xs">
            <Text fw={500}>기술 스택:</Text>
            <Group gap="xs">
              <Badge color="cyan">React</Badge>
              <Badge color="violet">TypeScript</Badge>
              <Badge color="blue">Vite</Badge>
              <Badge color="indigo">Mantine UI</Badge>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

export default App
