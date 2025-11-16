import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { dashboardChecklistApi } from "@/services/api/dashboardChecklistApi";
import type {
  DashboardChecklistItem,
  DashboardChecklistResponse,
} from "@/types/dashboardChecklist";
import { getApiErrorMessage } from "@/utils/error";
import {
  DASHBOARD_WIDGET_CARD_HEIGHT,
  DASHBOARD_WIDGET_HEIGHT,
} from "@/constants/dashboard";

interface ChecklistItemRowProps {
  item: DashboardChecklistItem;
  onToggle: (id: string, checked: boolean) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  showDivider?: boolean;
}

function ChecklistItemRow({
  item,
  onToggle,
  onUpdate,
  onDelete,
  showDivider = false,
}: ChecklistItemRowProps) {
  const { t } = useTranslation("dashboard");
  const [value, setValue] = useState(item.content);

  useEffect(() => {
    setValue(item.content);
  }, [item.content]);

  const handleBlur = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === item.content) {
      setValue(item.content);
      return;
    }
    onUpdate(item.id, trimmed);
  };

  return (
    <Box>
      <Group gap="sm" align="center" wrap="nowrap" px={4} py={4}>
        <Checkbox
          aria-label={t("checklist.checkboxAria")}
          checked={item.isCompleted}
          onChange={(event) => onToggle(item.id, event.currentTarget.checked)}
          radius="sm"
          size="sm"
          styles={{ input: { cursor: "pointer" } }}
        />
        <TextInput
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onBlur={handleBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          variant="unstyled"
          size="sm"
          style={{ flex: 1, minWidth: 0 }}
          styles={{
            input: {
              textDecoration: item.isCompleted ? "line-through" : "none",
              color: item.isCompleted
                ? "var(--mantine-color-dimmed)"
                : "inherit",
              paddingTop: 0,
              paddingBottom: 0,
            },
          }}
          placeholder={t("checklist.inputPlaceholder")}
          readOnly={item.isCompleted}
        />
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label={t("checklist.deleteAria")}
          onClick={() => onDelete(item.id)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
      {showDivider && <Divider my={0} />}
    </Box>
  );
}

const CHECKLIST_CARD_HEIGHT = DASHBOARD_WIDGET_CARD_HEIGHT;

export function DashboardChecklist() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["dashboard", "system"]);
  const [inputValue, setInputValue] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const queryKey = ["dashboardChecklist"] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: dashboardChecklistApi.getList,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      dashboardChecklistApi.createItem({ content }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<DashboardChecklistResponse>(queryKey);
      if (!previousData) {
        return { previousData };
      }

      const optimisticId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimisticItem: DashboardChecklistItem = {
        id: optimisticId,
        content,
        isCompleted: false,
        order: previousData.activeItems.length + 1,
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData(queryKey, {
        ...previousData,
        activeItems: [optimisticItem, ...previousData.activeItems],
      });

      return { previousData, optimisticId };
    },
    onSuccess: (newItem, _content, context) => {
      setInputValue("");
      if (context?.optimisticId) {
        queryClient.setQueryData<DashboardChecklistResponse | undefined>(
          queryKey,
          (current) => {
            if (!current) return current;
            return {
              ...current,
              activeItems: current.activeItems.map((item) =>
                item.id === context.optimisticId ? newItem : item
              ),
            };
          }
        );
      }
    },
    onError: (error: unknown, _content, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notifications.show({
        title: t("dashboard:checklist.notifications.createErrorTitle"),
        message: getApiErrorMessage(
          error,
          t("dashboard:checklist.notifications.createErrorMessage")
        ),
        color: "red",
      });
    },
    onSettled: () => {
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content?: string }) =>
      dashboardChecklistApi.updateItem(id, { content }),
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<DashboardChecklistResponse>(queryKey);
      if (!previousData || !content) {
        return { previousData };
      }

      const applyContentUpdate = (items: DashboardChecklistItem[]) =>
        items.map((item) =>
          item.id === id
            ? { ...item, content, updatedAt: new Date().toISOString() }
            : item
        );

      queryClient.setQueryData(queryKey, {
        ...previousData,
        activeItems: applyContentUpdate(previousData.activeItems),
        completedItems: applyContentUpdate(previousData.completedItems),
      });

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notifications.show({
        title: t("dashboard:checklist.notifications.updateErrorTitle"),
        message: t("dashboard:checklist.notifications.updateErrorMessage"),
        color: "red",
      });
    },
    onSettled: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      dashboardChecklistApi.updateItem(id, { isCompleted }),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<DashboardChecklistResponse>(queryKey);
      if (!previousData) {
        return { previousData };
      }

      let targetItem: DashboardChecklistItem | undefined;
      const nextActive = previousData.activeItems.filter((item) => {
        if (item.id === id) {
          targetItem = { ...item };
          return false;
        }
        return true;
      });
      const nextCompleted = previousData.completedItems.filter((item) => {
        if (item.id === id) {
          targetItem = { ...item };
          return false;
        }
        return true;
      });

      if (!targetItem) {
        return { previousData };
      }

      const updatedItem: DashboardChecklistItem = {
        ...targetItem,
        isCompleted,
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKey, {
        ...previousData,
        activeItems: isCompleted
          ? nextActive
          : [updatedItem, ...nextActive],
        completedItems: isCompleted
          ? [updatedItem, ...nextCompleted]
          : nextCompleted,
      });

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notifications.show({
        title: t("dashboard:checklist.notifications.toggleErrorTitle"),
        message: t("dashboard:checklist.notifications.toggleErrorMessage"),
        color: "red",
      });
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dashboardChecklistApi.deleteItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<DashboardChecklistResponse>(queryKey);
      if (!previousData) {
        return { previousData };
      }

      queryClient.setQueryData(queryKey, {
        ...previousData,
        activeItems: previousData.activeItems.filter((item) => item.id !== id),
        completedItems: previousData.completedItems.filter(
          (item) => item.id !== id
        ),
      });

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notifications.show({
        title: t("dashboard:checklist.notifications.deleteErrorTitle"),
        message: t("dashboard:checklist.notifications.deleteErrorMessage"),
        color: "red",
      });
    },
    onSettled: invalidate,
  });

  const clearCompletedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => dashboardChecklistApi.deleteItem(id)));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<DashboardChecklistResponse>(queryKey);
      if (!previousData) {
        return { previousData };
      }

      const idSet = new Set(ids);
      queryClient.setQueryData(queryKey, {
        ...previousData,
        completedItems: previousData.completedItems.filter(
          (item) => !idSet.has(item.id)
        ),
      });

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notifications.show({
        title: t("dashboard:checklist.notifications.clearErrorTitle"),
        message: t("dashboard:checklist.notifications.clearErrorMessage"),
        color: "red",
      });
    },
    onSettled: invalidate,
  });

  const totalCount = useMemo(() => {
    if (!data) return 0;
    return data.activeItems.length + data.completedItems.length;
  }, [data]);

  const maxItems = data?.maxItems ?? 0;
  const isLimitReached = maxItems > 0 && totalCount >= maxItems;
  const countLabelText =
    maxItems > 0
      ? t("dashboard:checklist.countLabelShort", {
          current: totalCount,
          max: maxItems,
        })
      : t("dashboard:checklist.countLabelUnlimited", {
          current: totalCount,
        });

  const handleAdd = () => {
    if (!inputValue.trim() || isLimitReached) return;
    createMutation.mutate(inputValue.trim());
  };

  const handleToggle = (id: string, checked: boolean) => {
    toggleMutation.mutate({ id, isCompleted: checked });
  };

  const handleUpdate = (id: string, content: string) => {
    updateMutation.mutate({ id, content });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <Box
      style={{
        height: DASHBOARD_WIDGET_HEIGHT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Group justify="space-between" align="center" mb={4}>
        <Title order={4} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{t("dashboard:checklist.title")}</span>
          <Text size="xs" c={isLimitReached ? "red.6" : "dimmed"} component="span">
            ({countLabelText})
          </Text>
          {isLimitReached && (
            <Badge color="red" size="xs" radius="sm" variant="light">
              {t("dashboard:checklist.limitBadge")}
            </Badge>
          )}
        </Title>
        <ThemeIcon variant="light" color="green" radius="md" size="lg">
          <IconCheck size={16} />
        </ThemeIcon>
      </Group>

      <TextInput
        value={inputValue}
        onChange={(event) => setInputValue(event.currentTarget.value)}
        placeholder={
          isLimitReached
            ? t("dashboard:checklist.inputPlaceholderLimit")
            : t("dashboard:checklist.inputPlaceholderHint")
        }
        size="sm"
        rightSection={
          <ActionIcon
            size="sm"
            variant="filled"
            color="blue"
            radius="xl"
            disabled={!inputValue.trim() || isLimitReached}
            onClick={handleAdd}
          >
            <IconPlus size={14} />
          </ActionIcon>
        }
        rightSectionWidth={32}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            handleAdd();
          }
        }}
        disabled={isLimitReached}
        mb="xs"
      />

      <Card
        shadow="sm"
        padding={0}
        radius="md"
        withBorder
        style={{
          flex: 1,
          minHeight: CHECKLIST_CARD_HEIGHT,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <ScrollArea style={{ flex: 1 }} offsetScrollbars type="auto">
          <Box px="md" py="sm">
            <Stack gap={0}>
              {isLoading && (
                <Box py="sm">
                  <Text size="sm" c="dimmed">
                    {t("system:status.loading")}
                  </Text>
                </Box>
              )}

              {!isLoading && data && data.activeItems.length === 0 && (
                <Text size="sm" c="dimmed" py="sm">
                  {t("dashboard:checklist.empty")}
                </Text>
              )}

              {data?.activeItems.map((item, index) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  showDivider={index !== data.activeItems.length - 1}
                />
              ))}

              {!!data?.completedItems.length && (
                <Box pt="sm">
                  <Divider mb="xs" />
                  <Group justify="space-between" gap="xs">
                    <UnstyledButton
                      onClick={() => setShowCompleted((prev) => !prev)}
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.25rem 0",
                        color: "var(--mantine-color-dimmed)",
                      }}
                    >
                      <Text size="sm">
                        {t("dashboard:checklist.completedToggle", {
                          count: data.completedItems.length,
                        })}
                      </Text>
                      {showCompleted ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      )}
                    </UnstyledButton>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="red"
                      aria-label={t(
                        "dashboard:checklist.deleteCompletedAria"
                      )}
                      onClick={() =>
                        clearCompletedMutation.mutate(
                          data.completedItems.map((item) => item.id)
                        )
                      }
                      loading={clearCompletedMutation.isPending}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                  <Collapse in={showCompleted}>
                    <Stack gap={0} mt="xs">
                      {data.completedItems.map((item, index) => (
                        <ChecklistItemRow
                          key={item.id}
                          item={item}
                          onToggle={handleToggle}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                          showDivider={index !== data.completedItems.length - 1}
                        />
                      ))}
                    </Stack>
                  </Collapse>
                </Box>
              )}
            </Stack>
          </Box>
        </ScrollArea>
      </Card>
    </Box>
  );
}
