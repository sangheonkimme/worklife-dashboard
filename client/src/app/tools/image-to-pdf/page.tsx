"use client";

import { Container, Stack, Title, Text, Card } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ImageToPdfWidget } from "@/components/widgets/ImageToPdfWidget";

const ImageToPdfPage = () => {
  const { t } = useTranslation("widgets");

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <div>
          <Title order={2}>{t("imageToPdf.title")}</Title>
          <Text c="dimmed">{t("imageToPdf.subtitle")}</Text>
        </div>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <ImageToPdfWidget />
        </Card>
      </Stack>
    </Container>
  );
};

export default ImageToPdfPage;
