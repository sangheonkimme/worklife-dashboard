"use client";

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
import { useTranslation } from 'react-i18next';
import { useCreateNote } from '@/hooks/useNotes';

export function QuickNote() {
  const [opened, setOpened] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const createNote = useCreateNote();
  const { t } = useTranslation('notes');

  const handleSave = () => {
    if (!content.trim()) return;

    createNote.mutate(
      {
        title: title.trim() || t('quickNote.defaultTitle'),
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
              aria-label={t('quickNote.openAria')}
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
                    {t('quickNote.title')}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={handleCancel}
                    aria-label={t('quickNote.closeAria')}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>

                {/* Title Input */}
                <Textarea
                  placeholder={t('quickNote.titlePlaceholder')}
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
                  placeholder={t('quickNote.contentPlaceholder')}
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
                    {t('quickNote.saveHint')}
                  </Text>
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      color="gray"
                      size="xs"
                      onClick={handleCancel}
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      variant="filled"
                      size="xs"
                      onClick={handleSave}
                      disabled={!content.trim() || createNote.isPending}
                      loading={createNote.isPending}
                      leftSection={<IconCheck size={14} />}
                    >
                      {t('actions.save')}
                    </Button>
                  </Group>
                </Group>

                {/* Character Count */}
                {content && (
                  <Text size="xs" c="dimmed" ta="right">
                    {t('quickNote.characterCount', { count: content.length })}
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
