"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

export const LoginPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation("auth");
  const {
    login,
    loginError,
    isLoginLoading,
    googleLogin,
    googleLoginError,
    isGoogleLoginLoading,
    isAuthenticated,
  } = useAuth();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate: {
      email: (value: string) => {
        if (!value) return t("login.validation.emailRequired");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t("login.validation.emailInvalid");
        }
        return null;
      },
      password: (value: string) => {
        if (!value) return t("login.validation.passwordRequired");
        if (value.length < 6) {
          return t("login.validation.passwordLength");
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams?.get("redirectTo") ?? "/dashboard";
      router.replace(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleLoginSubmit = async (values: typeof form.values) => {
    try {
      await login(values);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        {t("login.title")}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t("login.subtitle")} {" "}
        <Anchor size="sm" component={Link} href="/signup">
          {t("login.signupLink")}
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleLoginSubmit)}>
          <Stack gap="md">
            {loginError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t("login.alerts.title")}
                color="red"
                variant="light"
              >
                {(() => {
                  if (isAxiosError(loginError)) {
                    if (
                      loginError.code === "ERR_BAD_RESPONSE" ||
                      loginError.code === "ERR_NETWORK" ||
                      loginError.message.includes("Network Error")
                    ) {
                      return t("login.alerts.network");
                    }
                    if (loginError.response?.data?.message) {
                      return loginError.response.data.message;
                    }
                  }
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
              <Anchor size="sm" component={Link} href="/forgot-password">
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
                  if (isAxiosError(googleLoginError)) {
                    if (
                      googleLoginError.code === "ERR_BAD_RESPONSE" ||
                      googleLoginError.code === "ERR_NETWORK" ||
                      googleLoginError.message.includes("Network Error")
                    ) {
                      return t("login.alerts.network");
                    }
                    if (googleLoginError.response?.data?.message) {
                      return googleLoginError.response.data.message;
                    }
                  }
                  return t("login.alerts.googleDefault");
                })()}
              </Alert>
            )}

            <GoogleLogin
              onSuccess={async ({ credential }) => {
                if (credential) {
                  await googleLogin(credential);
                }
              }}
              onError={() => {
                console.error("Google login failed");
              }}
              text="signin_with"
              width="100%"
              locale={i18n.language}
            />

            {isGoogleLoginLoading && (
              <Text size="sm" c="dimmed" ta="center">
                Google 로그인 중...
              </Text>
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPageClient;
