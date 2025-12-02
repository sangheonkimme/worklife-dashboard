"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated && showNotification) {
      notifications.show({
        title: "로그인이 필요합니다",
        message: "이 페이지의 모든 기능을 사용하려면 로그인이 필요합니다.",
        color: "blue",
        icon: <IconInfoCircle size={18} />,
        autoClose: 5000,
      });
    }
  }, [isLoading, isAuthenticated, showNotification]);

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
              <Title order={2}>로그인이 필요합니다</Title>
              <Text c="dimmed" ta="center" size="sm">
                이 페이지는 로그인 후 이용할 수 있습니다.
              </Text>
            </Stack>
            <Group gap="sm">
              <Button onClick={() => router.push("/login")}>로그인</Button>
              <Button variant="light" onClick={() => router.push("/signup")}>
                회원가입
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    );
  }

  return <>{children}</>;
};
