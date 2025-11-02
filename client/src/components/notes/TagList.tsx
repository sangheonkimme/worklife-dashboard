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

interface TagListProps {
  selectedTagId?: string;
  onSelectTag: (tagId: string | undefined) => void;
}

export function TagList({ selectedTagId, onSelectTag }: TagListProps) {
  const { data: tags, isLoading } = useTags(true);
  const deleteTag = useDeleteTag();
  const [managerOpened, setManagerOpened] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setManagerOpened(true);
  };

  const handleDelete = (tag: Tag) => {
    modals.openConfirmModal({
      title: '태그 삭제',
      children: (
        <Text size="sm">
          {tag.name} 태그를 삭제하시겠습니까?
          {tag._count && tag._count.noteTags > 0 && (
            <Text c="orange" mt="xs">
              {tag._count.noteTags}개의 메모에서 이 태그가 제거됩니다.
            </Text>
          )}
        </Text>
      ),
      labels: { confirm: '삭제', cancel: '취소' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteTag.mutate(tag.id),
    });
  };

  const handleCloseManager = () => {
    setManagerOpened(false);
    setEditingTag(null);
  };

  if (isLoading) {
    return <Text size="sm">로딩 중...</Text>;
  }

  return (
    <>
      <Stack gap="xs">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={600} c="dimmed">
            태그
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
            <Text size="sm">모든 태그</Text>
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
                      수정
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tag);
                      }}
                    >
                      삭제
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </UnstyledButton>
        ))}

        {tags && tags.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            태그가 없습니다
          </Text>
        )}
      </Stack>

      <TagManager opened={managerOpened} onClose={handleCloseManager} tag={editingTag} />
    </>
  );
}
