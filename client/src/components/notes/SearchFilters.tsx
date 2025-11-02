import { Stack, Select, Group, Button, Badge, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconFilter, IconX, IconCalendar } from '@tabler/icons-react';
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

const NOTE_TYPE_OPTIONS = [
  { value: 'TEXT', label: '텍스트' },
  { value: 'CHECKLIST', label: '체크리스트' },
  { value: 'MARKDOWN', label: '마크다운' },
  { value: 'QUICK', label: '빠른 메모' },
];

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
            필터
          </Text>
        </Group>
        {hasActiveFilters && (
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconX size={14} />}
            onClick={onReset}
          >
            초기화
          </Button>
        )}
      </Group>

      <Select
        label="메모 타입"
        placeholder="타입 선택"
        clearable
        data={NOTE_TYPE_OPTIONS}
        value={type}
        onChange={(value) => onTypeChange(value as NoteType | undefined)}
      />

      <DatePickerInput
        label="시작 날짜"
        placeholder="시작 날짜 선택"
        clearable
        leftSection={<IconCalendar size={16} />}
        value={dateFrom}
        onChange={onDateFromChange}
      />

      <DatePickerInput
        label="종료 날짜"
        placeholder="종료 날짜 선택"
        clearable
        leftSection={<IconCalendar size={16} />}
        value={dateTo}
        onChange={onDateToChange}
        minDate={dateFrom || undefined}
      />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          상태
        </Text>
        <Group gap="xs">
          <Badge
            variant={isPinned ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => onPinnedChange(isPinned ? undefined : true)}
          >
            📌 고정됨
          </Badge>
          <Badge
            variant={isFavorite ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => onFavoriteChange(isFavorite ? undefined : true)}
          >
            ⭐ 즐겨찾기
          </Badge>
          <Badge
            variant={isArchived ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => onArchivedChange(isArchived ? undefined : true)}
          >
            📦 보관됨
          </Badge>
        </Group>
      </Stack>
    </Stack>
  );
}
