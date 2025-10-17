import { useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Select,
  ActionIcon,
  Paper,
  ColorPicker,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconTrash, IconEdit, IconPlus } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { categoryApi } from "@/services/api/transactionApi";
import type { Category, CategoryType } from "@/types/transaction";

interface CategoryManagerProps {
  opened: boolean;
  onClose: () => void;
}

export default function CategoryManager({
  opened,
  onClose,
}: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<{
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
  }>({
    initialValues: {
      name: "",
      type: "EXPENSE",
      color: "#228be6",
      icon: "",
    },
    validate: {
      name: (value) => (value ? null : "카테고리 이름을 입력해주세요"),
    },
  });

  // 카테고리 목록 조회
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories(undefined, true),
  });

  // 카테고리 생성
  const createMutation = useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notifications.show({
        title: "성공",
        message: "카테고리가 추가되었습니다",
        color: "teal",
      });
      form.reset();
    },
    onError: (error: any) => {
      notifications.show({
        title: "오류",
        message:
          error.response?.data?.message || "카테고리 추가에 실패했습니다",
        color: "red",
      });
    },
  });

  // 카테고리 수정
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; color?: string; icon?: string };
    }) => categoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notifications.show({
        title: "성공",
        message: "카테고리가 수정되었습니다",
        color: "teal",
      });
      setEditingCategory(null);
      form.reset();
    },
    onError: (error: any) => {
      notifications.show({
        title: "오류",
        message:
          error.response?.data?.message || "카테고리 수정에 실패했습니다",
        color: "red",
      });
    },
  });

  // 카테고리 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notifications.show({
        title: "성공",
        message: "카테고리가 삭제되었습니다",
        color: "teal",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "오류",
        message:
          error.response?.data?.message || "카테고리 삭제에 실패했습니다",
        color: "red",
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: {
          name: values.name,
          color: values.color,
          icon: values.icon,
        },
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setValues({
      name: category.name,
      type: category.type,
      color: category.color || "#228be6",
      icon: category.icon || "",
    });
  };

  const handleDelete = (category: Category) => {
    if (category.isDefault) {
      notifications.show({
        title: "알림",
        message: "기본 카테고리는 삭제할 수 없습니다",
        color: "orange",
      });
      return;
    }

    modals.openConfirmModal({
      title: "카테고리 삭제",
      children: (
        <Stack gap="sm">
          <Text size="sm">
            정말로 "{category.name}" 카테고리를 삭제하시겠습니까?
          </Text>
          <Text size="xs" c="dimmed">
            이 카테고리를 사용하는 거래가 있는 경우, 거래를 다른 카테고리로
            재할당해야 합니다.
          </Text>
        </Stack>
      ),
      labels: { confirm: "삭제", cancel: "취소" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(category.id),
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
  };

  const incomeCategories = categories.filter((cat) => cat.type === "INCOME");
  const expenseCategories = categories.filter((cat) => cat.type === "EXPENSE");

  return (
    <Modal opened={opened} onClose={onClose} title="카테고리 관리" size="lg">
      <Stack gap="lg">
        {/* 카테고리 추가/수정 폼 */}
        <Paper p="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Text size="sm" fw={600}>
                {editingCategory ? "카테고리 수정" : "새 카테고리 추가"}
              </Text>

              <TextInput
                label="이름"
                placeholder="카테고리 이름"
                required
                {...form.getInputProps("name")}
              />

              <Select
                label="유형"
                data={[
                  { value: "INCOME", label: "수입" },
                  { value: "EXPENSE", label: "지출" },
                ]}
                disabled={!!editingCategory}
                {...form.getInputProps("type")}
              />

              <div>
                <Text size="sm" fw={500} mb="xs">
                  색상
                </Text>
                <ColorPicker
                  format="hex"
                  swatches={[
                    "#25262b",
                    "#868e96",
                    "#fa5252",
                    "#e64980",
                    "#be4bdb",
                    "#7950f2",
                    "#4c6ef5",
                    "#228be6",
                    "#15aabf",
                    "#12b886",
                    "#40c057",
                    "#82c91e",
                    "#fab005",
                    "#fd7e14",
                  ]}
                  {...form.getInputProps("color")}
                />
              </div>

              <Group justify="flex-end">
                {editingCategory && (
                  <Button variant="light" onClick={handleCancelEdit}>
                    취소
                  </Button>
                )}
                <Button
                  type="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                  leftSection={
                    editingCategory ? (
                      <IconEdit size={16} />
                    ) : (
                      <IconPlus size={16} />
                    )
                  }
                >
                  {editingCategory ? "수정" : "추가"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        <Divider />

        {/* 수입 카테고리 목록 */}
        <div>
          <Text size="sm" fw={600} mb="xs" c="teal">
            수입 카테고리
          </Text>
          <Stack gap="xs">
            {incomeCategories.map((category) => (
              <Paper key={category.id} p="sm" withBorder>
                <Group justify="space-between">
                  <Group gap="sm">
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: category.color || "#228be6",
                      }}
                    />
                    <Text size="sm">{category.name}</Text>
                    {category.isDefault && (
                      <Text size="xs" c="dimmed">
                        (기본)
                      </Text>
                    )}
                  </Group>

                  {!category.isDefault && (
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleEdit(category)}
                        disabled={deleteMutation.isPending}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(category)}
                        disabled={deleteMutation.isPending}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        </div>

        {/* 지출 카테고리 목록 */}
        <div>
          <Text size="sm" fw={600} mb="xs" c="red">
            지출 카테고리
          </Text>
          <Stack gap="xs">
            {expenseCategories.map((category) => (
              <Paper key={category.id} p="sm" withBorder>
                <Group justify="space-between">
                  <Group gap="sm">
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: category.color || "#fa5252",
                      }}
                    />
                    <Text size="sm">{category.name}</Text>
                    {category.isDefault && (
                      <Text size="xs" c="dimmed">
                        (기본)
                      </Text>
                    )}
                  </Group>

                  {!category.isDefault && (
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleEdit(category)}
                        disabled={deleteMutation.isPending}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(category)}
                        disabled={deleteMutation.isPending}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
