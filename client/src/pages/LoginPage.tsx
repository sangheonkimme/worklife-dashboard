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
import { useTranslation } from "react-i18next";

export const LoginPage = () => {
  const navigate = useNavigate();
  const {
    login,
    isLoginLoading,
    loginError,
    isAuthenticated,
    googleLogin,
    googleLoginError,
    // isGoogleLoginLoading,
  } = useAuth();
  const { t, i18n } = useTranslation("auth");

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },

    validate: {
      email: (value: string) => {
        if (!value) return t("login.validation.emailRequired");
        if (!/^\S+@\S+$/.test(value))
          return t("login.validation.emailInvalid");
        return null;
      },
      password: (value: string) => {
        if (!value) return t("login.validation.passwordRequired");
        if (value.length < 6)
          return t("login.validation.passwordLength");
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
      console.error("Login failed:", err);
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
        {t("login.title")}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t("login.subtitle")}{" "}
        <Anchor size="sm" component={Link} to="/signup">
          {t("login.signupLink")}
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {loginError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t("login.alerts.title")}
                color="red"
                variant="light"
              >
                {(() => {
                  // 네트워크 연결 오류 확인

                  if (isAxiosError(loginError)) {
                    if (
                      loginError.code === "ERR_BAD_RESPONSE" ||
                      loginError.code === "ERR_NETWORK" ||
                      loginError.message.includes("Network Error")
                    ) {
                      return t("login.alerts.network");
                    }
                    // 서버 응답이 있는 경우 메시지 사용
                    if (loginError.response?.data?.message) {
                      return loginError.response.data.message;
                    }
                  }
                  // 기본 에러 메시지
                  return t("login.alerts.default");
                })()}
              </Alert>
            )}

            <TextInput
              label={t("login.form.emailLabel")}
              placeholder={t("login.form.emailPlaceholder")}
              required
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label={t("login.form.passwordLabel")}
              placeholder={t("login.form.passwordPlaceholder")}
              required
              {...form.getInputProps("password")}
            />

            <Group justify="space-between">
              <Checkbox
                label={t("login.form.rememberMe")}
                {...form.getInputProps("rememberMe", { type: "checkbox" })}
              />
              <Anchor size="sm" component={Link} to="/forgot-password">
                {t("login.form.forgotPassword")}
              </Anchor>
            </Group>

            <Button type="submit" fullWidth loading={isLoginLoading}>
              {t("login.form.submit")}
            </Button>

            <Divider label={t("login.form.divider")} labelPosition="center" />

            {googleLoginError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t("login.alerts.title")}
                color="red"
                variant="light"
              >
                {(() => {
                  // 네트워크 연결 오류 확인
                  if (isAxiosError(googleLoginError)) {
                    if (
                      googleLoginError.code === "ERR_BAD_RESPONSE" ||
                      googleLoginError.code === "ERR_NETWORK" ||
                      googleLoginError.message.includes("Network Error")
                    ) {
                      return t("login.alerts.network");
                    }
                    // 서버 응답이 있는 경우 메시지 사용
                    if (googleLoginError.response?.data?.message) {
                      return googleLoginError.response.data.message;
                    }
                  }
                  // 기본 에러 메시지
                  return t("login.alerts.googleDefault");
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
                  console.error("Google login failed:", err);
                }
              }}
              onError={() => {
                console.error("Google login failed");
              }}
              text="signin_with"
              width="100%"
              locale={i18n.language}
            />
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
