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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoginLoading, loginError, isAuthenticated } = useAuth();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },

    validate: {
      email: (value: string) => {
        if (!value) return "이메일을 입력해주세요";
        if (!/^\S+@\S+$/.test(value)) return "올바른 이메일 형식이 아닙니다";
        return null;
      },
      password: (value: string) => {
        if (!value) return "비밀번호를 입력해주세요";
        if (value.length < 6) return "비밀번호는 최소 6자 이상이어야 합니다";
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      // 에러는 useAuth의 loginError로 처리됨
      console.error("로그인 실패:", err);
    }
  };

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        환영합니다!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        아직 계정이 없으신가요?{" "}
        <Anchor size="sm" component={Link} to="/signup">
          회원가입
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {loginError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="오류"
                color="red"
                variant="light"
              >
                {(
                  loginError as Error & {
                    response?: { data?: { message?: string } };
                  }
                )?.response?.data?.message ||
                  "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."}
              </Alert>
            )}

            <TextInput
              label="이메일"
              placeholder="your@email.com"
              required
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              required
              {...form.getInputProps("password")}
            />

            <Group justify="space-between">
              <Checkbox
                label="로그인 상태 유지"
                {...form.getInputProps("rememberMe", { type: "checkbox" })}
              />
              <Anchor size="sm" component={Link} to="/forgot-password">
                비밀번호를 잊으셨나요?
              </Anchor>
            </Group>

            <Button type="submit" fullWidth loading={isLoginLoading}>
              로그인
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
