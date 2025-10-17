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
  const form = useForm<CreateTransactionDto>({
    initialValues: {
      type: initialValues?.type || 'EXPENSE',
      amount: initialValues?.amount || 0,
      categoryId: initialValues?.categoryId || '',
      date: initialValues?.date || new Date().toISOString(),
      description: initialValues?.description || '',
    },
    validate: {
      amount: (value) => (value > 0 ? null : '금액을 입력해주세요'),
      categoryId: (value) => (value ? null : '카테고리를 선택해주세요'),
    },
  });

  // 카테고리 목록 조회
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
                  <span>지출</span>
                </Group>
              ),
            },
            {
              value: 'INCOME',
              label: (
                <Group gap="xs" justify="center">
                  <IconCash size={16} />
                  <span>수입</span>
                </Group>
              ),
            },
          ]}
          {...form.getInputProps('type')}
          onChange={(value) => {
            form.setFieldValue('type', value as CategoryType);
            form.setFieldValue('categoryId', ''); // 타입 변경 시 카테고리 초기화
          }}
          fullWidth
        />

        <NumberInput
          label="금액"
          placeholder="금액을 입력하세요"
          required
          min={0}
          thousandSeparator=","
          {...form.getInputProps('amount')}
        />

        <Select
          label="카테고리"
          placeholder="카테고리를 선택하세요"
          required
          searchable
          data={categoryOptions}
          {...form.getInputProps('categoryId')}
        />

        <DatePickerInput
          label="날짜"
          placeholder="날짜를 선택하세요"
          required
          value={form.values.date ? new Date(form.values.date) : null}
          onChange={(date) => {
            form.setFieldValue('date', date?.toISOString() || new Date().toISOString());
          }}
        />

        <Textarea
          label="메모"
          placeholder="메모를 입력하세요 (선택사항)"
          minRows={3}
          {...form.getInputProps('description')}
        />

        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="light" onClick={onCancel} disabled={loading}>
              취소
            </Button>
          )}
          <Button type="submit" loading={loading}>
            저장
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
