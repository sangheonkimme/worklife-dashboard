import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Box,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
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
import { dashboardChecklistApi } from "@/services/api/dashboardChecklistApi";
import type {
  DashboardChecklistItem,
  DashboardChecklistResponse,
} from "@/types/dashboardChecklist";

interface ChecklistItemRowProps {
  item: DashboardChecklistItem;
  onToggle: (id: string, checked: boolean) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

function ChecklistItemRow({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: ChecklistItemRowProps) {
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
    <Paper
      withBorder
      radius="md"
      px="sm"
      py={6}
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        backgroundColor: item.isCompleted
          ? "var(--mantine-color-gray-0)"
          : "white",
      }}
    >
      <Checkbox
        aria-label="체크리스트 완료 표시"
        checked={item.isCompleted}
        onChange={(event) => onToggle(item.id, event.currentTarget.checked)}
        radius="sm"
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
        style={{ flex: 1 }}
        styles={{
          input: {
            textDecoration: item.isCompleted ? "line-through" : "none",
            color: item.isCompleted ? "var(--mantine-color-dimmed)" : "inherit",
          },
        }}
        placeholder="할 일을 입력하세요"
        readOnly={item.isCompleted}
      />
      <ActionIcon
        variant="subtle"
        color="red"
        aria-label="체크리스트 항목 삭제"
        onClick={() => onDelete(item.id)}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Paper>
  );
}

const CARD_MIN_HEIGHT = 360;

export function DashboardChecklist() {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
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
    onError: (error: any, _content, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notifications.show({
        title: "추가 실패",
        message:
          error.response?.data?.message ||
          "체크리스트 항목을 추가할 수 없습니다",
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
        title: "업데이트 실패",
        message: "변경 사항을 저장하지 못했습니다",
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
        title: "상태 변경 실패",
        message: "체크 상태를 변경할 수 없습니다",
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
        title: "삭제 실패",
        message: "항목을 삭제할 수 없습니다",
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
        title: "삭제 실패",
        message: "완료 항목을 삭제할 수 없습니다",
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
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: "100%",
        minHeight: CARD_MIN_HEIGHT,
        display: "flex",
      }}
    >
      <Stack gap="sm" style={{ flex: 1 }}>
        <Group justify="space-between">
          <div>
            <Text fw={600}>오늘 체크리스트</Text>
            <Text size="sm" c="dimmed">
              {isLimitReached
                ? "최대 항목 수에 도달했습니다"
                : `현재 ${totalCount}/${maxItems}개 작성`}
            </Text>
          </div>

          <ThemeIcon variant="light" color="green" radius="md">
            <IconCheck size={18} />
          </ThemeIcon>
        </Group>

        <TextInput
          value={inputValue}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          placeholder={
            isLimitReached
              ? "더 이상 항목을 추가할 수 없습니다"
              : "할 일을 입력하고 Enter"
          }
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
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          disabled={isLimitReached}
        />

        <ScrollArea style={{ flex: 1 }} offsetScrollbars type="auto">
          <Stack gap="xs" pb="xs">
            {isLoading && (
              <Box py="sm">
                <Text size="sm" c="dimmed">
                  로딩 중...
                </Text>
              </Box>
            )}

            {!isLoading && data && data.activeItems.length === 0 && (
              <Paper withBorder radius="md" p="md" bg="gray.0">
                <Text size="sm" c="dimmed">
                  아직 할 일이 없습니다. 바로 입력해보세요!
                </Text>
              </Paper>
            )}

            {data?.activeItems.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}

            {!!data?.completedItems.length && (
              <Box>
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
                    <Text size="sm">완료 {data.completedItems.length}개 보기</Text>
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
                    aria-label="완료 항목 모두 삭제"
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
                  <Stack gap="xs" mt="xs">
                    {data.completedItems.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        onToggle={handleToggle}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Card>
  );
}
