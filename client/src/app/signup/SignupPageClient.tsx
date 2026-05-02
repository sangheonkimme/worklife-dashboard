"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

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

export const SignupPageClient = () => {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const {
    register,
    registerError,
    isRegisterLoading,
    googleLogin,
    isGoogleLoginLoading,
    isAuthenticated,
  } = useAuth();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => {
        if (!value) return t("signup.validation.nameRequired");
        if (value.length < 2) return t("signup.validation.nameLength");
        return null;
      },
      email: (value) => {
        if (!value) return t("signup.validation.emailRequired");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t("signup.validation.emailInvalid");
        }
        return null;
      },
      password: (value) => {
        if (!value) return t("signup.validation.passwordRequired");
        if (value.length < 8) return t("signup.validation.passwordLength");
        if (!/[A-Z]/.test(value)) return t("signup.validation.passwordUpper");
        if (!/[a-z]/.test(value)) return t("signup.validation.passwordLower");
        if (!/\d/.test(value)) return t("signup.validation.passwordNumber");
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return t("signup.validation.confirmRequired");
        if (value !== values.password) {
          return t("signup.validation.confirmMismatch");
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      console.error("Signup failed", err);
    }
  };

  return (
    <Container
      size={420}
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      py={40}
    >
      <Title ta="center" fw={900}>
        {t("signup.title")}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t("signup.subtitle")}{" "}
        <Anchor size="sm" component={Link} href="/login">
          {t("signup.loginLink")}
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {registerError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t("signup.alerts.title")}
                color="red"
                variant="light"
              >
                {(() => {
                  if (isAxiosError(registerError)) {
                    if (registerError.response?.data?.message) {
                      return registerError.response.data.message;
                    }
                  }
                  if (registerError instanceof Error) {
                    return registerError.message;
                  }
                  return t("signup.alerts.default");
                })()}
              </Alert>
            )}

            <TextInput
              label={t("signup.form.nameLabel")}
              placeholder={t("signup.form.namePlaceholder")}
              required
              {...form.getInputProps("name")}
            />

            <TextInput
              label={t("signup.form.emailLabel")}
              placeholder="you@example.com"
              required
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label={t("signup.form.passwordLabel")}
              placeholder={t("signup.form.passwordPlaceholder")}
              description="대문자·소문자·숫자 포함 8자 이상"
              required
              {...form.getInputProps("password")}
            />

            <PasswordInput
              label={t("signup.form.confirmPasswordLabel")}
              placeholder={t("signup.form.confirmPasswordPlaceholder")}
              required
              {...form.getInputProps("confirmPassword")}
            />

            <Button type="submit" fullWidth loading={isRegisterLoading}>
              {t("signup.form.submit")}
            </Button>

            <Divider label={t("login.form.divider")} labelPosition="center" />

            <Button
              variant="default"
              fullWidth
              leftSection={<GoogleLogo />}
              onClick={() => googleLogin()}
              loading={isGoogleLoginLoading}
            >
              Google로 시작하기
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default SignupPageClient;
