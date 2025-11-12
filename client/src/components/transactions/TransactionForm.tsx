import { useForm } from '@mantine/form';
import {
  Stack,
  SegmentedControl,
  NumberInput,
  Select,
  Textarea,
  Button,
  Group,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCash, IconShoppingCart } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { categoryApi } from '@/services/api/transactionApi';
import type { CategoryType, CreateTransactionDto } from '@/types/transaction';

interface TransactionFormProps {
  initialValues?: Partial<CreateTransactionDto>;
  onSubmit: (values: CreateTransactionDto) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function TransactionForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) {
  const { t } = useTranslation('finance');
  const form = useForm<CreateTransactionDto>({
    initialValues: {
      type: initialValues?.type || 'EXPENSE',
      amount: initialValues?.amount || 0,
      categoryId: initialValues?.categoryId || '',
      date: initialValues?.date || new Date().toISOString(),
      description: initialValues?.description || '',
    },
    validate: {
      amount: (value) => (value > 0 ? null : t('transactionForm.validation.amount')),
      categoryId: (value) => (value ? null : t('transactionForm.validation.category')),
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', form.values.type],
    queryFn: () => categoryApi.getCategories(form.values.type as CategoryType),
  });

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const handleSubmit = (values: CreateTransactionDto) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <SegmentedControl
          data={[
            {
              value: 'EXPENSE',
              label: (
                <Group gap="xs" justify="center">
                  <IconShoppingCart size={16} />
                  <span>{t('transactionForm.types.EXPENSE')}</span>
                </Group>
              ),
            },
            {
              value: 'INCOME',
              label: (
                <Group gap="xs" justify="center">
                  <IconCash size={16} />
                  <span>{t('transactionForm.types.INCOME')}</span>
                </Group>
              ),
            },
          ]}
          {...form.getInputProps('type')}
          onChange={(value) => {
            form.setFieldValue('type', value as CategoryType);
            form.setFieldValue('categoryId', ''); // Reset selection when type changes
          }}
          fullWidth
        />

        <NumberInput
          label={t('transactionForm.labels.amount')}
          placeholder={t('transactionForm.placeholders.amount')}
          required
          min={0}
          thousandSeparator=","
          {...form.getInputProps('amount')}
        />

        <Select
          label={t('transactionForm.labels.category')}
          placeholder={t('transactionForm.placeholders.category')}
          required
          searchable
          data={categoryOptions}
          {...form.getInputProps('categoryId')}
        />

        <DatePickerInput
          label={t('transactionForm.labels.date')}
          placeholder={t('transactionForm.placeholders.date')}
          required
          value={form.values.date ? new Date(form.values.date) : null}
          onChange={(date) => {
            form.setFieldValue('date', date?.toISOString() || new Date().toISOString());
          }}
        />

        <Textarea
          label={t('transactionForm.labels.memo')}
          placeholder={t('transactionForm.placeholders.memo')}
          minRows={3}
          {...form.getInputProps('description')}
        />

        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="light" onClick={onCancel} disabled={loading}>
              {t('transactionForm.actions.cancel')}
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {t('transactionForm.actions.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
