import { SimpleGrid, Text, Stack, Button, Group } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { ImageFile } from "@/types/widget";
import { ImagePreviewItem } from "./ImagePreviewItem";

interface ImagePreviewListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const ImagePreviewList = ({
  images,
  onRemove,
  onClearAll,
}: ImagePreviewListProps) => {
  const { t } = useTranslation("widgets");
  if (images.length === 0) {
    return (
      <Stack align="center" justify="center" mih={200} gap="md">
        <Text size="sm" c="dimmed">
          {t("imageToPdf.preview.empty")}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          {t("imageToPdf.preview.title", { count: images.length })}
        </Text>
        <Button
          variant="subtle"
          color="red"
          size="xs"
          leftSection={<IconTrash size={14} />}
          onClick={onClearAll}
        >
          {t("imageToPdf.preview.clearAll")}
        </Button>
      </Group>

      <SimpleGrid cols={2} spacing="sm">
        {images.map((image) => (
          <ImagePreviewItem key={image.id} image={image} onRemove={onRemove} />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
