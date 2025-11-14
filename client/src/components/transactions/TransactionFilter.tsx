import { Paper, Group, Button, TextInput, MultiSelect, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconFilterOff } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { categoryApi } from '@/services/api/transactionApi';
import type { TransactionFilters, CategoryType } from '@/types/transaction';

interface TransactionFilterProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

export default function TransactionFilter({ filters, onFiltersChange, onReset }: TransactionFilterProps) {
  const { t } = useTranslation('finance');
  // Fetch category options
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(undefined, true),
  });

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: t('filters.categoryFormat', {
      name: cat.name,
      type: t(`filters.typeOptions.${cat.type}`),
    }),
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
          label={t('filters.dateLabel')}
          placeholder={t('filters.datePlaceholder')}
          value={[
            filters.startDate ? new Date(filters.startDate) : null,
            filters.endDate ? new Date(filters.endDate) : null,
          ]}
          onChange={handleDateRangeChange}
          style={{ flex: 1, minWidth: 200 }}
        />

        <Select
          label={t('filters.typeLabel')}
          placeholder={t('filters.typePlaceholder')}
          clearable
          data={[
            { value: 'INCOME', label: t('filters.typeOptions.INCOME') },
            { value: 'EXPENSE', label: t('filters.typeOptions.EXPENSE') },
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
          label={t('filters.categoryLabel')}
          placeholder={t('filters.categoryPlaceholder')}
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
          label={t('filters.searchLabel')}
          placeholder={t('filters.searchPlaceholder')}
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
          {t('filters.reset')}
        </Button>
      </Group>
    </Paper>
  );
}
