import { MultiSelect } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useTags } from '@/hooks/useTags';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const { data: tags } = useTags();
  const { t } = useTranslation('notes');

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
      placeholder={placeholder || t('tagInput.placeholder')}
      searchable
      maxDropdownHeight={200}
      label={t('tagInput.label')}
    />
  );
}
