import { useState, useEffect } from 'react'
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
  Group,
  Box,
  Progress,
  Popover,
  Alert,
  Checkbox,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// 비밀번호 강도 계산 함수
function getPasswordStrength(password: string): {
  strength: number
  color: string
  label: string
} {
  let strength = 0

  if (password.length >= 8) strength += 20
  if (password.length >= 12) strength += 10
  if (/[a-z]/.test(password)) strength += 20
  if (/[A-Z]/.test(password)) strength += 20
  if (/[0-9]/.test(password)) strength += 15
  if (/[^A-Za-z0-9]/.test(password)) strength += 15

  let color = 'red'
  let label = '약함'

  if (strength >= 70) {
    color = 'teal'
    label = '강함'
  } else if (strength >= 50) {
    color = 'yellow'
    label = '보통'
  }

  return { strength, color, label }
}

// 비밀번호 요구사항 체크
function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean
  label: string
}) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      size="sm"
      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      {meets ? <IconCheck size={14} /> : <IconX size={14} />}
      <span>{label}</span>
    </Text>
  )
}

interface FormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export const SignupPage = () => {
  const { register, isRegisterLoading, registerError, isAuthenticated } = useAuth()
  const [popoverOpened, setPopoverOpened] = useState(false)

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },

    validate: {
      name: (value: string) => {
        if (!value) return '이름을 입력해주세요'
        if (value.length < 2) return '이름은 최소 2자 이상이어야 합니다'
        return null
      },
      email: (value: string) => {
        if (!value) return '이메일을 입력해주세요'
        if (!/^\S+@\S+$/.test(value)) return '올바른 이메일 형식이 아닙니다'
        return null
      },
      password: (value: string) => {
        if (!value) return '비밀번호를 입력해주세요'
        if (value.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다'
        if (!/[A-Z]/.test(value)) return '대문자를 하나 이상 포함해야 합니다'
        if (!/[a-z]/.test(value)) return '소문자를 하나 이상 포함해야 합니다'
        if (!/[0-9]/.test(value)) return '숫자를 하나 이상 포함해야 합니다'
        return null
      },
      confirmPassword: (value: string, values: FormValues) => {
        if (!value) return '비밀번호 확인을 입력해주세요'
        if (value !== values.password) return '비밀번호가 일치하지 않습니다'
        return null
      },
      agreeToTerms: (value: boolean) => {
        if (!value) return '이용약관에 동의해주세요'
        return null
      },
    },
  })

  const passwordStrength = getPasswordStrength(form.values.password)

  const checks = [
    { meets: form.values.password.length >= 8, label: '최소 8자 이상' },
    { meets: /[A-Z]/.test(form.values.password), label: '대문자 포함' },
    { meets: /[a-z]/.test(form.values.password), label: '소문자 포함' },
    { meets: /[0-9]/.test(form.values.password), label: '숫자 포함' },
    {
      meets: /[^A-Za-z0-9]/.test(form.values.password),
      label: '특수문자 포함 (권장)',
    },
  ]

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      })
    } catch (err) {
      // 에러는 useAuth의 registerError로 처리됨
      console.error('회원가입 실패:', err)
    }
  }

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard'
    }
  }, [isAuthenticated])

  return (
    <Container size={460} my={40}>
      <Title ta="center" fw={900}>
        계정 만들기
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        이미 계정이 있으신가요?{' '}
        <Anchor size="sm" component={Link} to="/login">
          로그인
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {registerError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="오류"
                color="red"
                variant="light"
              >
                {(registerError as Error & { response?: { data?: { message?: string } } })?.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'}
              </Alert>
            )}

            <TextInput
              label="이름"
              placeholder="홍길동"
              required
              {...form.getInputProps('name')}
            />

            <TextInput
              label="이메일"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />

            <Popover
              opened={popoverOpened}
              position="bottom"
              width="target"
              transitionProps={{ transition: 'pop' }}
            >
              <Popover.Target>
                <div
                  onFocusCapture={() => setPopoverOpened(true)}
                  onBlurCapture={() => setPopoverOpened(false)}
                >
                  <PasswordInput
                    label="비밀번호"
                    placeholder="안전한 비밀번호를 입력하세요"
                    required
                    {...form.getInputProps('password')}
                  />
                </div>
              </Popover.Target>
              <Popover.Dropdown>
                <Box>
                  <Group gap="xs" mb="xs">
                    <Text size="sm" fw={500}>
                      비밀번호 강도: {passwordStrength.label}
                    </Text>
                  </Group>
                  <Progress
                    value={passwordStrength.strength}
                    color={passwordStrength.color}
                    size="sm"
                    mb="sm"
                  />
                  <Stack gap={5}>
                    {checks.map((check, index) => (
                      <PasswordRequirement
                        key={index}
                        meets={check.meets}
                        label={check.label}
                      />
                    ))}
                  </Stack>
                </Box>
              </Popover.Dropdown>
            </Popover>

            <PasswordInput
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              required
              {...form.getInputProps('confirmPassword')}
            />

            <Checkbox
              label={
                <Text size="sm">
                  <Anchor size="sm" href="#" onClick={(e) => e.preventDefault()}>
                    이용약관
                  </Anchor>
                  과{' '}
                  <Anchor size="sm" href="#" onClick={(e) => e.preventDefault()}>
                    개인정보처리방침
                  </Anchor>
                  에 동의합니다
                </Text>
              }
              required
              {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
            />

            <Button type="submit" fullWidth loading={isRegisterLoading}>
              회원가입
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
};

export default SignupPage;
