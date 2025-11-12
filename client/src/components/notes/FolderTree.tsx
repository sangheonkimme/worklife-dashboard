import { useState } from 'react';
import {
  Box,
  Text,
  ActionIcon,
  Group,
  Menu,
  Stack,
  Badge,
  Collapse,
  UnstyledButton,
} from '@mantine/core';
import {
  IconFolder,
  IconFolderOpen,
  IconChevronRight,
  IconChevronDown,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
} from '@tabler/icons-react';
import { useFolders, useDeleteFolder } from '@/hooks/useFolders';
import type { Folder } from '@/types/folder';
import { FolderModal } from './FolderModal';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

interface FolderTreeProps {
  selectedFolderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
}

interface FolderItemProps {
  folder: Folder;
  level: number;
  selectedFolderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onAddChild: (parentId: string) => void;
}

function FolderItem({
  folder,
  level,
  selectedFolderId,
  onSelectFolder,
  onEdit,
  onDelete,
  onAddChild,
}: FolderItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;
  const { t } = useTranslation('notes');

  return (
    <Box>
      <UnstyledButton
        onClick={() => onSelectFolder(folder.id)}
        style={{
          width: '100%',
          padding: '8px 12px',
          paddingLeft: `${12 + level * 20}px`,
          borderRadius: 4,
          backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : 'transparent',
          '&:hover': {
            backgroundColor: isSelected
              ? 'var(--mantine-color-blue-light)'
              : 'var(--mantine-color-gray-1)',
          },
        }}
      >
        <Group gap="xs" wrap="nowrap">
          {hasChildren ? (
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </ActionIcon>
          ) : (
            <Box style={{ width: 20 }} />
          )}

          {isOpen || !hasChildren ? (
            <IconFolderOpen size={16} color={folder.color} />
          ) : (
            <IconFolder size={16} color={folder.color} />
          )}

          <Text size="sm" style={{ flex: 1 }}>
            {folder.name}
          </Text>

          {folder._count && folder._count.notes > 0 && (
            <Badge size="sm" variant="light" color="gray">
              {folder._count.notes}
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
              {level < 2 && (
                <Menu.Item
                  leftSection={<IconPlus size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(folder.id);
                  }}
                >
                  {t('folderTree.addChild')}
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(folder);
                }}
              >
                {t('folderTree.menu.edit')}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder);
                }}
              >
                {t('folderTree.menu.delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </UnstyledButton>

      {hasChildren && (
        <Collapse in={isOpen}>
          {folder.children?.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export function FolderTree({ selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const { data: folders, isLoading } = useFolders();
  const deleteFolder = useDeleteFolder();
  const [modalOpened, setModalOpened] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [parentId, setParentId] = useState<string | undefined>();
  const { t } = useTranslation('notes');

  const handleEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setParentId(undefined);
    setModalOpened(true);
  };

  const handleDelete = (folder: Folder) => {
    modals.openConfirmModal({
      title: t('folderTree.deleteConfirm.title'),
      children: (
        <Text size="sm">
          {t('folderTree.deleteConfirm.message', { name: folder.name })}
          {folder._count && folder._count.notes > 0 && (
            <Text c="red" mt="xs">
              {t('folderTree.deleteConfirm.noteWarning', {
                count: folder._count.notes,
              })}
            </Text>
          )}
          {folder._count && folder._count.children && folder._count.children > 0 && (
            <Text c="orange" mt="xs">
              {t('folderTree.deleteConfirm.childWarning')}
            </Text>
          )}
        </Text>
      ),
      labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteFolder.mutate(folder.id),
    });
  };

  const handleAddChild = (parentFolderId: string) => {
    setEditingFolder(null);
    setParentId(parentFolderId);
    setModalOpened(true);
  };

  const handleAddRoot = () => {
    setEditingFolder(null);
    setParentId(undefined);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingFolder(null);
    setParentId(undefined);
  };

  // Only show root-level folders (no parentId)
  const rootFolders = folders?.filter((f) => !f.parentId) || [];

  if (isLoading) {
    return <Text size="sm">{t('folderTree.loading')}</Text>;
  }

  return (
    <>
      <Stack gap="xs">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={600} c="dimmed">
            {t('folderTree.title')}
          </Text>
          <ActionIcon size="sm" variant="subtle" onClick={handleAddRoot}>
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        <UnstyledButton
          onClick={() => onSelectFolder(undefined)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 4,
            backgroundColor:
              selectedFolderId === undefined ? 'var(--mantine-color-blue-light)' : 'transparent',
          }}
        >
          <Group gap="xs">
            <IconFolder size={16} />
            <Text size="sm">{t('folderTree.all')}</Text>
          </Group>
        </UnstyledButton>

        {rootFolders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            level={0}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
          />
        ))}

        {rootFolders.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t('folderTree.empty')}
          </Text>
        )}
      </Stack>

      <FolderModal
        opened={modalOpened}
        onClose={handleCloseModal}
        folder={editingFolder}
        parentId={parentId}
      />
    </>
  );
}
