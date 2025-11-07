import { Box, Paper, Text, Group, ActionIcon, Progress, Stack } from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconFlag,
  IconX,
  IconMaximize,
} from '@tabler/icons-react';
import { useStopwatchStore } from '@/store/useStopwatchStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime } from '@/utils/timeFormat';

export function StopwatchWidget() {
  const {
    status,
    elapsedTime,
    laps,
    isWidgetVisible,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    recordLap,
    setWidgetVisible,
  } = useStopwatchStore();

  const navigate = useNavigate();
  const location = useLocation();

  // 타이머가 idle이고 시작하지 않았으면 위젯 숨김
  if (status === 'idle' && elapsedTime === 0 && laps.length === 0) {
    return null;
  }

  // 대시보드 페이지에서는 위젯 숨김 (큰 카드가 있으므로)
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  // 위젯이 닫혀있으면 숨김
  if (!isWidgetVisible) {
    return null;
  }

  // 상태별 색상
  const getColor = () => {
    if (status === 'paused') return 'yellow';
    if (status === 'running') return 'blue';
    return 'gray';
  };

  const color = getColor();

  // 진행률 계산 (1시간을 100%로)
  const maxTime = 3600000; // 1시간
  const progress = Math.min((elapsedTime / maxTime) * 100, 100);

  const handleMaximize = () => {
    navigate('/dashboard');
  };

  return (
    <Paper
      shadow="xl"
      p="md"
      radius="md"
      withBorder
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        minWidth: 280,
        maxWidth: 320,
        cursor: 'default',
      }}
    >
      <Stack gap="xs">
        {/* 헤더 */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: `var(--mantine-color-${color}-6)`,
                animation: status === 'running' ? 'pulse 2s infinite' : 'none',
              }}
            />
            <Text size="sm" fw={600}>
              스톱워치
            </Text>
          </Group>
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={handleMaximize}
              aria-label="대시보드로 이동"
            >
              <IconMaximize size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setWidgetVisible(false)}
              aria-label="위젯 닫기"
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* 타이머 디스플레이 */}
        <Text size="xl" fw={700} ta="center" c={color} style={{ fontSize: 32 }}>
          {formatTime(elapsedTime)}
        </Text>

        {/* 프로그레스 바 */}
        <Progress value={progress} color={color} size="sm" radius="xl" />

        {/* 랩 개수 */}
        {laps.length > 0 && (
          <Text size="xs" c="dimmed" ta="center">
            랩: {laps.length}개
          </Text>
        )}

        {/* 컨트롤 버튼 */}
        <Group justify="center" gap="xs">
          {status === 'idle' && (
            <ActionIcon
              variant="filled"
              color={color}
              size="lg"
              onClick={startTimer}
              aria-label="시작"
            >
              <IconPlayerPlay size={18} />
            </ActionIcon>
          )}

          {status === 'running' && (
            <>
              <ActionIcon
                variant="filled"
                color="yellow"
                size="lg"
                onClick={pauseTimer}
                aria-label="일시정지"
              >
                <IconPlayerPause size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
                onClick={recordLap}
                aria-label="랩 기록"
              >
                <IconFlag size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="gray"
                size="lg"
                onClick={resetTimer}
                aria-label="리셋"
              >
                <IconPlayerStop size={18} />
              </ActionIcon>
            </>
          )}

          {status === 'paused' && (
            <>
              <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
                onClick={resumeTimer}
                aria-label="재개"
              >
                <IconPlayerPlay size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
                onClick={recordLap}
                aria-label="랩 기록"
              >
                <IconFlag size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="gray"
                size="lg"
                onClick={resetTimer}
                aria-label="리셋"
              >
                <IconPlayerStop size={18} />
              </ActionIcon>
            </>
          )}
        </Group>
      </Stack>

      {/* 펄스 애니메이션 CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Paper>
  );
}
