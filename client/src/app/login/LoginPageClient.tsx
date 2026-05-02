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

const GoogleLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 40 48"
    aria-hidden="true"
  >
    <path
      fill="#4285F4"
      d="M39.2 24.45c0-1.55-.16-3.04-.43-4.45H20v8h10.73c-.45 2.53-1.86 4.68-4 6.11v5.05h6.5c3.78-3.48 5.97-8.62 5.97-14.71z"
    />
    <path
      fill="#34A853"
      d="M20 44c5.4 0 9.92-1.79 13.24-4.84l-6.5-5.05C24.95 35.3 22.67 36 20 36c-5.19 0-9.59-3.51-11.15-8.23h-6.7v5.2C5.43 39.51 12.18 44 20 44z"
    />
    <path
      fill="#FABB05"
      d="M8.85 27.77c-.4-1.19-.62-2.46-.62-3.77s.22-2.58.62-3.77v-5.2h-6.7C.78 17.73 0 20.77 0 24s.78 6.27 2.14 8.97l6.71-5.2z"
    />
    <path
      fill="#E94235"
      d="M20 12c2.93 0 5.55 1.01 7.62 2.98l5.76-5.76C29.92 5.98 25.39 4 20 4 12.18 4 5.43 8.49 2.14 15.03l6.7 5.2C10.41 15.51 14.81 12 20 12z"
    />
  </svg>
);
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

export const LoginPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation("auth");
  const {
    login,
    loginError,
    isLoginLoading,
    googleLogin,
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

            <Button
              variant="default"
              fullWidth
              leftSection={<GoogleLogo />}
              onClick={() => googleLogin()}
              loading={isGoogleLoginLoading}
            >
              Google로 로그인
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPageClient;
