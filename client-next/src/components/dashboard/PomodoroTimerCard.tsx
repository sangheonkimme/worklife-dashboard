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
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconClock,
} from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePomodoroStore,
  requestNotificationPermission,
} from '@/store/usePomodoroStore';

export function PomodoroTimerCard() {
  const {
    status,
    sessionType,
    remainingTime,
    totalDuration,
    completedSessions,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    restoreSession,
  } = usePomodoroStore();
  const { t } = useTranslation('widgets');

  // 컴포넌트 마운트 시 설정 로드, 세션 복원, 알림 권한 요청
  useEffect(() => {
    restoreSession(); // 새로고침 시 타이머 상태 복원
    requestNotificationPermission();
  }, [restoreSession]);

  // 남은 시간을 MM:SS 형식으로 변환
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 진행률 계산 (0-100)
  const progress = totalDuration > 0
    ? ((totalDuration - remainingTime) / totalDuration) * 100
    : 0;

  // 세션 타입별 색상
  const getColor = () => {
    if (status === 'paused') return 'yellow';
    if (sessionType === 'FOCUS') return 'red';
    return 'green';
  };

  // 세션 타입별 텍스트
  const getSessionLabel = () => {
    switch (sessionType) {
      case 'FOCUS':
        return t('pomodoro.sessionLabels.focus');
      case 'SHORT_BREAK':
        return t('pomodoro.sessionLabels.shortBreak');
      case 'LONG_BREAK':
        return t('pomodoro.sessionLabels.longBreak');
    }
  };

  const color = getColor();

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
        {/* 제목 */}
        <Group gap="xs">
          <ThemeIcon size="lg" variant="light" color="red">
            <IconClock size={20} />
          </ThemeIcon>
          <Text fw={600} size="lg">
            {t('pomodoro.title')}
          </Text>
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
                  {formatTime(remainingTime)}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {getSessionLabel()}
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
              {t('pomodoro.actions.start')}
            </Button>
          )}

          {status === 'running' && (
            <>
              <ActionIcon
                variant="filled"
                color="yellow"
                size="lg"
                onClick={pauseTimer}
                aria-label={t('pomodoro.actions.pause')}
              >
                <IconPlayerPause size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="gray"
                size="lg"
                onClick={stopTimer}
                aria-label={t('pomodoro.actions.stop')}
              >
                <IconPlayerStop size={18} />
              </ActionIcon>
            </>
          )}

          {status === 'paused' && (
            <>
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                color={color}
                onClick={resumeTimer}
                size="sm"
              >
                {t('pomodoro.actions.resume')}
              </Button>
              <ActionIcon
                variant="filled"
                color="gray"
                size="lg"
                onClick={stopTimer}
                aria-label={t('pomodoro.actions.stop')}
              >
                <IconPlayerStop size={18} />
              </ActionIcon>
            </>
          )}
        </Group>

        {/* 오늘 완료 개수 */}
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {t('pomodoro.badges.today')}
          </Text>
          <Badge color="red" variant="light">
            {t('pomodoro.badges.completed', { count: completedSessions })}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}
