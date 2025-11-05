import { ActionIcon, Tooltip, Text, Box } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { useLocation } from 'react-router-dom';

export const PomodoroDockIcon = () => {
  const { status, sessionType, remainingTime, totalDuration, setWidgetVisible } = usePomodoroStore();
  const location = useLocation();

  // 타이머가 시작되지 않았으면 아이콘 숨김
  if (status === 'idle' && remainingTime === totalDuration) {
    return null;
  }

  // 남은 시간을 M:SS 형식으로 변환 (짧게)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 세션 타입별 색상
  const getColor = () => {
    if (status === 'paused') return 'yellow';
    if (sessionType === 'FOCUS') return 'red';
    return 'green';
  };

  const color = getColor();

  const handleClick = () => {
    // 대시보드 페이지가 아니면 위젯 표시, 대시보드면 네비게이트
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      // 이미 대시보드에 있으면 아무것도 안 함
      return;
    }
    // 다른 페이지에서는 위젯 표시
    setWidgetVisible(true);
  };

  return (
    <Tooltip
      label={
        <Box>
          <Text size="xs" fw={600}>
            포모도로 타이머
          </Text>
          <Text size="xs" c="dimmed">
            {sessionType === 'FOCUS' ? '집중' : '휴식'} • {formatTime(remainingTime)}
          </Text>
        </Box>
      }
      position="left"
      withArrow
    >
      <ActionIcon
        size="xl"
        variant="light"
        color={color}
        onClick={handleClick}
        style={{
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        <IconClock size={24} stroke={1.5} />

        {/* 실행 중일 때 펄스 효과 */}
        {status === 'running' && (
          <Box
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: `var(--mantine-color-${color}-6)`,
              animation: 'pulse 2s infinite',
            }}
          />
        )}

        {/* 남은 시간 표시 (작은 텍스트) */}
        <Text
          size="8px"
          fw={700}
          style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            color: `var(--mantine-color-${color}-6)`,
          }}
        >
          {formatTime(remainingTime)}
        </Text>

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
      </ActionIcon>
    </Tooltip>
  );
};
