import { Paper, Stack, Group, Text, CloseButton, Box } from '@mantine/core';
import { useWidgetStore } from '@/store/useWidgetStore';
import { getWidgetById } from './WidgetRegistry';
import { useState, useEffect } from 'react';

export const WidgetSidePanel = () => {
  const { activeWidgetId, closeWidget, preferences } = useWidgetStore();
  const [isVisible, setIsVisible] = useState(false);
  const isLeftDock = preferences.dockPosition === 'left';

  useEffect(() => {
    if (activeWidgetId) {
      // 약간의 지연 후 애니메이션 시작
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [activeWidgetId]);

  if (!activeWidgetId) {
    return null;
  }

  const widgetConfig = getWidgetById(activeWidgetId);

  if (!widgetConfig) {
    return null;
  }

  const WidgetComponent = widgetConfig.component;
  const Icon = widgetConfig.icon;

  return (
    <Box
      style={{
        position: 'fixed',
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        pointerEvents: isVisible ? 'auto' : 'none',
        zIndex: 98,
      }}
    >
      <Paper
        radius="md"
        p="md"
        style={{
          position: 'absolute',
          ...(isLeftDock ? { left: 96 } : { right: 96 }),
          top: '50%',
          width: 'min(90vw, 420px)', // 400~450px 사이로 축소
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'var(--mantine-color-body)',
          border: '1px solid var(--mantine-color-default-border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // 연한 그림자
          transformOrigin: `${isLeftDock ? 'left' : 'right'} center`,
          transform: isVisible
            ? 'translateY(-50%) scale(1)'
            : 'translateY(-50%) scale(0.3)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Stack gap="lg">
          {/* 헤더 */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <Icon
                size={24}
                stroke={1.5}
                color={`var(--mantine-color-${widgetConfig.color}-6)`}
              />
              <div>
                <Text size="lg" fw={600}>
                  {widgetConfig.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {widgetConfig.description}
                </Text>
              </div>
            </Group>
            <CloseButton onClick={closeWidget} size="lg" />
          </Group>

          {/* 위젯 콘텐츠 */}
          <WidgetComponent onClose={closeWidget} />
        </Stack>
      </Paper>
    </Box>
  );
};
