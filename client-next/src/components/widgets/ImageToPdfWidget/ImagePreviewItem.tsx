import { Card, Image, Text, ActionIcon, Group, Stack } from "@mantine/core";
import { IconX, IconGripVertical } from "@tabler/icons-react";
import type { ImageFile } from "@/types/widget";

interface ImagePreviewItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
}

export const ImagePreviewItem = ({
  image,
  onRemove,
}: ImagePreviewItemProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card shadow="xs" padding="xs" radius="sm" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            style={{ cursor: "grab" }}
          >
            <IconGripVertical size={14} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => onRemove(image.id)}
          >
            <IconX size={14} />
          </ActionIcon>
        </Group>

        <Image
          src={image.preview}
          alt={image.file.name}
          h={80}
          fit="contain"
          radius="sm"
        />

        <div>
          <Text size="xs" truncate title={image.file.name}>
            {image.file.name}
          </Text>
          <Text size="xs" c="dimmed">
            {formatFileSize(image.file.size)}
          </Text>
        </div>
      </Stack>
    </Card>
  );
};
