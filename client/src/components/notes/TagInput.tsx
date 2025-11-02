import { MultiSelect } from '@mantine/core';
import { useTags } from '@/hooks/useTags';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const { data: tags } = useTags();

  const tagOptions =
    tags?.map((tag) => ({
      value: tag.id,
      label: tag.name,
    })) || [];

  return (
    <MultiSelect
      value={value}
      onChange={onChange}
      data={tagOptions}
      placeholder={placeholder || '태그 선택'}
      searchable
      maxDropdownHeight={200}
      label="태그"
    />
  );
}
