import {
  Modal,
  Text,
  Stack,
  Group,
  Button,
  Badge,
  ActionIcon,
  Table,
  ScrollArea,
  Card,
  Collapse,
  Divider,
} from '@mantine/core';
import { IconTrash, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useStopwatchStore } from '@/store/useStopwatchStore';
import { formatTime, formatTimeNoMs } from '@/utils/timeFormat';
import type { SavedSession } from '@/types/stopwatch';

interface HistoryPanelProps {
  opened: boolean;
  onClose: () => void;
}

export function HistoryPanel({ opened, onClose }: HistoryPanelProps) {
  const { savedSessions, deleteSavedSession, clearHistory } = useStopwatchStore();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const { t } = useTranslation('widgets');

  const handleDeleteSession = (id: string, name?: string) => {
    deleteSavedSession(id);
    notifications.show({
      title: t('stopwatch.history.deleteTitle'),
      message: t('stopwatch.history.deleteMessage', {
        name: name || t('stopwatch.history.untitled'),
      }),
      color: 'yellow',
    });
  };

  const handleClearAll = () => {
    if (window.confirm(t('stopwatch.history.confirmClear'))) {
      clearHistory();
      notifications.show({
        title: t('stopwatch.history.clearTitle'),
        message: t('stopwatch.history.clearMessage'),
        color: 'red',
      });
    }
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('stopwatch.history.title')}
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* 헤더 */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('stopwatch.history.total', { count: savedSessions.length })}
          </Text>
          {savedSessions.length > 0 && (
            <Button
              variant="subtle"
              color="red"
              size="xs"
              onClick={handleClearAll}
            >
              {t('stopwatch.history.deleteAll')}
            </Button>
          )}
        </Group>

        {/* 세션 리스트 */}
        <ScrollArea h={400} type="auto">
          {savedSessions.length === 0 ? (
            <Card withBorder p="xl">
              <Text size="sm" c="dimmed" ta="center">
                {t('stopwatch.history.empty')}
              </Text>
            </Card>
          ) : (
            <Stack gap="xs">
              {savedSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  expanded={expandedSessionId === session.id}
                  onToggleExpand={() => toggleExpand(session.id)}
                  onDelete={() => handleDeleteSession(session.id, session.name)}
                />
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
}

interface SessionItemProps {
  session: SavedSession;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}

function SessionItem({ session, expanded, onToggleExpand, onDelete }: SessionItemProps) {
  const { t, i18n } = useTranslation('widgets');
  const createdDate = new Date(session.createdAt).toLocaleString(i18n.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card withBorder p="sm">
      <Stack gap="xs">
        {/* 헤더 */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={onToggleExpand}
              aria-label={
                expanded
                  ? t('stopwatch.history.aria.collapse')
                  : t('stopwatch.history.aria.expand')
              }
            >
              {expanded ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </ActionIcon>
            <Text size="sm" fw={600} lineClamp={1}>
              {session.name || t('stopwatch.history.untitled')}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Badge color="blue" variant="light" size="sm">
              {formatTimeNoMs(session.duration)}
            </Badge>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={onDelete}
              aria-label={t('stopwatch.history.aria.delete')}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* 기본 정보 */}
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {createdDate}
          </Text>
          {session.laps.length > 0 && (
            <>
              <Text size="xs" c="dimmed">
                •
              </Text>
              <Text size="xs" c="dimmed">
                {t('stopwatch.labels.lapSummary', { count: session.laps.length })}
              </Text>
            </>
          )}
        </Group>

        {/* 메모 */}
        {session.notes && (
          <Text size="xs" c="dimmed" lineClamp={expanded ? undefined : 1}>
            {session.notes}
          </Text>
        )}

        {/* 랩 타임 상세 (펼쳤을 때만) */}
        <Collapse in={expanded}>
          <Divider my="xs" />
          {session.laps.length > 0 ? (
            <ScrollArea h={200} type="auto">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('stopwatch.history.lapHeader')}</Table.Th>
                    <Table.Th>{t('stopwatch.history.lapTimeHeader')}</Table.Th>
                    <Table.Th>{t('stopwatch.history.totalTimeHeader')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {session.laps.map((lap) => (
                    <Table.Tr key={lap.id}>
                      <Table.Td>#{lap.lapNumber}</Table.Td>
                      <Table.Td>{formatTime(lap.lapTime)}</Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {formatTime(lap.totalTime)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Text size="xs" c="dimmed" ta="center">
              {t('stopwatch.history.noLapData')}
            </Text>
          )}
        </Collapse>
      </Stack>
    </Card>
  );
}
