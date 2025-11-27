"use client";

import { Stack, Select, Group, Button, Badge, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconFilter, IconX, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { NoteType } from '@/types/note';

interface SearchFiltersProps {
  type?: NoteType;
  dateFrom?: Date;
  dateTo?: Date;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  onTypeChange: (type: NoteType | undefined) => void;
  onDateFromChange: (date: Date | null) => void;
  onDateToChange: (date: Date | null) => void;
  onPinnedChange: (value: boolean | undefined) => void;
  onFavoriteChange: (value: boolean | undefined) => void;
  onArchivedChange: (value: boolean | undefined) => void;
  onReset: () => void;
}

export function SearchFilters({
  type,
  dateFrom,
  dateTo,
  isPinned,
  isFavorite,
  isArchived,
  onTypeChange,
  onDateFromChange,
  onDateToChange,
  onPinnedChange,
  onFavoriteChange,
  onArchivedChange,
  onReset,
}: SearchFiltersProps) {
  const { t } = useTranslation(['notes', 'common']);
  const noteTypeOptions = [
    { value: 'TEXT', label: t('notes:searchFilters.types.TEXT') },
    { value: 'CHECKLIST', label: t('notes:searchFilters.types.CHECKLIST') },
    { value: 'MARKDOWN', label: t('notes:searchFilters.types.MARKDOWN') },
    { value: 'QUICK', label: t('notes:searchFilters.types.QUICK') },
  ];
  const hasActiveFilters =
    type !== undefined ||
    dateFrom !== undefined ||
    dateTo !== undefined ||
    isPinned !== undefined ||
    isFavorite !== undefined ||
    isArchived !== undefined;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <IconFilter size={16} />
          <Text size="sm" fw={600}>
            {t('notes:searchFilters.title')}
          </Text>
        </Group>
        {hasActiveFilters && (
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconX size={14} />}
            onClick={onReset}
          >
            {t('common:actions.reset')}
          </Button>
        )}
      </Group>

      <Select
        label={t('notes:searchFilters.typeLabel')}
        placeholder={t('notes:searchFilters.typePlaceholder')}
        clearable
        data={noteTypeOptions}
        value={type}
        onChange={(value) => onTypeChange(value as NoteType | undefined)}
      />

      <DatePickerInput
        label={t('notes:searchFilters.dateFromLabel')}
        placeholder={t('notes:searchFilters.dateFromPlaceholder')}
        clearable
        leftSection={<IconCalendar size={16} />}
        value={dateFrom}
        onChange={(value) => {
          if (!value) {
            onDateFromChange(null);
            return;
          }
          onDateFromChange(
            typeof value === 'string' ? new Date(value) : (value as Date)
          );
        }}
      />

      <DatePickerInput
        label={t('notes:searchFilters.dateToLabel')}
        placeholder={t('notes:searchFilters.dateToPlaceholder')}
        clearable
        leftSection={<IconCalendar size={16} />}
        value={dateTo}
        onChange={(value) => {
          if (!value) {
            onDateToChange(null);
            return;
          }
          onDateToChange(
            typeof value === 'string' ? new Date(value) : (value as Date)
          );
        }}
        minDate={dateFrom || undefined}
      />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          {t('notes:searchFilters.statusLabel')}
        </Text>
        <Group gap="xs">
          <Badge
            variant={isPinned ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => onPinnedChange(isPinned ? undefined : true)}
          >
            {t('notes:searchFilters.statuses.pinned')}
          </Badge>
          <Badge
            variant={isFavorite ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => onFavoriteChange(isFavorite ? undefined : true)}
          >
            {t('notes:searchFilters.statuses.favorite')}
          </Badge>
          <Badge
            variant={isArchived ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => onArchivedChange(isArchived ? undefined : true)}
          >
            {t('notes:searchFilters.statuses.archived')}
          </Badge>
        </Group>
      </Stack>
    </Stack>
  );
}
