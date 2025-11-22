"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Stack, Grid, SimpleGrid, Card, Skeleton } from "@mantine/core";
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

const DASHBOARD_WIDGETS: WidgetConfig[] = [
  { id: "image-crop", Component: ImageCropCard },
  { id: "image-to-pdf", Component: ImageToPdfCard },
  { id: "timer", Component: TimerCard, maxHeight: LARGE_WIDGET_HEIGHT },
  {
    id: "salary-calculator",
    Component: SalaryCalculatorCard,
    maxHeight: DEFAULT_MAX_HEIGHT,
  },
  {
    id: "pomodoro-timer",
    Component: PomodoroTimerCard,
    maxHeight: DEFAULT_MAX_HEIGHT,
  },
  { id: "stopwatch", Component: StopwatchCard, maxHeight: DEFAULT_MAX_HEIGHT },
];

const WIDGET_META = DASHBOARD_WIDGETS.reduce<Record<string, WidgetConfig>>(
  (acc, widget) => {
    acc[widget.id] = widget;
    return acc;
  },
  {}
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
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() =>
    DASHBOARD_WIDGETS.map(({ id }) => id)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <Stack gap="lg">
        <Grid gutter="lg" align="stretch">
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <WidgetSkeleton />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}>
            <WidgetSkeleton />
          </Grid.Col>
        </Grid>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {widgetOrder.map((id) => (
            <WidgetSkeleton key={id} />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <StickyNotes />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 3 }}>
          <DashboardChecklist />
        </Grid.Col>
      </Grid>
      <div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {widgetOrder.map((widgetId) => {
                const widgetMeta = WIDGET_META[widgetId];

                if (!widgetMeta) {
                  return null;
                }

                const { Component: WidgetComponent, maxHeight } = widgetMeta;

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
