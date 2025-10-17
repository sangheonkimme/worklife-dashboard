import { Paper, Group, Button, TextInput, MultiSelect, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconFilterOff } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/services/api/transactionApi';
import type { TransactionFilters, CategoryType } from '@/types/transaction';

interface TransactionFilterProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

export default function TransactionFilter({ filters, onFiltersChange, onReset }: TransactionFilterProps) {
  // 카테고리 목록 조회
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(undefined, true),
  });

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: `${cat.name} (${cat.type === 'INCOME' ? '수입' : '지출'})`,
  }));

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    onFiltersChange({
      ...filters,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    });
  };

  return (
    <Paper p="md" withBorder>
      <Group gap="md" align="flex-end">
        <DatePickerInput
          type="range"
          label="기간"
          placeholder="기간을 선택하세요"
          value={[
            filters.startDate ? new Date(filters.startDate) : null,
            filters.endDate ? new Date(filters.endDate) : null,
          ]}
          onChange={handleDateRangeChange}
          style={{ flex: 1, minWidth: 200 }}
        />

        <Select
          label="유형"
          placeholder="전체"
          clearable
          data={[
            { value: 'INCOME', label: '수입' },
            { value: 'EXPENSE', label: '지출' },
          ]}
          value={filters.type}
          onChange={(value) =>
            onFiltersChange({
              ...filters,
              type: value as CategoryType | undefined,
            })
          }
          style={{ flex: 1, minWidth: 150 }}
        />

        <MultiSelect
          label="카테고리"
          placeholder="카테고리 선택"
          data={categoryOptions}
          value={filters.categoryId ? [filters.categoryId] : []}
          onChange={(values) =>
            onFiltersChange({
              ...filters,
              categoryId: values[0],
            })
          }
          searchable
          style={{ flex: 1, minWidth: 200 }}
        />

        <TextInput
          label="검색"
          placeholder="메모에서 검색"
          leftSection={<IconSearch size={16} />}
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              search: e.target.value,
            })
          }
          style={{ flex: 1, minWidth: 200 }}
        />

        <Button
          variant="light"
          leftSection={<IconFilterOff size={16} />}
          onClick={onReset}
        >
          초기화
        </Button>
      </Group>
    </Paper>
  );
}
