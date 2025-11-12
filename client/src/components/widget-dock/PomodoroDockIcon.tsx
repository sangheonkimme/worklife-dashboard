import { ActionIcon, Tooltip, Text, Box } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { useLocation } from 'react-router-dom';

export const PomodoroDockIcon = () => {
  const { status, sessionType, remainingTime, totalDuration, setWidgetVisible } = usePomodoroStore();
  const location = useLocation();
  const { t } = useTranslation('widgets');

  // Hide icon if timer never started
  if (status === 'idle' && remainingTime === totalDuration) {
    return null;
  }

  // Format time as M:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Color by session type
  const getColor = () => {
    if (status === 'paused') return 'yellow';
    if (sessionType === 'FOCUS') return 'red';
    return 'green';
  };

  const color = getColor();
  const sessionLabel =
    sessionType === 'FOCUS'
      ? t('pomodoro.sessionLabels.focus')
      : sessionType === 'SHORT_BREAK'
      ? t('pomodoro.sessionLabels.shortBreak')
      : t('pomodoro.sessionLabels.longBreak');

  const handleClick = () => {
    // On dashboard do nothing, elsewhere open the widget
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      return;
    }
    setWidgetVisible(true);
  };

  return (
    <Tooltip
      label={
         <Box>
          <Text size="xs" fw={600}>
            {t('pomodoro.title')}
          </Text>
          <Text size="xs" c="dimmed">
            {sessionLabel} • {formatTime(remainingTime)}
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

        {/* Pulse indicator while running */}
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

        {/* Small remaining-time label */}
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
