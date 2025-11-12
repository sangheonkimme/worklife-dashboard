import { Stack, ActionIcon, Tooltip, Paper, Divider } from '@mantine/core';
import { useWidgetStore } from '@/store/useWidgetStore';
import { getEnabledWidgets } from './WidgetRegistry';
import { PomodoroDockIcon } from './PomodoroDockIcon';
import { StopwatchDockIcon } from './StopwatchDockIcon';
import { useTranslation } from 'react-i18next';

export const WidgetDock = () => {
  const { activeWidgetId, toggleWidget, preferences } = useWidgetStore();
  const widgets = getEnabledWidgets();
  const isLeftDock = preferences.dockPosition === 'left';
  const { t } = useTranslation('widgets');

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xs"
      style={{
        position: 'fixed',
        right: isLeftDock ? 'auto' : 16,
        left: isLeftDock ? 16 : 'auto',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Stack gap="xs">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          const isActive = activeWidgetId === widget.id;

          const label = widget.nameKey ? t(widget.nameKey) : widget.name;

          return (
            <Tooltip
              key={widget.id}
              label={label}
              position={isLeftDock ? 'right' : 'left'}
              withArrow
            >
              <ActionIcon
                size="xl"
                variant={isActive ? 'filled' : 'light'}
                color={widget.color}
                onClick={() => toggleWidget(widget.id)}
                style={{
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={24} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          );
        })}

        {/* Pomodoro timer & stopwatch icons (always shown last) */}
        <Divider my={4} />
        <PomodoroDockIcon />
        <StopwatchDockIcon />
      </Stack>
    </Paper>
  );
};
