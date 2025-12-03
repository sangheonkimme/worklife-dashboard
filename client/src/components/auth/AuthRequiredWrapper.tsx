"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle, IconLock } from "@tabler/icons-react";
import {
  Container,
  Card,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Loader,
  Center,
} from "@mantine/core";

interface AuthRequiredWrapperProps {
  children: React.ReactNode;
  showNotification?: boolean;
  blockContent?: boolean;
}

export const AuthRequiredWrapper = ({
  children,
  showNotification = true,
  blockContent = true,
}: AuthRequiredWrapperProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("auth");

  useEffect(() => {
    if (!isLoading && !isAuthenticated && showNotification) {
      notifications.show({
        title: t("loginRequired.title"),
        message: t("loginRequired.description"),
        color: "blue",
        icon: <IconInfoCircle size={18} />,
        autoClose: 5000,
      });
    }
  }, [isLoading, isAuthenticated, showNotification, t]);

  // Show loading state
  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // Show blocking UI if not authenticated and blockContent is true
  if (!isAuthenticated && blockContent) {
    return (
      <Container size="sm" py="xl">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <IconLock size={64} stroke={1.5} style={{ opacity: 0.5 }} />
            <Stack align="center" gap="sm">
              <Title order={2}>{t("loginRequired.title")}</Title>
              <Text c="dimmed" ta="center" size="sm">
                {t("loginRequired.description")}
              </Text>
            </Stack>
            <Group gap="sm">
              <Button onClick={() => router.push("/login")}>
                {t("loginRequired.loginButton")}
              </Button>
              <Button variant="light" onClick={() => router.push("/register")}>
                {t("loginRequired.signupButton")}
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    );
  }

  return <>{children}</>;
};
