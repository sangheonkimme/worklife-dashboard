"use client";

import { useEffect, useRef } from 'react';
import {
  Paper,
  Group,
  SegmentedControl,
  NumberInput,
  Select,
  TextInput,
  Button,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconShoppingCart, IconCash, IconPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { categoryApi } from '@/services/api/transactionApi';
import type {
  CategoryType,
  CreateTransactionDto,
} from '@/types/transaction';

interface TransactionQuickAddBarProps {
  onSubmit: (values: CreateTransactionDto) => void;
  loading?: boolean;
  focusSignal?: number;
  resetSignal?: number;
}

export default function TransactionQuickAddBar({
  onSubmit,
  loading,
  focusSignal,
  resetSignal,
}: TransactionQuickAddBarProps) {
  const { t } = useTranslation('finance');
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<CreateTransactionDto>({
    initialValues: {
      type: 'EXPENSE',
      amount: 0,
      categoryId: '',
      date: new Date().toISOString(),
      description: '',
    },
    validate: {
      amount: (value) =>
        value > 0 ? null : t('transactionForm.validation.amount'),
      categoryId: (value) =>
        value ? null : t('transactionForm.validation.category'),
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', form.values.type],
    queryFn: () => categoryApi.getCategories(form.values.type as CategoryType),
  });

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  useEffect(() => {
    if (focusSignal) {
      amountInputRef.current?.focus();
    }
  }, [focusSignal]);

  useEffect(() => {
    if (!resetSignal) return;
    form.setValues((current) => ({
      ...current,
      amount: 0,
      categoryId: '',
      description: '',
      date: new Date().toISOString(),
    }));
    form.setTouched({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const handleSubmit = (values: CreateTransactionDto) => {
    onSubmit(values);
  };

  return (
    <Paper
      component="form"
      withBorder
      shadow="xs"
      radius="md"
      p="sm"
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <Group gap="sm" wrap="wrap" align="flex-end">
        <SegmentedControl
          size="sm"
          data={[
            {
              value: 'EXPENSE',
              label: (
                <Group gap={4} justify="center">
                  <IconShoppingCart size={14} />
                  <span>{t('transactionForm.types.EXPENSE')}</span>
                </Group>
              ),
            },
            {
              value: 'INCOME',
              label: (
                <Group gap={4} justify="center">
                  <IconCash size={14} />
                  <span>{t('transactionForm.types.INCOME')}</span>
                </Group>
              ),
            },
          ]}
          {...form.getInputProps('type')}
          onChange={(value) => {
            form.setFieldValue('type', value as CategoryType);
            form.setFieldValue('categoryId', '');
          }}
          style={{ minWidth: 180 }}
        />

        <NumberInput
          placeholder={t('transactionForm.placeholders.amount')}
          required
          min={0}
          thousandSeparator=","
          ref={amountInputRef}
          style={{ flex: 1, minWidth: 140 }}
          {...form.getInputProps('amount')}
        />

        <Select
          placeholder={t('transactionForm.placeholders.category')}
          data={categoryOptions}
          required
          searchable
          style={{ flex: 1, minWidth: 160 }}
          {...form.getInputProps('categoryId')}
        />

        <DatePickerInput
          placeholder={t('transactionForm.placeholders.date')}
          value={form.values.date ? new Date(form.values.date) : null}
          onChange={(value) => {
            let nextDate: Date | null = null;
            if (value) {
              nextDate =
                typeof value === 'string' ? new Date(value) : (value as Date);
            }
            form.setFieldValue(
              'date',
              nextDate?.toISOString() || new Date().toISOString()
            );
          }}
          required
          style={{ minWidth: 150 }}
        />

        <TextInput
          placeholder={t('transactionForm.placeholders.memo')}
          style={{ flex: 1, minWidth: 200 }}
          {...form.getInputProps('description')}
        />

        <Button
          type="submit"
          loading={loading}
          leftSection={<IconPlus size={16} />}
        >
          {t('transactionsTab.buttons.addTransaction')}
        </Button>
      </Group>
    </Paper>
  );
}
