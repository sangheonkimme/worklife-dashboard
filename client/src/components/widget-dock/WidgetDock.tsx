import { Stack, ActionIcon, Tooltip, Paper, Divider } from '@mantine/core';
import { useWidgetStore } from '@/store/useWidgetStore';
import { getEnabledWidgets } from './WidgetRegistry';
import { PomodoroDockIcon } from './PomodoroDockIcon';

export const WidgetDock = () => {
  const { activeWidgetId, toggleWidget } = useWidgetStore();
  const widgets = getEnabledWidgets();

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xs"
      style={{
        position: 'fixed',
        right: 16,
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

          return (
            <Tooltip
              key={widget.id}
              label={widget.name}
              position="left"
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

        {/* 포모도로 타이머 아이콘 (항상 마지막에 표시) */}
        <Divider my={4} />
        <PomodoroDockIcon />
      </Stack>
    </Paper>
  );
};
