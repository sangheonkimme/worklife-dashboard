"use client";

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

  // 새 태그 생성 시에만 초기화; 이미 초기값이면 reset을 반복 호출하지 않는다.
  useEffect(() => {
    if (!opened || tag) return;
    const { name, color } = form.values;
    if (name !== '' || color !== '#228be6') {
      form.reset();
    }
  }, [opened, tag]); // form 인스턴스는 제외해 불필요한 재호출을 방지

  // 수정 모드일 때만 값 동기화; 변경 시에만 setValues 호출
  useEffect(() => {
    if (!opened || !tag) return;

    const current = form.values;
    const nextColor = tag.color || '#228be6';
    if (current.name !== tag.name || current.color !== nextColor) {
      form.setValues({
        name: tag.name,
        color: nextColor,
      });
    }
  }, [opened, tag?.id, tag?.name, tag?.color]); // form 인스턴스 제외

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
