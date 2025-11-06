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

  const handleDeleteSession = (id: string, name?: string) => {
    deleteSavedSession(id);
    notifications.show({
      title: '세션 삭제',
      message: `"${name || '세션'}"이 삭제되었습니다.`,
      color: 'yellow',
    });
  };

  const handleClearAll = () => {
    if (window.confirm('모든 히스토리를 삭제하시겠습니까?')) {
      clearHistory();
      notifications.show({
        title: '히스토리 삭제',
        message: '모든 세션이 삭제되었습니다.',
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
      title="저장된 세션"
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* 헤더 */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            총 {savedSessions.length}개의 세션
          </Text>
          {savedSessions.length > 0 && (
            <Button
              variant="subtle"
              color="red"
              size="xs"
              onClick={handleClearAll}
            >
              전체 삭제
            </Button>
          )}
        </Group>

        {/* 세션 리스트 */}
        <ScrollArea h={400} type="auto">
          {savedSessions.length === 0 ? (
            <Card withBorder p="xl">
              <Text size="sm" c="dimmed" ta="center">
                저장된 세션이 없습니다.
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
  const createdDate = new Date(session.createdAt).toLocaleString('ko-KR', {
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
              aria-label={expanded ? '접기' : '펼치기'}
            >
              {expanded ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </ActionIcon>
            <Text size="sm" fw={600} lineClamp={1}>
              {session.name || '무제'}
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
              aria-label="삭제"
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
                랩: {session.laps.length}개
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
              <Table fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>랩</Table.Th>
                    <Table.Th>랩 시간</Table.Th>
                    <Table.Th>총 시간</Table.Th>
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
              랩 타임이 없습니다.
            </Text>
          )}
        </Collapse>
      </Stack>
    </Card>
  );
}
