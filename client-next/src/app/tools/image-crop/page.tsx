"use client";

import { Container, Stack, Title, Text, Card } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ImageCropWidget } from "@/components/widgets/ImageCropWidget";

const ImageCropPage = () => {
  const { t } = useTranslation("widgets");

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <div>
          <Title order={2}>{t("imageCrop.title")}</Title>
          <Text c="dimmed">{t("imageCrop.subtitle")}</Text>
        </div>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <ImageCropWidget />
        </Card>
      </Stack>
    </Container>
  );
};

export default ImageCropPage;
