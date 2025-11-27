"use client";

import { Paper, Stack, Group, Text, CloseButton, Box } from "@mantine/core";
import { useWidgetStore } from '@/store/useWidgetStore';
import { getWidgetById } from './WidgetRegistry';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const WidgetSidePanel = () => {
  const { activeWidgetId, closeWidget, preferences } = useWidgetStore();
  const [isVisible, setIsVisible] = useState(false);
  const isLeftDock = preferences.dockPosition === 'left';
  const { t } = useTranslation('widgets');

  useEffect(() => {
    let timer: number | null = null;
    let animationFrame: number | null = null;

    if (activeWidgetId) {
      timer = window.setTimeout(() => setIsVisible(true), 10);
    } else {
      animationFrame = window.requestAnimationFrame(() => setIsVisible(false));
    }

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
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
  const widgetName = widgetConfig.nameKey
    ? t(widgetConfig.nameKey)
    : widgetConfig.name;
  const widgetDescription = widgetConfig.descriptionKey
    ? t(widgetConfig.descriptionKey)
    : widgetConfig.description;

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
          width: 'min(90vw, 420px)', // keep between roughly 400-450px
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'var(--mantine-color-body)',
          border: '1px solid var(--mantine-color-default-border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // subtle shadow
          transformOrigin: `${isLeftDock ? 'left' : 'right'} center`,
          transform: isVisible
            ? 'translateY(-50%) scale(1)'
            : 'translateY(-50%) scale(0.3)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <Icon
                size={24}
                stroke={1.5}
                color={`var(--mantine-color-${widgetConfig.color}-6)`}
              />
              <div>
                <Text size="lg" fw={600}>
                  {widgetName}
                </Text>
                <Text size="xs" c="dimmed">
                  {widgetDescription}
                </Text>
              </div>
            </Group>
            <CloseButton onClick={closeWidget} size="lg" />
          </Group>

          {/* Widget content */}
          <WidgetComponent onClose={closeWidget} />
        </Stack>
      </Paper>
    </Box>
  );
};
