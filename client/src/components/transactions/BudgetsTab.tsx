import { useState } from 'react';
import {
  Stack,
  Paper,
  Group,
  Text,
  Button,
  Modal,
  NumberInput,
  Select,
  Progress,
  ActionIcon,
  SimpleGrid,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { budgetApi, categoryApi } from '@/services/api/transactionApi';
import type { CreateBudgetDto } from '@/types/transaction';
import { formatCurrency } from '@/utils/format';

export default function BudgetsTab() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const monthString = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1
  ).toISOString();

  // 예산 사용 현황 조회
  const { data: budgetStatus } = useQuery({
    queryKey: ['budgetStatus', monthString],
    queryFn: () => budgetApi.getBudgetStatus(monthString),
  });

  // 지출 카테고리 조회
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'EXPENSE'],
    queryFn: () => categoryApi.getCategories('EXPENSE'),
  });

  const form = useForm<CreateBudgetDto>({
    initialValues: {
      categoryId: '',
      amount: 0,
      month: monthString,
    },
    validate: {
      amount: (value) => (value > 0 ? null : '예산을 입력해주세요'),
    },
  });

  // 예산 생성
  const createMutation = useMutation({
    mutationFn: budgetApi.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetStatus'] });
      notifications.show({
        title: '성공',
        message: '예산이 설정되었습니다',
        color: 'teal',
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '예산 설정에 실패했습니다',
        color: 'red',
      });
    },
  });

  // 예산 삭제
  const deleteMutation = useMutation({
    mutationFn: budgetApi.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetStatus'] });
      notifications.show({
        title: '성공',
        message: '예산이 삭제되었습니다',
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '예산 삭제에 실패했습니다',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: CreateBudgetDto) => {
    createMutation.mutate({
      ...values,
      month: monthString,
      categoryId: values.categoryId || undefined,
    });
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: '예산 삭제',
      children: <Text size="sm">정말로 이 예산을 삭제하시겠습니까?</Text>,
      labels: { confirm: '삭제', cancel: '취소' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const categoryOptions = [
    { value: '', label: '전체 예산 (카테고리 없음)' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={600}>
          월간 예산
        </Text>
        <Group>
          <MonthPickerInput
            value={selectedMonth}
            onChange={(value) => value && setSelectedMonth(value)}
            placeholder="월 선택"
            w={200}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            예산 추가
          </Button>
        </Group>
      </Group>

      {/* 전체 예산 요약 */}
      <Paper p="lg" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="lg" fw={600}>
              전체 예산
            </Text>
            {budgetStatus?.total?.budget != null && budgetStatus.total.budget > 0 && (
              <Text
                size="lg"
                fw={700}
                c={budgetStatus.total.isExceeded ? 'red' : 'teal'}
              >
                {formatCurrency(budgetStatus.total.remaining)}
              </Text>
            )}
          </Group>

          {budgetStatus?.total?.budget != null && budgetStatus.total.budget > 0 ? (
            <>
              <Progress
                value={budgetStatus.total.percentage}
                color={
                  budgetStatus.total.isExceeded
                    ? 'red'
                    : budgetStatus.total.percentage > 80
                    ? 'orange'
                    : 'teal'
                }
                size="xl"
              />

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {formatCurrency(budgetStatus.total.spent)} /{' '}
                  {formatCurrency(budgetStatus.total.budget)}
                </Text>
                <Text size="sm" fw={600}>
                  {budgetStatus.total.percentage.toFixed(1)}% 사용
                </Text>
              </Group>
            </>
          ) : (
            <Text c="dimmed" ta="center" py="md">
              설정된 예산이 없습니다
            </Text>
          )}
        </Stack>
      </Paper>

      {/* 카테고리별 예산 */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {budgetStatus?.budgets.map((item) => (
          <Paper key={item.budget.id} p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="xs">
                  {item.budget.category?.color && (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.budget.category.color,
                      }}
                    />
                  )}
                  <Text fw={600}>
                    {item.budget.category?.name || '전체'}
                  </Text>
                </Group>

                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => handleDelete(item.budget.id)}
                  disabled={deleteMutation.isPending}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>

              <Progress
                value={item.percentage}
                color={
                  item.isExceeded
                    ? 'red'
                    : item.percentage > 80
                    ? 'orange'
                    : 'teal'
                }
                size="lg"
              />

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    사용
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(item.spent)}
                  </Text>
                </Stack>

                <Stack gap={0} align="center">
                  <Text size="xs" c="dimmed">
                    예산
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(item.budget.amount)}
                  </Text>
                </Stack>

                <Stack gap={0} align="flex-end">
                  <Text size="xs" c="dimmed">
                    남은 예산
                  </Text>
                  <Text
                    size="sm"
                    fw={600}
                    c={item.isExceeded ? 'red' : 'teal'}
                  >
                    {formatCurrency(item.remaining)}
                  </Text>
                </Stack>
              </Group>

              <Text size="sm" c="dimmed" ta="center">
                {item.percentage.toFixed(1)}% 사용
                {item.isExceeded && ' (초과)'}
              </Text>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      {/* 예산 추가 모달 */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="예산 추가"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="카테고리"
              placeholder="카테고리를 선택하세요"
              data={categoryOptions}
              {...form.getInputProps('categoryId')}
            />

            <NumberInput
              label="예산"
              placeholder="예산을 입력하세요"
              required
              min={0}
              thousandSeparator=","
              {...form.getInputProps('amount')}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setIsModalOpen(false)}
                disabled={createMutation.isPending}
              >
                취소
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                저장
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
