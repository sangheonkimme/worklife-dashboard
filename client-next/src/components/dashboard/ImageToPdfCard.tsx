"use client";

import { Card, Stack, Group, Text, ThemeIcon } from "@mantine/core";
import { IconFileTypePdf } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ImageToPdfWidget } from "@/components/widgets/ImageToPdfWidget";

export function ImageToPdfCard() {
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
          <ThemeIcon size="lg" variant="light" color="orange">
            <IconFileTypePdf size={20} />
          </ThemeIcon>
          <Text fw={600} size="lg">
            {t("imageToPdf.title")}
          </Text>
        </Group>

        <ImageToPdfWidget />
      </Stack>
    </Card>
  );
}
