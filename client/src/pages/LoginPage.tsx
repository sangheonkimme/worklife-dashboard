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
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { isAxiosError } from "axios";

export const LoginPage = () => {
  const navigate = useNavigate();
  const {
    login,
    isLoginLoading,
    loginError,
    isAuthenticated,
    googleLogin,
    googleLoginError,
    isGoogleLoginLoading,
  } = useAuth();

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
                {(() => {
                  // 네트워크 연결 오류 확인
                  if (isAxiosError(loginError)) {
                    if (loginError.code === "ERR_NETWORK" || loginError.message.includes("Network Error")) {
                      return "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
                    }
                    // 서버 응답이 있는 경우 메시지 사용
                    if (loginError.response?.data?.message) {
                      return loginError.response.data.message;
                    }
                  }
                  // 기본 에러 메시지
                  return "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
                })()}
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

            <Divider label="또는" labelPosition="center" />

            {googleLoginError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="오류"
                color="red"
                variant="light"
              >
                {(() => {
                  // 네트워크 연결 오류 확인
                  if (isAxiosError(googleLoginError)) {
                    if (googleLoginError.code === "ERR_NETWORK" || googleLoginError.message.includes("Network Error")) {
                      return "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
                    }
                    // 서버 응답이 있는 경우 메시지 사용
                    if (googleLoginError.response?.data?.message) {
                      return googleLoginError.response.data.message;
                    }
                  }
                  // 기본 에러 메시지
                  return "Google 로그인에 실패했습니다. 다시 시도해주세요.";
                })()}
              </Alert>
            )}

            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  if (credentialResponse.credential) {
                    await googleLogin(credentialResponse.credential);
                  }
                } catch (err) {
                  console.error("Google 로그인 실패:", err);
                }
              }}
              onError={() => {
                console.error("Google 로그인 실패");
              }}
              text="signin_with"
              width="100%"
              locale="ko"
            />
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
