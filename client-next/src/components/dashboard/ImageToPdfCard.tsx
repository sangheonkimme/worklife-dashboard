"use client";

import { Card, Stack, Group, Text, ThemeIcon } from "@mantine/core";
import { IconFileTypePdf, IconArrowRight } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export function ImageToPdfCard() {
  const { t } = useTranslation("widgets");
  const router = useRouter();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
      onClick={() => router.push("/tools/image-to-pdf")}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
      }}
    >
      <Stack gap="md">
        <Group gap="xs" justify="space-between" align="flex-start">
          <Group gap="xs">
            <ThemeIcon size="lg" variant="light" color="orange">
              <IconFileTypePdf size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">
                {t("imageToPdf.title")}
              </Text>
              <Text size="sm" c="dimmed">
                {t("imageToPdf.subtitle", "여러 이미지를 깔끔하게 PDF로 합치세요.")}
              </Text>
            </div>
          </Group>
          <IconArrowRight size={18} color="var(--mantine-color-gray-6)" />
        </Group>
        <Text size="sm" c="dimmed">
          {t("imageToPdf.cta", "원본 품질을 유지한 PDF 변환을 전체 화면에서 이용하세요.")}
        </Text>
      </Stack>
    </Card>
  );
}
