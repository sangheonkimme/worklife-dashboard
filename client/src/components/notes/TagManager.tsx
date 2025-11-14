import { Modal, TextInput, ColorInput, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTag } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tag } from '@/types/tag';
import { useCreateTag, useUpdateTag } from '@/hooks/useTags';

interface TagManagerProps {
  opened: boolean;
  onClose: () => void;
  tag?: Tag | null;
}

export function TagManager({ opened, onClose, tag }: TagManagerProps) {
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const { t } = useTranslation('notes');

  const form = useForm({
    initialValues: {
      name: '',
      color: '#228be6',
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? t('tagManager.validation.nameRequired')
          : null,
    },
  });

  useEffect(() => {
    if (tag) {
      form.setValues({
        name: tag.name,
        color: tag.color || '#228be6',
      });
    } else {
      form.reset();
    }
  }, [tag, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (tag) {
        await updateTag.mutateAsync({
          id: tag.id,
          data: {
            name: values.name,
            color: values.color,
          },
        });
      } else {
        await createTag.mutateAsync({
          name: values.name,
          color: values.color,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t(tag ? 'tagManager.title.edit' : 'tagManager.title.create')}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('tagManager.fields.name.label')}
            placeholder={t('tagManager.fields.name.placeholder')}
            required
            leftSection={<IconTag size={16} />}
            {...form.getInputProps('name')}
          />

          <ColorInput
            label={t('tagManager.fields.color.label')}
            placeholder={t('tagManager.fields.color.placeholder')}
            {...form.getInputProps('color')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" loading={createTag.isPending || updateTag.isPending}>
              {t(tag ? 'actions.update' : 'actions.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
