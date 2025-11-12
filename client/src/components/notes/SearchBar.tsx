import { useState, useEffect } from 'react';
import { TextInput, ActionIcon, Kbd, Group } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(value);
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const { t } = useTranslation('notes');

  useEffect(() => {
    onChange(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleClear = () => {
    setSearchValue('');
    onChange('');
  };

  return (
    <TextInput
      placeholder={placeholder || t('searchBar.placeholder')}
      leftSection={<IconSearch size={16} />}
      rightSection={
        searchValue ? (
          <ActionIcon size="sm" variant="subtle" onClick={handleClear}>
            <IconX size={16} />
          </ActionIcon>
        ) : (
          <Group gap={4}>
            <Kbd size="xs">Ctrl</Kbd>
            <Kbd size="xs">K</Kbd>
          </Group>
        )
      }
      value={searchValue}
      onChange={(e) => setSearchValue(e.currentTarget.value)}
      size="sm"
    />
  );
}
