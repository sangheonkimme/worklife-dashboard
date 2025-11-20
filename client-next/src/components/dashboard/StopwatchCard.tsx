"use client";

import {
  Card,
  Text,
  RingProgress,
  Stack,
  Group,
  Button,
  Badge,
  ActionIcon,
  ThemeIcon,
  ScrollArea,
  Table,
  Menu,
  NumberInput,
  Switch,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconFlag,
  IconStopwatch,
  IconHistory,
  IconDeviceFloppy,
  IconSettings,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStopwatchStore } from '@/store/useStopwatchStore';
import { formatTime } from '@/utils/timeFormat';
import { SaveSessionModal } from '@/components/stopwatch/SaveSessionModal';
import { HistoryPanel } from '@/components/stopwatch/HistoryPanel';

export function StopwatchCard() {
  const {
    status,
    elapsedTime,
    laps,
    savedSessions,
    goalTime,
    notificationsEnabled,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    recordLap,
    restoreSession,
    getFastestLap,
    getSlowestLap,
    getAverageLapTime,
    setGoalTime,
    setNotificationsEnabled,
  } = useStopwatchStore();

  const [saveModalOpened, setSaveModalOpened] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);
  const [goalTimeMinutes, setGoalTimeMinutes] = useState<number>(
    goalTime ? Math.floor(goalTime / 60000) : 60
  );
  const { t } = useTranslation('widgets');

  // 컴포넌트 마운트 시 세션 복원 및 알림 권한 요청
  useEffect(() => {
    restoreSession();

    // 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [restoreSession]);

  // 상태별 색상
  const getColor = () => {
    if (status === 'paused') return 'yellow';
    if (status === 'running') return 'blue';
    return 'gray';
  };

  const color = getColor();

  // 진행률 계산 (애니메이션용 - 1시간을 100%로 가정)
  const maxTime = 3600000; // 1시간 (밀리초)
  const progress = Math.min((elapsedTime / maxTime) * 100, 100);

  // 가장 빠른/느린 랩
  const fastestLap = getFastestLap();
  const slowestLap = getSlowestLap();
  const avgLapTime = getAverageLapTime();

  // 최근 3개 랩만 표시
  const recentLaps = laps.slice(-3).reverse();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      styles={{
        root: {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    >
      <Stack gap="md" align="center" justify="space-between" style={{ height: '100%' }}>
        {/* 제목 & 액션 버튼 */}
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group gap="xs">
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconStopwatch size={20} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              {t('stopwatch.title')}
            </Text>
          </Group>
          <Group gap="xs">
            {/* 히스토리 버튼 */}
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => setHistoryOpened(true)}
              aria-label={t('stopwatch.actions.openHistory')}
            >
              <IconHistory size={18} />
              {savedSessions.length > 0 && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="blue"
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    padding: 0,
                  }}
                >
                  {savedSessions.length}
                </Badge>
              )}
            </ActionIcon>

            {/* 설정 메뉴 */}
            <Menu shadow="md" width={250}>
              <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="blue"
                aria-label={t('stopwatch.actions.openSettings')}
              >
                  <IconSettings size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{t('stopwatch.menu.notifications')}</Menu.Label>
                <Menu.Item closeMenuOnClick={false}>
                  <Switch
                    label={t('stopwatch.menu.enableNotifications')}
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.currentTarget.checked)}
                    size="sm"
                  />
                </Menu.Item>

                <Menu.Item closeMenuOnClick={false}>
                  <Stack gap="xs">
                    <Text size="xs" fw={500}>
                      {t('stopwatch.menu.goalLabel')}
                    </Text>
                    <NumberInput
                      value={goalTimeMinutes}
                      onChange={(value) => {
                        const minutes = typeof value === 'number' ? value : 0;
                        setGoalTimeMinutes(minutes);
                        setGoalTime(minutes > 0 ? minutes * 60000 : null);
                      }}
                      min={0}
                      max={999}
                      size="xs"
                      placeholder={t('stopwatch.menu.goalPlaceholder')}
                    />
                  </Stack>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* 타이머 디스플레이 */}
        <Stack gap="xs" align="center">
          <RingProgress
            size={180}
            thickness={12}
            sections={[{ value: progress, color }]}
            label={
              <Stack gap={0} align="center">
                <Text size="xl" fw={700} c={color}>
                  {formatTime(elapsedTime)}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {status === 'running'
                    ? t('stopwatch.status.running')
                    : status === 'paused'
                    ? t('stopwatch.status.paused')
                    : t('stopwatch.status.idle')}
                </Text>
              </Stack>
            }
          />
        </Stack>

        {/* 컨트롤 버튼 */}
        <Group gap="xs" justify="center">
          {status === 'idle' && (
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              color={color}
              onClick={startTimer}
              size="sm"
            >
              {t('stopwatch.actions.start')}
            </Button>
          )}

          {status === 'running' && (
            <>
              <ActionIcon
                variant="filled"
                color="yellow"
                size="lg"
                onClick={pauseTimer}
                aria-label={t('stopwatch.actions.pause')}
              >
                <IconPlayerPause size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
                onClick={recordLap}
                aria-label={t('stopwatch.actions.recordLap')}
              >
                <IconFlag size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="gray"
                size="lg"
                onClick={resetTimer}
                aria-label={t('stopwatch.actions.reset')}
              >
                <IconPlayerStop size={18} />
              </ActionIcon>
            </>
          )}

          {status === 'paused' && (
            <>
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                color="blue"
                onClick={resumeTimer}
                size="sm"
              >
                {t('stopwatch.actions.resume')}
              </Button>
              <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
                onClick={recordLap}
                aria-label={t('stopwatch.actions.recordLap')}
              >
                <IconFlag size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="gray"
                size="lg"
                onClick={resetTimer}
                aria-label={t('stopwatch.actions.reset')}
              >
                <IconPlayerStop size={18} />
              </ActionIcon>
            </>
          )}
        </Group>

        {/* 랩 타임 리스트 */}
        {laps.length > 0 && (
          <Stack gap="xs" style={{ width: '100%' }}>
            <Text size="sm" fw={600} c="dimmed">
              {t('stopwatch.labels.lapTimesRecent')}
            </Text>
            <ScrollArea h={100} type="auto">
              <Table>
                <Table.Tbody>
                  {recentLaps.map((lap) => {
                    const isFastest = fastestLap?.id === lap.id && laps.length > 1;
                    const isSlowest = slowestLap?.id === lap.id && laps.length > 1;

                    return (
                      <Table.Tr key={lap.id}>
                        <Table.Td>
                          <Group gap="xs">
                            <Text size="xs" fw={500}>
                              #{lap.lapNumber}
                            </Text>
                            {isFastest && <Text size="xs">⚡</Text>}
                            {isSlowest && <Text size="xs">🐌</Text>}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs">{formatTime(lap.lapTime)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {formatTime(lap.totalTime)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        )}

        {/* 통계 & 세션 저장 */}
        <Stack gap="xs" style={{ width: '100%' }}>
          <Group gap="xs" justify="center">
            <Text size="sm" c="dimmed">
              {t('stopwatch.labels.lapCount')}
            </Text>
            <Badge color="blue" variant="light">
              {t('stopwatch.labels.lapsValue', { count: laps.length })}
            </Badge>
            {laps.length > 0 && (
              <>
                <Text size="sm" c="dimmed">
                  {t('stopwatch.labels.average')}
                </Text>
                <Badge color="cyan" variant="light">
                  {formatTime(avgLapTime)}
                </Badge>
              </>
            )}
          </Group>

          {/* 세션 저장 버튼 (타이머가 시작되었을 때만 표시) */}
          {(status !== 'idle' || elapsedTime > 0 || laps.length > 0) && (
            <Button
              variant="light"
              color="blue"
              size="xs"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={() => setSaveModalOpened(true)}
              fullWidth
            >
              {t('stopwatch.buttons.saveSession')}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* 세션 저장 모달 */}
      <SaveSessionModal
        opened={saveModalOpened}
        onClose={() => setSaveModalOpened(false)}
      />

      {/* 히스토리 패널 */}
      <HistoryPanel opened={historyOpened} onClose={() => setHistoryOpened(false)} />
    </Card>
  );
}
