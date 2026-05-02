"use client";

import { useEffect } from "react";
import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <Container size="sm" py={120}>
      <Stack align="center" gap="md">
        <Title order={2}>문제가 발생했습니다</Title>
        <Text c="dimmed" ta="center">
          페이지를 표시하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </Text>
        {error.digest && (
          <Text size="xs" c="dimmed">
            오류 코드: {error.digest}
          </Text>
        )}
        <Group mt="md">
          <Button variant="default" onClick={() => (window.location.href = "/dashboard")}>
            대시보드로 이동
          </Button>
          <Button onClick={reset}>다시 시도</Button>
        </Group>
      </Stack>
    </Container>
  );
}
