"use client";

import Link from "next/link";
import { Button, Container, Stack, Text, Title } from "@mantine/core";

export default function NotFound() {
  return (
    <Container size="sm" py={120}>
      <Stack align="center" gap="md">
        <Title order={1} fz={96} c="dimmed">
          404
        </Title>
        <Title order={2}>페이지를 찾을 수 없습니다</Title>
        <Text c="dimmed" ta="center">
          요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
        </Text>
        <Button component={Link} href="/dashboard" mt="md">
          대시보드로 돌아가기
        </Button>
      </Stack>
    </Container>
  );
}
