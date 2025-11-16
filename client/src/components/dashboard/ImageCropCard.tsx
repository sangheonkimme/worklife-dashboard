import { Card, Stack, Group, Text, ThemeIcon } from "@mantine/core";
import { IconCrop } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ImageCropWidget } from "@/components/widgets/ImageCropWidget";

export function ImageCropCard() {
  const { t } = useTranslation("widgets");

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      styles={{
        root: {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          },
        },
      }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <ThemeIcon size="lg" variant="light" color="cyan">
            <IconCrop size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="lg">
              {t("imageCrop.title")}
            </Text>
            <Text size="sm" c="dimmed">
              {t("imageCrop.subtitle")}
            </Text>
          </div>
        </Group>

        <ImageCropWidget showHeader={false} />
      </Stack>
    </Card>
  );
}
