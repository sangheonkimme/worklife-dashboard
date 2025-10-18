import { Stack, Text, Card, Group } from '@mantine/core';
import type { SalaryResult as SalaryResultType } from '@/types/salary';
import { formatCurrencyWithUnit } from '@/utils/salaryCalculator';

interface SalaryResultProps {
  result: SalaryResultType;
}

export function SalaryResult({ result }: SalaryResultProps) {
  return (
    <Stack gap="lg">
      <Text fw={700} size="lg">
        세금 공제한 월 실수령액
      </Text>

      {/* 예상 소득액(월) */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            예상 소득액(월)
          </Text>
          <Text size="xl" fw={700} ta="right">
            {formatCurrencyWithUnit(result.monthlyGrossSalary)}
          </Text>
        </Stack>
      </Card>

      {/* 예상 실수령액(월) - 강조 */}
      <Card
        shadow="md"
        padding="xl"
        radius="md"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Text size="sm" c="white" style={{ opacity: 0.9 }}>
              예상 실수령액(월)
            </Text>
          </Group>
          <Text size="2rem" fw={700} ta="right" c="white">
            {formatCurrencyWithUnit(result.monthlyNetSalary)}
          </Text>
        </Stack>
      </Card>

      {/* 추가 정보 */}
      <Card shadow="sm" padding="md" radius="md" withBorder bg="gray.0">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              연 총급여
            </Text>
            <Text size="sm" fw={500}>
              {formatCurrencyWithUnit(result.annualGrossSalary)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              연 실수령액
            </Text>
            <Text size="sm" fw={500}>
              {formatCurrencyWithUnit(result.annualNetSalary)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              총 공제액(월)
            </Text>
            <Text size="sm" fw={500} c="red">
              -{formatCurrencyWithUnit(result.deductions.total)}
            </Text>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
