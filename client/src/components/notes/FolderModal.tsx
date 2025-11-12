import { Modal, TextInput, ColorInput, Select, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconFolder } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Folder } from '@/types/folder';
import { useCreateFolder, useUpdateFolder, useFolders } from '@/hooks/useFolders';

interface FolderModalProps {
  opened: boolean;
  onClose: () => void;
  folder?: Folder | null;
  parentId?: string;
}

const FOLDER_ICON_VALUES = [
  { value: 'IconFolder', key: 'folderModal.iconOptions.default' },
  { value: 'IconFolderOpen', key: 'folderModal.iconOptions.open' },
  { value: 'IconBriefcase', key: 'folderModal.iconOptions.work' },
  { value: 'IconBook', key: 'folderModal.iconOptions.study' },
  { value: 'IconHeart', key: 'folderModal.iconOptions.personal' },
  { value: 'IconStar', key: 'folderModal.iconOptions.important' },
  { value: 'IconHome', key: 'folderModal.iconOptions.home' },
  { value: 'IconCode', key: 'folderModal.iconOptions.code' },
];

export function FolderModal({ opened, onClose, folder, parentId }: FolderModalProps) {
  const { data: folders } = useFolders();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const { t } = useTranslation('notes');
  const iconOptions = useMemo(
    () =>
      FOLDER_ICON_VALUES.map((option) => ({
        value: option.value,
        label: t(option.key),
      })),
    [t]
  );

  const form = useForm({
    initialValues: {
      name: '',
      color: '#228be6',
      icon: 'IconFolder',
      parentId: parentId || '',
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? t('folderModal.validation.nameRequired')
          : null,
    },
  });

  useEffect(() => {
    if (folder) {
      form.setValues({
        name: folder.name,
        color: folder.color || '#228be6',
        icon: folder.icon || 'IconFolder',
        parentId: folder.parentId || '',
      });
    } else if (parentId) {
      form.setFieldValue('parentId', parentId);
    } else {
      form.reset();
    }
  }, [folder, parentId, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (folder) {
        await updateFolder.mutateAsync({
          id: folder.id,
          data: {
            name: values.name,
            color: values.color,
            icon: values.icon,
            parentId: values.parentId || null,
          },
        });
      } else {
        await createFolder.mutateAsync({
          name: values.name,
          color: values.color,
          icon: values.icon,
          parentId: values.parentId || undefined,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to save folder:', error);
    }
  };

  // Allow selecting only valid parent folders (max depth enforced)
  const availableFolders = folders?.filter((f) => {
    // Exclude the current folder
    if (folder && f.id === folder.id) return false;
    // Exclude immediate children to prevent cycles
    if (folder && f.parentId === folder.id) return false;
    // Only allow root folders or first-level folders as parents
    return !f.parentId || (f.parent && 'parentId' in f.parent && !f.parent.parentId);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t(folder ? 'folderModal.title.edit' : 'folderModal.title.create')}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('folderModal.fields.name.label')}
            placeholder={t('folderModal.fields.name.placeholder')}
            required
            leftSection={<IconFolder size={16} />}
            {...form.getInputProps('name')}
          />

          <Select
            label={t('folderModal.fields.icon.label')}
            placeholder={t('folderModal.fields.icon.placeholder')}
            data={iconOptions}
            {...form.getInputProps('icon')}
          />

          <ColorInput
            label={t('folderModal.fields.color.label')}
            placeholder={t('folderModal.fields.color.placeholder')}
            {...form.getInputProps('color')}
          />

          <Select
            label={t('folderModal.fields.parent.label')}
            placeholder={t('folderModal.fields.parent.placeholder')}
            clearable
            data={
              availableFolders?.map((f) => ({
                value: f.id,
                label: f.name,
              })) || []
            }
            {...form.getInputProps('parentId')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              loading={createFolder.isPending || updateFolder.isPending}
            >
              {t(folder ? 'actions.update' : 'actions.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
