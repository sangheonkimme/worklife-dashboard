import { useState } from 'react'
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Anchor,
  Stack,
  Checkbox,
  Group,
  Alert,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },

    validate: {
      email: (value) => {
        if (!value) return '이메일을 입력해주세요'
        if (!/^\S+@\S+$/.test(value)) return '올바른 이메일 형식이 아닙니다'
        return null
      },
      password: (value) => {
        if (!value) return '비밀번호를 입력해주세요'
        if (value.length < 6) return '비밀번호는 최소 6자 이상이어야 합니다'
        return null
      },
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    setError(null)

    try {
      // 여기에 실제 로그인 API 호출을 구현하세요
      console.log('로그인 시도:', values)

      // 시뮬레이션을 위한 지연
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 성공 시 대시보드로 이동 (실제로는 토큰 저장 등의 작업 필요)
      // navigate('/dashboard')

      alert('로그인 성공!')
    } catch (err) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        환영합니다!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        아직 계정이 없으신가요?{' '}
        <Anchor size="sm" component={Link} to="/signup">
          회원가입
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="오류"
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            <TextInput
              label="이메일"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              required
              {...form.getInputProps('password')}
            />

            <Group justify="space-between">
              <Checkbox
                label="로그인 상태 유지"
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
              />
              <Anchor size="sm" component={Link} to="/forgot-password">
                비밀번호를 잊으셨나요?
              </Anchor>
            </Group>

            <Button type="submit" fullWidth loading={loading}>
              로그인
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
