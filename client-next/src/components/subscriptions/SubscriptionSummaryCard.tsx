import { Card, Group, Stack, Text, Progress, Badge, Divider, Skeleton } from '@mantine/core';
import { IconBellRinging, IconAlertTriangle, IconChartPie } from '@tabler/icons-react';
import { useSubscriptionSummary } from '@/hooks/useSubscriptions';
import { formatCurrency, formatDate } from '@/utils/format';

export const SubscriptionSummaryCard = () => {
  const { data, isLoading } = useSubscriptionSummary();

  if (isLoading || !data) {
    return (
      <Card radius="md" withBorder padding="lg">
        <Stack gap="sm">
          <Skeleton height={24} width="50%" />
          <Skeleton height={32} />
          <Skeleton height={12} />
          <Skeleton height={24} />
        </Stack>
      </Card>
    );
  }

  const { monthlyFixedTotal, upcomingMonthTotal, next7Days, fixedVsVariableRatio } = data;
  const fixedRatioPercent = Math.round((fixedVsVariableRatio.fixedRatio || 0) * 100);

  return (
    <Card radius="md" withBorder padding="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={700}>정기구독 / 고정비</Text>
          <Badge color="teal" variant="light">
            {next7Days.length}건 다가옴
          </Badge>
        </Group>

        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            월 고정비(정기구독 기준)
          </Text>
          <Text fw={700} size="xl">
            {formatCurrency(monthlyFixedTotal)}
          </Text>
        </Stack>

        <Stack gap="xs">
          <Group gap="xs">
            <IconBellRinging size={16} />
            <Text size="sm" fw={600}>
              이번 달 청구 예정
            </Text>
            <Text fw={700}>{formatCurrency(upcomingMonthTotal)}</Text>
          </Group>

          <Group gap="xs">
            <IconChartPie size={16} />
            <Text size="sm" fw={600}>
              고정비 비중
            </Text>
          </Group>
          <Progress value={fixedRatioPercent} color="teal" size="sm" radius="lg" />
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              고정 {formatCurrency(fixedVsVariableRatio.fixed)} / 변동 {formatCurrency(fixedVsVariableRatio.variable)}
            </Text>
            <Badge variant="outline" color="teal">
              {fixedRatioPercent}%
            </Badge>
          </Group>
        </Stack>

        <Divider label="7일 내 청구" />

        <Stack gap="xs">
          {next7Days.length === 0 && (
            <Text size="sm" c="dimmed">
              7일 내 청구 예정이 없습니다.
            </Text>
          )}
          {next7Days.slice(0, 4).map((item) => (
            <Group key={item.id} justify="space-between">
              <Stack gap={2} style={{ flex: 1 }}>
                <Text fw={600} size="sm">
                  {item.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDate(item.nextBillingDate)} · {item.billingCycle.toLowerCase()}
                </Text>
              </Stack>
              <Stack gap={2} align="flex-end">
                <Text fw={600}>{formatCurrency(item.amount)}</Text>
                <Badge size="xs" color={item.status === 'ACTIVE' ? 'teal' : 'gray'} variant="light">
                  {item.status}
                </Badge>
              </Stack>
            </Group>
          ))}
          {next7Days.length > 4 && (
            <Group gap="xs">
              <IconAlertTriangle size={14} />
              <Text size="xs" c="dimmed">
                +{next7Days.length - 4}개 더 있음
              </Text>
            </Group>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
