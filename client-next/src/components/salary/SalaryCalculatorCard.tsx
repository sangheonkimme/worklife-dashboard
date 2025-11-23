"use client";

import { Card, Text, Stack, Group, ThemeIcon } from "@mantine/core";
import { IconCalculator, IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function SalaryCalculatorCard() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard/salary");
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" gap="xs">
          <ThemeIcon size="xl" variant="light" color="violet" radius="md">
            <IconCalculator size={24} stroke={1.5} />
          </ThemeIcon>
          <IconArrowRight size={20} color="var(--mantine-color-gray-6)" />
        </Group>

        <div>
          <Text fw={600} size="lg" lh={1.3}>
            연봉 계산기
          </Text>
          <Text size="sm" c="dimmed" mt={2} lh={1.4}>
            실수령액을 간편하게 계산해보세요
          </Text>
        </div>

        <Group gap={6} mt="xs">
          <Text size="xs" c="dimmed" lh={1.4}>
            • 2025년 기준 세율 적용
          </Text>
        </Group>
        <Group gap={6}>
          <Text size="xs" c="dimmed" lh={1.4}>
            • 4대 보험 및 소득세 자동 계산
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
