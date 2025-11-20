"use client";

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
import { useTranslation } from "react-i18next";
import { categoryApi } from "@/services/api/transactionApi";
import type { Category, CategoryType } from "@/types/transaction";
import { getApiErrorMessage } from "@/utils/error";

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
  const { t } = useTranslation("finance");

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
      name: (value) =>
        value ? null : t("categoryManager.validation.nameRequired"),
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories(undefined, true),
  });

  // Create category
  const createMutation = useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notifications.show({
        title: t("categoryManager.notifications.successTitle"),
        message: t("categoryManager.notifications.createSuccess"),
        color: "teal",
      });
      form.reset();
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t("categoryManager.notifications.errorTitle"),
        message: getApiErrorMessage(
          error,
          t("categoryManager.notifications.createError")
        ),
        color: "red",
      });
    },
  });

  // Update category
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
        title: t("categoryManager.notifications.successTitle"),
        message: t("categoryManager.notifications.updateSuccess"),
        color: "teal",
      });
      setEditingCategory(null);
      form.reset();
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t("categoryManager.notifications.errorTitle"),
        message: getApiErrorMessage(
          error,
          t("categoryManager.notifications.updateError")
        ),
        color: "red",
      });
    },
  });

  // Delete category
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notifications.show({
        title: t("categoryManager.notifications.successTitle"),
        message: t("categoryManager.notifications.deleteSuccess"),
        color: "teal",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t("categoryManager.notifications.errorTitle"),
        message: getApiErrorMessage(
          error,
          t("categoryManager.notifications.deleteError")
        ),
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
        title: t("categoryManager.notifications.defaultDeleteTitle"),
        message: t("categoryManager.notifications.defaultDeleteMessage"),
        color: "orange",
      });
      return;
    }

    modals.openConfirmModal({
      title: t("categoryManager.confirmDelete.title"),
      children: (
        <Stack gap="sm">
          <Text size="sm">
            {t("categoryManager.confirmDelete.message", {
              name: category.name,
            })}
          </Text>
          <Text size="xs" c="dimmed">
            {t("categoryManager.confirmDelete.helper")}
          </Text>
        </Stack>
      ),
      labels: {
        confirm: t("categoryManager.confirmDelete.confirm"),
        cancel: t("categoryManager.confirmDelete.cancel"),
      },
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("categoryManager.modalTitle")}
      size="lg"
    >
      <Stack gap="lg">
        {/* Category create/edit form */}
        <Paper p="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Text size="sm" fw={600}>
                {editingCategory
                  ? t("categoryManager.form.editTitle")
                  : t("categoryManager.form.createTitle")}
              </Text>

              <TextInput
                label={t("categoryManager.form.fields.name.label")}
                placeholder={t(
                  "categoryManager.form.fields.name.placeholder"
                )}
                required
                {...form.getInputProps("name")}
              />

              <Select
                label={t("categoryManager.form.fields.type.label")}
                data={[
                  {
                    value: "INCOME",
                    label: t("transactionForm.types.INCOME"),
                  },
                  {
                    value: "EXPENSE",
                    label: t("transactionForm.types.EXPENSE"),
                  },
                ]}
                disabled={!!editingCategory}
                {...form.getInputProps("type")}
              />

              <div>
                <Text size="sm" fw={500} mb="xs">
                  {t("categoryManager.form.fields.color")}
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
                    {t("transactionForm.actions.cancel")}
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
                  {editingCategory
                    ? t("categoryManager.form.actions.update")
                    : t("categoryManager.form.actions.create")}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        <Divider />

        {/* Income category list */}
        <div>
          <Text size="sm" fw={600} mb="xs" c="teal">
            {t("categoryManager.lists.income")}
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
                        {t("categoryManager.lists.defaultTag")}
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

        {/* Expense category list */}
        <div>
          <Text size="sm" fw={600} mb="xs" c="red">
            {t("categoryManager.lists.expense")}
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
                        {t("categoryManager.lists.defaultTag")}
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
