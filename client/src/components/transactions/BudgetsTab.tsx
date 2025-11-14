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
import { useTranslation } from 'react-i18next';
import { budgetApi, categoryApi } from '@/services/api/transactionApi';
import type { CreateBudgetDto } from '@/types/transaction';
import { formatCurrency } from '@/utils/format';

export default function BudgetsTab() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { t } = useTranslation('finance');

  const monthString = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1
  ).toISOString();

  // Fetch budget utilization overview
  const { data: budgetStatus } = useQuery({
    queryKey: ['budgetStatus', monthString],
    queryFn: () => budgetApi.getBudgetStatus(monthString),
  });

  // Fetch expense categories
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
      amount: (value) =>
        value > 0 ? null : t('budgetsTab.validation.amountRequired'),
    },
  });

  // Create budget
  const createMutation = useMutation({
    mutationFn: budgetApi.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetStatus'] });
      notifications.show({
        title: t('budgetsTab.notifications.successTitle'),
        message: t('budgetsTab.notifications.createSuccess'),
        color: 'teal',
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      notifications.show({
        title: t('budgetsTab.notifications.errorTitle'),
        message:
          error.response?.data?.message ||
          t('budgetsTab.notifications.createError'),
        color: 'red',
      });
    },
  });

  // Delete budget entry
  const deleteMutation = useMutation({
    mutationFn: budgetApi.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetStatus'] });
      notifications.show({
        title: t('budgetsTab.notifications.successTitle'),
        message: t('budgetsTab.notifications.deleteSuccess'),
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('budgetsTab.notifications.errorTitle'),
        message:
          error.response?.data?.message ||
          t('budgetsTab.notifications.deleteError'),
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
      title: t('budgetsTab.confirmDelete.title'),
      children: <Text size="sm">{t('budgetsTab.confirmDelete.message')}</Text>,
      labels: {
        confirm: t('budgetsTab.confirmDelete.confirm'),
        cancel: t('budgetsTab.confirmDelete.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const categoryOptions = [
    { value: '', label: t('budgetsTab.categoryOptions.all') },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={600}>
          {t('budgetsTab.title')}
        </Text>
        <Group>
          <MonthPickerInput
            value={selectedMonth}
            onChange={(value) => value && setSelectedMonth(value)}
            placeholder={t('budgetsTab.monthPlaceholder')}
            w={200}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('budgetsTab.buttons.add')}
          </Button>
        </Group>
      </Group>

      {/* Overall budget summary */}
      <Paper p="lg" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="lg" fw={600}>
              {t('budgetsTab.summary.title')}
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
                  {t('budgetsTab.summary.usage', {
                    percentage: budgetStatus.total.percentage.toFixed(1),
                  })}
                </Text>
              </Group>
            </>
          ) : (
            <Text c="dimmed" ta="center" py="md">
              {t('budgetsTab.summary.empty')}
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Category budgets */}
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
                    {item.budget.category?.name || t('budgetsTab.cards.all')}
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
                    {t('budgetsTab.cards.spent')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(item.spent)}
                  </Text>
                </Stack>

                <Stack gap={0} align="center">
                  <Text size="xs" c="dimmed">
                    {t('budgetsTab.cards.budget')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(item.budget.amount)}
                  </Text>
                </Stack>

                <Stack gap={0} align="flex-end">
                  <Text size="xs" c="dimmed">
                    {t('budgetsTab.cards.remaining')}
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
                {t('budgetsTab.cards.usage', {
                  percentage: item.percentage.toFixed(1),
                })}
                {item.isExceeded && t('budgetsTab.cards.exceeded')}
              </Text>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Add budget modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('budgetsTab.modal.title')}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label={t('budgetsTab.modal.fields.category.label')}
              placeholder={t('budgetsTab.modal.fields.category.placeholder')}
              data={categoryOptions}
              {...form.getInputProps('categoryId')}
            />

            <NumberInput
              label={t('budgetsTab.modal.fields.amount.label')}
              placeholder={t('budgetsTab.modal.fields.amount.placeholder')}
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
                {t('transactionForm.actions.cancel')}
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {t('transactionForm.actions.submit')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
