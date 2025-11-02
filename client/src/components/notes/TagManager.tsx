import { Modal, TextInput, ColorInput, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTag } from '@tabler/icons-react';
import { useEffect } from 'react';
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

  const form = useForm({
    initialValues: {
      name: '',
      color: '#228be6',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? '태그 이름을 입력하세요' : null),
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
      console.error('태그 저장 실패:', error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={tag ? '태그 수정' : '새 태그'} size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="태그 이름"
            placeholder="태그 이름을 입력하세요"
            required
            leftSection={<IconTag size={16} />}
            {...form.getInputProps('name')}
          />

          <ColorInput
            label="색상"
            placeholder="색상 선택"
            {...form.getInputProps('color')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" loading={createTag.isPending || updateTag.isPending}>
              {tag ? '수정' : '생성'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
