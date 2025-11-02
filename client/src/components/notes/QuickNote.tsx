import { useState } from 'react';
import {
  Affix,
  Paper,
  Textarea,
  Button,
  Group,
  ActionIcon,
  Text,
  Stack,
  Transition,
} from '@mantine/core';
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react';
import { useCreateNote } from '@/hooks/useNotes';

export function QuickNote() {
  const [opened, setOpened] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const createNote = useCreateNote();

  const handleSave = () => {
    if (!content.trim()) return;

    createNote.mutate(
      {
        title: title.trim() || '빠른 메모',
        content: content.trim(),
        type: 'TEXT',
      },
      {
        onSuccess: () => {
          setContent('');
          setTitle('');
          setOpened(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setContent('');
    setTitle('');
    setOpened(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Escape to close
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Affix position={{ bottom: 20, right: 20 }} zIndex={100}>
      {!opened ? (
        <Transition mounted={!opened} transition="slide-up" duration={200}>
          {(styles) => (
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="blue"
              onClick={() => setOpened(true)}
              style={styles}
              aria-label="빠른 메모 열기"
            >
              <IconPlus size={24} />
            </ActionIcon>
          )}
        </Transition>
      ) : (
        <Transition mounted={opened} transition="slide-up" duration={300}>
          {(styles) => (
            <Paper
              shadow="lg"
              p="md"
              withBorder
              style={{
                ...styles,
                width: 350,
                maxWidth: 'calc(100vw - 40px)',
              }}
            >
              <Stack gap="md">
                {/* Header */}
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    빠른 메모
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={handleCancel}
                    aria-label="닫기"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>

                {/* Title Input */}
                <Textarea
                  placeholder="제목 (선택사항)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autosize
                  minRows={1}
                  maxRows={2}
                  size="sm"
                />

                {/* Content Input */}
                <Textarea
                  placeholder="메모 내용을 입력하세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autosize
                  minRows={3}
                  maxRows={10}
                  autoFocus
                  size="sm"
                />

                {/* Actions */}
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Ctrl+Enter로 저장
                  </Text>
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      color="gray"
                      size="xs"
                      onClick={handleCancel}
                    >
                      취소
                    </Button>
                    <Button
                      variant="filled"
                      size="xs"
                      onClick={handleSave}
                      disabled={!content.trim() || createNote.isPending}
                      loading={createNote.isPending}
                      leftSection={<IconCheck size={14} />}
                    >
                      저장
                    </Button>
                  </Group>
                </Group>

                {/* Character Count */}
                {content && (
                  <Text size="xs" c="dimmed" ta="right">
                    {content.length} 자
                  </Text>
                )}
              </Stack>
            </Paper>
          )}
        </Transition>
      )}
    </Affix>
  );
}
