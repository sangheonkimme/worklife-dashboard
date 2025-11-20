"use client";

import { useState } from 'react';
import {
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Menu,
  UnstyledButton,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconDots, IconTag } from '@tabler/icons-react';
import { useTags, useDeleteTag } from '@/hooks/useTags';
import type { Tag } from '@/types/tag';
import { TagManager } from './TagManager';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

interface TagListProps {
  selectedTagId?: string;
  onSelectTag: (tagId: string | undefined) => void;
}

export function TagList({ selectedTagId, onSelectTag }: TagListProps) {
  const { data: tags, isLoading } = useTags(true);
  const deleteTag = useDeleteTag();
  const [managerOpened, setManagerOpened] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const { t } = useTranslation('notes');

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setManagerOpened(true);
  };

  const handleDelete = (tag: Tag) => {
    modals.openConfirmModal({
      title: t('tagList.deleteConfirm.title'),
      children: (
        <Text size="sm">
          {t('tagList.deleteConfirm.message', { name: tag.name })}
          {tag._count && tag._count.noteTags > 0 && (
            <Text c="orange" mt="xs">
              {t('tagList.deleteConfirm.usageWarning', {
                count: tag._count.noteTags,
              })}
            </Text>
          )}
        </Text>
      ),
      labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteTag.mutate(tag.id),
    });
  };

  const handleCloseManager = () => {
    setManagerOpened(false);
    setEditingTag(null);
  };

  if (isLoading) {
    return <Text size="sm">{t('tagList.loading')}</Text>;
  }

  return (
    <>
      <Stack gap="xs">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={600} c="dimmed">
            {t('tagList.title')}
          </Text>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => {
              setEditingTag(null);
              setManagerOpened(true);
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        <UnstyledButton
          onClick={() => onSelectTag(undefined)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 4,
            backgroundColor:
              selectedTagId === undefined ? 'var(--mantine-color-blue-light)' : 'transparent',
          }}
        >
          <Group gap="xs">
            <IconTag size={16} />
            <Text size="sm">{t('tagList.all')}</Text>
          </Group>
        </UnstyledButton>

        {tags?.map((tag) => (
          <UnstyledButton
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 4,
              backgroundColor:
                selectedTagId === tag.id ? 'var(--mantine-color-blue-light)' : 'transparent',
            }}
          >
            <Group gap="xs" wrap="nowrap" justify="space-between">
              <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                <Badge
                  color={tag.color || 'gray'}
                  variant="light"
                  size="sm"
                  style={{ cursor: 'pointer' }}
                >
                  {tag.name}
                </Badge>
              </Group>

              <Group gap="xs">
                {tag._count && tag._count.noteTags > 0 && (
                  <Badge size="sm" variant="light" color="gray">
                    {tag._count.noteTags}
                  </Badge>
                )}

                <Menu position="right-start" withinPortal>
                  <Menu.Target>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDots size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(tag);
                      }}
                    >
                      {t('tagList.menu.edit')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tag);
                      }}
                    >
                      {t('tagList.menu.delete')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </UnstyledButton>
        ))}

        {tags && tags.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t('tagList.empty')}
          </Text>
        )}
      </Stack>

      <TagManager opened={managerOpened} onClose={handleCloseManager} tag={editingTag} />
    </>
  );
}
