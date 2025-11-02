import { useState } from "react";
import {
  Box,
  Checkbox,
  TextInput,
  ActionIcon,
  Group,
  Progress,
  Text,
  Stack,
  Paper,
  Button,
  Loader,
} from "@mantine/core";
import { IconTrash, IconGripVertical, IconPlus } from "@tabler/icons-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useChecklistItems,
  useChecklistProgress,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
  useReorderChecklistItems,
} from "@/hooks/useChecklist";
import type { ChecklistItem } from "@/types/checklist";

interface ChecklistEditorProps {
  noteId: string;
}

interface SortableItemProps {
  item: ChecklistItem;
  editingId: string | null;
  editContent: string;
  onToggle: (item: ChecklistItem) => void;
  onStartEdit: (item: ChecklistItem) => void;
  onSaveEdit: (id: string) => void;
  onEditContentChange: (content: string) => void;
  onDelete: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, action: () => void) => void;
}

function SortableItem({
  item,
  editingId,
  editContent,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onEditContentChange,
  onDelete,
  onKeyDown,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper ref={setNodeRef} style={style} p="sm" withBorder>
      <Group gap="xs" wrap="nowrap">
        {/* Drag Handle */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          style={{ cursor: "grab" }}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={16} />
        </ActionIcon>

        {/* Checkbox */}
        <Checkbox
          checked={item.isCompleted}
          onChange={() => onToggle(item)}
          styles={{
            input: { cursor: "pointer" },
          }}
        />

        {/* Content */}
        {editingId === item.id ? (
          <TextInput
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, () => onSaveEdit(item.id))}
            onBlur={() => onSaveEdit(item.id)}
            autoFocus
            style={{ flex: 1 }}
            size="sm"
          />
        ) : (
          <Text
            size="sm"
            style={{
              flex: 1,
              textDecoration: item.isCompleted ? "line-through" : "none",
              color: item.isCompleted
                ? "var(--mantine-color-dimmed)"
                : "inherit",
              cursor: "pointer",
            }}
            onClick={() => onStartEdit(item)}
          >
            {item.content}
          </Text>
        )}

        {/* Delete Button */}
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => onDelete(item.id)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}

export function ChecklistEditor({ noteId }: ChecklistEditorProps) {
  const [newItemContent, setNewItemContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: items = [], isLoading } = useChecklistItems(noteId);
  const { data: progress } = useChecklistProgress(noteId);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const reorderItems = useReorderChecklistItems();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddItem = () => {
    if (!newItemContent.trim()) return;

    createItem.mutate(
      {
        noteId,
        data: { content: newItemContent.trim() },
      },
      {
        onSuccess: () => {
          setNewItemContent("");
        },
      }
    );
  };

  const handleToggle = (item: ChecklistItem) => {
    toggleItem.mutate({
      id: item.id,
      isCompleted: !item.isCompleted,
    });
  };

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) return;

    updateItem.mutate(
      {
        id,
        data: { content: editContent.trim() },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent("");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate({ id, noteId });
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    } else if (e.key === "Escape" && editingId) {
      handleCancelEdit();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // 순서 변경 API 호출
      const reorderData = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      reorderItems.mutate({ noteId, items: reorderData });
    }
  };

  if (isLoading) {
    return (
      <Box ta="center" py="xl">
        <Loader size="sm" />
      </Box>
    );
  }

  const progressPercentage = progress
    ? (progress.completed / progress.total) * 100
    : 0;

  return (
    <Stack gap="md">
      {/* Progress Bar */}
      {items.length > 0 && progress && (
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              진행률
            </Text>
            <Text size="sm" c="dimmed">
              {progress.completed} / {progress.total}
            </Text>
          </Group>
          <Progress value={progressPercentage} size="lg" radius="xl" />
        </Paper>
      )}

      {/* Checklist Items */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack gap="xs">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                editingId={editingId}
                editContent={editContent}
                onToggle={handleToggle}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onEditContentChange={setEditContent}
                onDelete={handleDelete}
                onKeyDown={handleKeyDown}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

      {/* Add New Item */}
      <Paper p="sm" withBorder>
        <Group gap="xs" wrap="nowrap">
          <TextInput
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAddItem)}
            placeholder="새 항목 추가..."
            style={{ flex: 1 }}
            size="sm"
            rightSection={
              createItem.isPending ? <Loader size="xs" /> : undefined
            }
          />
          <Button
            onClick={handleAddItem}
            disabled={!newItemContent.trim() || createItem.isPending}
            leftSection={<IconPlus size={16} />}
            size="sm"
          >
            추가
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
}
