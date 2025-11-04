import { SimpleGrid, Text, Stack, Button, Group } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
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
  if (images.length === 0) {
    return (
      <Stack align="center" justify="center" mih={200} gap="md">
        <Text size="sm" c="dimmed">
          업로드된 이미지가 없습니다
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          업로드된 이미지 ({images.length}개)
        </Text>
        <Button
          variant="subtle"
          color="red"
          size="xs"
          leftSection={<IconTrash size={14} />}
          onClick={onClearAll}
        >
          전체 삭제
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
