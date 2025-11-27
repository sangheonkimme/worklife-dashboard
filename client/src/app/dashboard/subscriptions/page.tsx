"use client";

import { Stack, Title, Text, Group } from "@mantine/core";
import { SubscriptionSummaryCard } from "@/components/subscriptions/SubscriptionSummaryCard";
import { SubscriptionTable } from "@/components/subscriptions/SubscriptionTable";

const SubscriptionsPage = () => {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>정기구독 관리</Title>
          <Text c="dimmed" size="sm">
            고정비/정기 결제 일정과 금액을 한 곳에서 관리하세요.
          </Text>
        </div>
      </Group>
      <SubscriptionSummaryCard />
      <SubscriptionTable />
    </Stack>
  );
};

export default SubscriptionsPage;
