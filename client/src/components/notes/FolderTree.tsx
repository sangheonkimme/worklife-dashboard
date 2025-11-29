"use client";

import { useState, type KeyboardEvent } from "react";
import {
  Text,
  ActionIcon,
  Group,
  Stack,
  Badge,
  UnstyledButton,
  Paper,
  Divider,
  Flex,
} from "@mantine/core";
import {
  IconFolder,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
} from "@tabler/icons-react";
import { useFolders, useDeleteFolder } from "@/hooks/useFolders";
import type { Folder } from "@/types/folder";
import { FolderModal } from "./FolderModal";
import { modals } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import { Menu } from "@mantine/core";

interface FolderTreeProps {
  selectedFolderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
}

export function FolderTree({ selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const { data: folders, isLoading } = useFolders();
  const deleteFolder = useDeleteFolder();
  const [modalOpened, setModalOpened] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const { t } = useTranslation("notes");

  const handleEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setModalOpened(true);
  };

  const handleDelete = (folder: Folder) => {
    modals.openConfirmModal({
      title: t("folderTree.deleteConfirm.title"),
      children: (
        <Text size="sm">
          {t("folderTree.deleteConfirm.message", { name: folder.name })}
          {folder._count && folder._count.notes > 0 && (
            <Text c="red" mt="xs">
              {t("folderTree.deleteConfirm.noteWarning", {
                count: folder._count.notes,
              })}
            </Text>
          )}
        </Text>
      ),
      labels: { confirm: t("actions.delete"), cancel: t("actions.cancel") },
      confirmProps: { color: "red" },
      onConfirm: () => deleteFolder.mutate(folder.id),
    });
  };

  const handleAdd = () => {
    setEditingFolder(null);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingFolder(null);
  };

  const handleSelectFolder = (folderId?: string) => {
    onSelectFolder(folderId);
  };

  const handleKeySelect =
    (folderId?: string) =>
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelectFolder(folderId);
      }
    };

  if (isLoading) {
    return <Text size="sm">{t("folderTree.loading")}</Text>;
  }

  return (
    <>
      <Stack gap="xs">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={600} c="dimmed">
            {t("folderTree.title")}
          </Text>
          <ActionIcon size="sm" variant="subtle" onClick={handleAdd} aria-label={t("folderTree.add")}>
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        <Paper withBorder p="xs" radius="md">
          <Stack gap="xs">
            <UnstyledButton
              component="div"
              role="button"
              tabIndex={0}
              onClick={() => handleSelectFolder(undefined)}
              onKeyDown={handleKeySelect(undefined)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                backgroundColor:
                  selectedFolderId === undefined ? "var(--mantine-color-blue-light)" : "transparent",
              }}
            >
              <Group gap="xs">
                <IconFolder size={16} />
                <Text size="sm">{t("folderTree.all")}</Text>
              </Group>
            </UnstyledButton>

            <Divider />

            {folders?.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              return (
                <UnstyledButton
                  component="div"
                  role="button"
                  tabIndex={0}
                  key={folder.id}
                  onClick={() => handleSelectFolder(folder.id)}
                  onKeyDown={handleKeySelect(folder.id)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    backgroundColor: isSelected
                      ? "var(--mantine-color-blue-light)"
                      : "transparent",
                  }}
                >
                  <Flex align="center" gap="xs">
                    <IconFolder size={16} color={folder.color} />
                    <Text size="sm" style={{ flex: 1 }}>
                      {folder.name}
                    </Text>
                    {folder._count && folder._count.notes > 0 && (
                      <Badge size="sm" variant="light" color="gray">
                        {folder._count.notes}
                      </Badge>
                    )}
                    <Menu position="right-start" withinPortal>
                      <Menu.Target>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={t("folderTree.menu.open")}
                        >
                          <IconDots size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(folder);
                          }}
                        >
                          {t("folderTree.menu.edit")}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(folder);
                          }}
                        >
                          {t("folderTree.menu.delete")}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Flex>
                </UnstyledButton>
              );
            })}

            {!folders || folders.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="sm">
                {t("folderTree.empty")}
              </Text>
            ) : null}
          </Stack>
        </Paper>
      </Stack>

      <FolderModal opened={modalOpened} onClose={handleCloseModal} folder={editingFolder} />
    </>
  );
}
