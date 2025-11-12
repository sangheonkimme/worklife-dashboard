import { ActionIcon, Tooltip, Text, Box } from '@mantine/core';
import { IconStopwatch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useStopwatchStore } from '@/store/useStopwatchStore';
import { useLocation } from 'react-router-dom';
import { formatTimeSimple } from '@/utils/timeFormat';

export const StopwatchDockIcon = () => {
  const { status, elapsedTime, laps, setWidgetVisible } = useStopwatchStore();
  const { t } = useTranslation('widgets');
  const location = useLocation();

  // Hide icon if stopwatch never started
  if (status === 'idle' && elapsedTime === 0 && laps.length === 0) {
    return null;
  }

  // Color by status
  const getColor = () => {
    if (status === 'paused') return 'yellow';
    if (status === 'running') return 'blue';
    return 'gray';
  };

  const color = getColor();

  const handleClick = () => {
    // On dashboard we do nothing, elsewhere we open the widget
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      return;
    }
    setWidgetVisible(true);
  };

  const statusText =
    status === 'running'
      ? t('stopwatch.dock.statusRunning')
      : status === 'paused'
      ? t('stopwatch.dock.statusPaused')
      : t('stopwatch.dock.statusIdle');

  return (
    <Tooltip
      label={
        <Box>
          <Text size="xs" fw={600}>
            {t('stopwatch.dock.tooltipTitle')}
          </Text>
          <Text size="xs" c="dimmed">
            {statusText} • {formatTimeSimple(elapsedTime)}
          </Text>
          {laps.length > 0 && (
            <Text size="xs" c="dimmed">
              {t('stopwatch.dock.lapCount', { count: laps.length })}
            </Text>
          )}
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
        <IconStopwatch size={24} stroke={1.5} />

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

        {/* Small elapsed time label */}
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
          {formatTimeSimple(elapsedTime)}
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
