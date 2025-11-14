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
import { useTranslation, Trans } from 'react-i18next'

// 비밀번호 강도 계산 함수
function getPasswordStrength(password: string): {
  strength: number
  color: string
  labelKey: 'weak' | 'medium' | 'strong'
} {
  let strength = 0

  if (password.length >= 8) strength += 20
  if (password.length >= 12) strength += 10
  if (/[a-z]/.test(password)) strength += 20
  if (/[A-Z]/.test(password)) strength += 20
  if (/[0-9]/.test(password)) strength += 15
  if (/[^A-Za-z0-9]/.test(password)) strength += 15

  let color = 'red'
  let labelKey: 'weak' | 'medium' | 'strong' = 'weak'

  if (strength >= 70) {
    color = 'teal'
    labelKey = 'strong'
  } else if (strength >= 50) {
    color = 'yellow'
    labelKey = 'medium'
  }

  return { strength, color, labelKey }
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
  const { t } = useTranslation('auth')
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
        if (!value) return t('signup.validation.nameRequired')
        if (value.length < 2) return t('signup.validation.nameLength')
        return null
      },
      email: (value: string) => {
        if (!value) return t('signup.validation.emailRequired')
        if (!/^\S+@\S+$/.test(value)) return t('signup.validation.emailInvalid')
        return null
      },
      password: (value: string) => {
        if (!value) return t('signup.validation.passwordRequired')
        if (value.length < 8) return t('signup.validation.passwordLength')
        if (!/[A-Z]/.test(value)) return t('signup.validation.passwordUpper')
        if (!/[a-z]/.test(value)) return t('signup.validation.passwordLower')
        if (!/[0-9]/.test(value)) return t('signup.validation.passwordNumber')
        return null
      },
      confirmPassword: (value: string, values: FormValues) => {
        if (!value) return t('signup.validation.confirmRequired')
        if (value !== values.password) return t('signup.validation.confirmMismatch')
        return null
      },
      agreeToTerms: (value: boolean) => {
        if (!value) return t('signup.validation.terms')
        return null
      },
    },
  })

  const passwordStrength = getPasswordStrength(form.values.password)
  const passwordStrengthLabel = t(`signup.passwordStrength.${passwordStrength.labelKey}`)

  const checks = [
    { meets: form.values.password.length >= 8, label: t('signup.requirements.minLength') },
    { meets: /[A-Z]/.test(form.values.password), label: t('signup.requirements.upper') },
    { meets: /[a-z]/.test(form.values.password), label: t('signup.requirements.lower') },
    { meets: /[0-9]/.test(form.values.password), label: t('signup.requirements.number') },
    {
      meets: /[^A-Za-z0-9]/.test(form.values.password),
      label: t('signup.requirements.symbol'),
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
      console.error('Sign-up failed:', err)
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
        {t('signup.title')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t('signup.subtitle')}{' '}
        <Anchor size="sm" component={Link} to="/login">
          {t('signup.loginLink')}
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {registerError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t('signup.alerts.title')}
                color="red"
                variant="light"
              >
                {(registerError as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ||
                  t('signup.alerts.default')}
              </Alert>
            )}

            <TextInput
              label={t('signup.form.nameLabel')}
              placeholder={t('signup.form.namePlaceholder')}
              required
              {...form.getInputProps('name')}
            />

            <TextInput
              label={t('signup.form.emailLabel')}
              placeholder={t('login.form.emailPlaceholder')}
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
                    label={t('signup.form.passwordLabel')}
                    placeholder={t('signup.form.passwordPlaceholder')}
                    required
                    {...form.getInputProps('password')}
                  />
                </div>
              </Popover.Target>
              <Popover.Dropdown>
                <Box>
                  <Group gap="xs" mb="xs">
                    <Text size="sm" fw={500}>
                      {t('signup.passwordStrengthText', {
                        label: passwordStrengthLabel,
                      })}
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
              label={t('signup.form.confirmPasswordLabel')}
              placeholder={t('signup.form.confirmPasswordPlaceholder')}
              required
              {...form.getInputProps('confirmPassword')}
            />

            <Checkbox
              label={
                <Text size="sm">
                  <Trans
                    i18nKey="auth:signup.form.terms"
                    components={{
                      terms: (
                        <Anchor size="sm" href="#" onClick={(e) => e.preventDefault()} />
                      ),
                      privacy: (
                        <Anchor size="sm" href="#" onClick={(e) => e.preventDefault()} />
                      ),
                    }}
                  />
                </Text>
              }
              required
              {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
            />

            <Button type="submit" fullWidth loading={isRegisterLoading}>
              {t('signup.form.submit')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
};

export default SignupPage;
