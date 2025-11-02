import { Modal, TextInput, ColorInput, Select, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconFolder } from '@tabler/icons-react';
import { useEffect } from 'react';
import type { Folder } from '@/types/folder';
import { useCreateFolder, useUpdateFolder, useFolders } from '@/hooks/useFolders';

interface FolderModalProps {
  opened: boolean;
  onClose: () => void;
  folder?: Folder | null;
  parentId?: string;
}

const FOLDER_ICONS = [
  { value: 'IconFolder', label: '📁 기본 폴더' },
  { value: 'IconFolderOpen', label: '📂 열린 폴더' },
  { value: 'IconBriefcase', label: '💼 업무' },
  { value: 'IconBook', label: '📚 학습' },
  { value: 'IconHeart', label: '❤️ 개인' },
  { value: 'IconStar', label: '⭐ 중요' },
  { value: 'IconHome', label: '🏠 집' },
  { value: 'IconCode', label: '💻 코드' },
];

export function FolderModal({ opened, onClose, folder, parentId }: FolderModalProps) {
  const { data: folders } = useFolders();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();

  const form = useForm({
    initialValues: {
      name: '',
      color: '#228be6',
      icon: 'IconFolder',
      parentId: parentId || '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? '폴더 이름을 입력하세요' : null),
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
      console.error('폴더 저장 실패:', error);
    }
  };

  // 루트 폴더만 선택 가능 (최대 3단계 제한)
  const availableFolders = folders?.filter((f) => {
    // 현재 폴더 자신은 제외
    if (folder && f.id === folder.id) return false;
    // 현재 폴더의 자식들도 제외 (순환 참조 방지)
    if (folder && f.parentId === folder.id) return false;
    // 부모가 없거나 1단계 폴더만 선택 가능 (2단계까지 허용)
    return !f.parentId || (f.parent && 'parentId' in f.parent && !f.parent.parentId);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={folder ? '폴더 수정' : '새 폴더'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="폴더 이름"
            placeholder="폴더 이름을 입력하세요"
            required
            leftSection={<IconFolder size={16} />}
            {...form.getInputProps('name')}
          />

          <Select
            label="아이콘"
            placeholder="아이콘 선택"
            data={FOLDER_ICONS}
            {...form.getInputProps('icon')}
          />

          <ColorInput
            label="색상"
            placeholder="색상 선택"
            {...form.getInputProps('color')}
          />

          <Select
            label="상위 폴더"
            placeholder="상위 폴더 선택 (선택사항)"
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
              취소
            </Button>
            <Button
              type="submit"
              loading={createFolder.isPending || updateFolder.isPending}
            >
              {folder ? '수정' : '생성'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
