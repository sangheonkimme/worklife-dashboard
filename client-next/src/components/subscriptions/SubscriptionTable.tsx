import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  ActionIcon,
} from '@mantine/core';
import { IconPencil, IconPlus, IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useCancelSubscription } from '@/hooks/useSubscriptions';
import type { Subscription, SubscriptionFilters, CreateSubscriptionDto } from '@/types/subscription';
import { formatCurrency, formatDate } from '@/utils/format';
import { SubscriptionForm } from './SubscriptionForm';

const statusBadges: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'teal', label: '활성' },
  PAUSED: { color: 'orange', label: '일시중지' },
  CANCELLED: { color: 'gray', label: '취소' },
};

export const SubscriptionTable = () => {
  const [filters, setFilters] = useState<SubscriptionFilters>({ sort: 'nextBillingDate', order: 'asc' });
  const [search, setSearch] = useState('');
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  const { data, isLoading } = useSubscriptions({ ...filters, search });
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const cancelMutation = useCancelSubscription();

  const rows = useMemo(() => data?.data ?? [], [data]);

  const handleSubmit = (values: CreateSubscriptionDto) => {
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          payload: values,
        },
        {
          onSuccess: () => {
            setOpened(false);
            setEditing(null);
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => setOpened(false),
      });
    }
  };

  const handleCancel = (sub: Subscription) => {
    cancelMutation.mutate({ id: sub.id });
  };

  return (
    <>
      <Card radius="md" withBorder padding="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="sm">
              <Select
                placeholder="상태"
                data={[
                  { value: 'ACTIVE', label: '활성' },
                  { value: 'PAUSED', label: '일시중지' },
                  { value: 'CANCELLED', label: '취소' },
                ]}
                clearable
                value={filters.status}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: (value ?? undefined) as SubscriptionFilters['status'] }))
                }
              />
              <Select
                placeholder="정렬"
                data={[
                  { value: 'nextBillingDate', label: '다음 결제일' },
                  { value: 'amount', label: '금액' },
                  { value: 'createdAt', label: '생성일' },
                ]}
                value={filters.sort}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort: (value ?? 'nextBillingDate') as SubscriptionFilters['sort'],
                  }))
                }
              />
              <Select
                placeholder="정렬 방향"
                data={[
                  { value: 'asc', label: '오름차순' },
                  { value: 'desc', label: '내림차순' },
                ]}
                value={filters.order}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    order: (value ?? 'asc') as SubscriptionFilters['order'],
                  }))
                }
              />
            </Group>

            <Group gap="xs">
              <TextInput
                placeholder="검색 (서비스명)"
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
              <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
                새 구독
              </Button>
            </Group>
          </Group>

          <ScrollArea h={460}>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>서비스</Table.Th>
                  <Table.Th>금액</Table.Th>
                  <Table.Th>주기</Table.Th>
                  <Table.Th>다음 결제</Table.Th>
                  <Table.Th>상태</Table.Th>
                  <Table.Th>결제수단</Table.Th>
                  <Table.Th>액션</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text c="dimmed" align="center">
                        불러오는 중...
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {!isLoading && rows.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Stack gap={4} align="center" py="md">
                        <Text fw={600}>정기구독이 없습니다</Text>
                        <Text c="dimmed" size="sm">
                          첫 구독을 추가하고 청구 전에 알림을 받아보세요.
                        </Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                )}
                {rows.map((sub) => (
                  <Table.Tr key={sub.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600}>{sub.name}</Text>
                        <Text size="xs" c="dimmed">
                          {sub.category || '카테고리 없음'}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{formatCurrency(Number(sub.amount))}</Table.Td>
                    <Table.Td>{sub.billingCycle.toLowerCase()}</Table.Td>
                    <Table.Td>{formatDate(sub.nextBillingDate)}</Table.Td>
                    <Table.Td>
                      <Badge color={statusBadges[sub.status]?.color || 'gray'} variant="light">
                        {statusBadges[sub.status]?.label || sub.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{sub.paymentMethod || '-'}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => {
                            setEditing(sub);
                            setOpened(true);
                          }}
                        >
                          <IconPencil size={16} />
                        </ActionIcon>
                        {sub.status !== 'CANCELLED' && (
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() => handleCancel(sub)}
                            loading={cancelMutation.isPending && cancelMutation.variables?.id === sub.id}
                          >
                            취소
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
      </Card>

      <Drawer
        opened={opened}
        onClose={() => {
          setOpened(false);
          setEditing(null);
        }}
        position="right"
        size="lg"
        title={editing ? '구독 수정' : '새 구독 추가'}
        styles={{ title: { fontWeight: 700 } }}
      >
        <SubscriptionForm
          initialValues={
            editing
              ? {
                  ...editing,
                  notifyDaysBefore: editing.notifyDaysBefore ?? 3,
                }
              : { billingCycle: 'MONTHLY', nextBillingDate: dayjs().toISOString(), notifyDaysBefore: 3 }
          }
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Drawer>
    </>
  );
};
