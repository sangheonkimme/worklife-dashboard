"use client";

import { Card, ActionIcon, Text, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CreateStickyNoteButtonProps {
  onCreate: (color: string, position: number) => void;
  nextPosition: number;
  availableColor: string;
}

export function CreateStickyNoteButton({
  onCreate,
  nextPosition,
  availableColor,
}: CreateStickyNoteButtonProps) {
  const { t } = useTranslation('dashboard');

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        backgroundColor: '#f5f5f5',
        height: '230px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '2px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      styles={{
        root: {
          '&:hover': {
            backgroundColor: '#ebebeb',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
      onClick={() => onCreate(availableColor, nextPosition)}
    >
      <Stack align="center" gap="xs">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="light"
          color="gray"
          style={{ pointerEvents: 'none' }}
        >
          <IconPlus size={28} />
        </ActionIcon>
        <Text size="sm" c="dimmed">
          {t('stickyNotes.createButton')}
        </Text>
      </Stack>
    </Card>
  );
}
