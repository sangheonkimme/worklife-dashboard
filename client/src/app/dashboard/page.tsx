"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Stack,
  Grid,
  SimpleGrid,
  Card,
  Skeleton,
  Text,
  Group,
  Button,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";

type WidgetConfig = {
  id: string;
  Component: ComponentType;
  maxHeight?: number;
};

const DEFAULT_MAX_HEIGHT = 360;
const LARGE_WIDGET_HEIGHT = 760;

const WidgetSkeleton = ({
  height = DEFAULT_MAX_HEIGHT,
}: {
  height?: number;
}) => (
  <Card radius="md" padding="lg" withBorder style={{ height }}>
    <Skeleton height="100%" radius="md" />
  </Card>
);

const StickyNotes = dynamic(
  () =>
    import("@/components/dashboard/StickyNotes").then(
      (mod) => mod.StickyNotes
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const DashboardChecklist = dynamic(
  () =>
    import("@/components/dashboard/DashboardChecklist").then(
      (mod) => mod.DashboardChecklist
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const ImageCropCard = dynamic(
  () =>
    import("@/components/dashboard/ImageCropCard").then(
      (mod) => mod.ImageCropCard
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const ImageToPdfCard = dynamic(
  () =>
    import("@/components/dashboard/ImageToPdfCard").then(
      (mod) => mod.ImageToPdfCard
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const TimerCard = dynamic(
  () =>
    import("@/components/dashboard/TimerCard").then((mod) => mod.TimerCard),
  {
    loading: () => <WidgetSkeleton height={LARGE_WIDGET_HEIGHT} />,
    ssr: false,
  }
);

const SalaryCalculatorCard = dynamic(
  () =>
    import("@/components/salary/SalaryCalculatorCard").then(
      (mod) => mod.SalaryCalculatorCard
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const PomodoroTimerCard = dynamic(
  () =>
    import("@/components/dashboard/PomodoroTimerCard").then(
      (mod) => mod.PomodoroTimerCard
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const StopwatchCard = dynamic(
  () =>
    import("@/components/dashboard/StopwatchCard").then(
      (mod) => mod.StopwatchCard
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const SubscriptionSummaryCard = dynamic(
  () =>
    import("@/components/subscriptions/SubscriptionSummaryCard").then(
      (mod) => mod.SubscriptionSummaryCard
    ),
  {
    loading: () => <WidgetSkeleton height={DEFAULT_MAX_HEIGHT} />,
    ssr: false,
  }
);

const DASHBOARD_WIDGETS: WidgetConfig[] = [
  {
    id: "salary-calculator",
    Component: SalaryCalculatorCard,
    maxHeight: DEFAULT_MAX_HEIGHT,
  },
  { id: "image-crop", Component: ImageCropCard },
  { id: "image-to-pdf", Component: ImageToPdfCard },
  { id: "timer", Component: TimerCard, maxHeight: LARGE_WIDGET_HEIGHT },
  { id: "pomodoro-timer", Component: PomodoroTimerCard },
  { id: "stopwatch", Component: StopwatchCard },
  { id: "subscription-summary", Component: SubscriptionSummaryCard },
];

const PUBLIC_WIDGET_IDS = [
  "image-crop",
  "image-to-pdf",
  "timer",
  "salary-calculator",
  "pomodoro-timer",
  "stopwatch",
] as const;

const PUBLIC_WIDGETS = DASHBOARD_WIDGETS.filter((widget) =>
  PUBLIC_WIDGET_IDS.includes(widget.id as (typeof PUBLIC_WIDGET_IDS)[number])
);

const SortableWidget = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "default",
    zIndex: isDragging ? 1 : undefined,
    position: "relative" as const,
  };

  const handleStyles = {
    position: "absolute" as const,
    zIndex: 2,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        style={{
          ...handleStyles,
          top: -6,
          left: -4,
          right: -4,
          height: 16,
        }}
      />
      <div
        {...listeners}
        style={{
          ...handleStyles,
          bottom: -6,
          left: -4,
          right: -4,
          height: 16,
        }}
      />
      <div
        {...listeners}
        style={{
          ...handleStyles,
          top: -4,
          bottom: -4,
          left: -6,
          width: 16,
        }}
      />
      <div
        {...listeners}
        style={{
          ...handleStyles,
          top: -4,
          bottom: -4,
          right: -6,
          width: 16,
        }}
      />
      {children}
    </div>
  );
};

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("dashboard");
  const availableWidgets = useMemo(
    () => (isAuthenticated ? DASHBOARD_WIDGETS : PUBLIC_WIDGETS),
    [isAuthenticated]
  );
  const widgetMeta = useMemo(
    () =>
      availableWidgets.reduce<Record<string, WidgetConfig>>((acc, widget) => {
        acc[widget.id] = widget;
        return acc;
      }, {}),
    [availableWidgets]
  );
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() =>
    availableWidgets.map(({ id }) => id)
  );

  useEffect(() => {
    // keep widget order in sync with available widgets (auth toggles)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWidgetOrder((prevOrder) => {
      const allowedIds = availableWidgets.map(({ id }) => id);
      const filtered = prevOrder.filter((id) => allowedIds.includes(id));
      const missing = allowedIds.filter((id) => !filtered.includes(id));
      const nextOrder = [...filtered, ...missing];
      const isSameOrder =
        nextOrder.length === prevOrder.length &&
        nextOrder.every((id, index) => id === prevOrder[index]);

      return isSameOrder ? prevOrder : nextOrder;
    });
  }, [availableWidgets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = widgetOrder.indexOf(activeId);
    const newIndex = widgetOrder.indexOf(overId);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    setWidgetOrder((items) => arrayMove(items, oldIndex, newIndex));

    trackEvent({
      name: "dashboard_widget_reordered",
      params: {
        widget_id: activeId,
        from_index: oldIndex,
        to_index: newIndex,
        total_widgets: widgetOrder.length,
      },
    });
  };

  return (
    <Stack gap="lg">
      {isAuthenticated ? (
        <Grid gutter="lg" align="stretch">
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <StickyNotes />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}>
            <DashboardChecklist />
          </Grid.Col>
        </Grid>
      ) : (
        <Card radius="md" padding="lg" withBorder>
          <Stack gap="xs">
            <Text fw={600} size="lg">
              {t("guestCta.title")}
            </Text>
            <Text size="sm" c="dimmed">
              {t("guestCta.description")}
            </Text>
            <Group gap="sm">
              <Button component={Link} href="/login">
                {t("guestCta.login")}
              </Button>
              <Button component={Link} href="/signup" variant="light">
                {t("guestCta.signup")}
              </Button>
            </Group>
          </Stack>
        </Card>
      )}
      <div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {widgetOrder.map((widgetId) => {
                const widget = widgetMeta[widgetId];

                if (!widget) {
                  return null;
                }

                const { Component: WidgetComponent, maxHeight } = widget;

                return (
                  <SortableWidget key={widgetId} id={widgetId}>
                    <div
                      style={{
                        maxHeight,
                        overflowY: maxHeight ? "auto" : undefined,
                      }}
                    >
                      <WidgetComponent />
                    </div>
                  </SortableWidget>
                );
              })}
            </SimpleGrid>
          </SortableContext>
        </DndContext>
      </div>
    </Stack>
  );
};

export default DashboardPage;
