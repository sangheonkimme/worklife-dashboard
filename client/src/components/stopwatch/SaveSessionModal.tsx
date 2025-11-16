import { Modal, TextInput, Textarea, Button, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('widgets');

  const form = useForm<SaveSessionFormValues>({
    initialValues: {
      name: '',
      notes: '',
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? t('stopwatch.saveModal.validation') : null,
    },
  });

  const handleSubmit = (values: SaveSessionFormValues) => {
    try {
      saveCurrentSession(values.name, values.notes);

      notifications.show({
        title: t('stopwatch.saveModal.successTitle'),
        message: t('stopwatch.saveModal.successMessage', { name: values.name }),
        color: 'green',
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to save stopwatch session', error);
      notifications.show({
        title: t('stopwatch.saveModal.errorTitle'),
        message: t('stopwatch.saveModal.errorMessage'),
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
      title={t('stopwatch.saveModal.title')}
      centered
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('stopwatch.saveModal.nameLabel')}
            placeholder={t('stopwatch.saveModal.namePlaceholder')}
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label={t('stopwatch.saveModal.notesLabel')}
            placeholder={t('stopwatch.saveModal.notesPlaceholder')}
            minRows={3}
            maxRows={6}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={handleClose}>
              {t('stopwatch.saveModal.cancel')}
            </Button>
            <Button type="submit" color="blue">
              {t('stopwatch.saveModal.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
