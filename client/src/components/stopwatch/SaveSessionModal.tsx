import { Modal, TextInput, Textarea, Button, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useStopwatchStore } from '@/store/useStopwatchStore';

interface SaveSessionModalProps {
  opened: boolean;
  onClose: () => void;
}

interface SaveSessionFormValues {
  name: string;
  notes: string;
}

export function SaveSessionModal({ opened, onClose }: SaveSessionModalProps) {
  const { saveCurrentSession, elapsedTime, laps } = useStopwatchStore();

  const form = useForm<SaveSessionFormValues>({
    initialValues: {
      name: '',
      notes: '',
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? '세션 이름을 입력해주세요' : null,
    },
  });

  const handleSubmit = (values: SaveSessionFormValues) => {
    try {
      saveCurrentSession(values.name, values.notes);

      notifications.show({
        title: '세션 저장 완료',
        message: `"${values.name}" 세션이 저장되었습니다.`,
        color: 'green',
      });

      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: '세션 저장 실패',
        message: '세션을 저장하는 중 오류가 발생했습니다.',
        color: 'red',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // 세션이 없으면 모달 표시 안 함
  if (elapsedTime === 0 && laps.length === 0) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="세션 저장"
      centered
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="세션 이름"
            placeholder="예: 프로젝트 개발, 운동, 요리 등"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="메모 (선택)"
            placeholder="세션에 대한 메모를 남겨주세요"
            minRows={3}
            maxRows={6}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" color="blue">
              저장
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
