"use client";

import { Stack, Text, rem } from "@mantine/core";
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface ImageUploadZoneProps {
  onDrop: (files: FileWithPath[]) => void;
  disabled?: boolean;
}

export const ImageUploadZone = ({ onDrop, disabled }: ImageUploadZoneProps) => {
  const { t } = useTranslation("widgets");
  return (
    <Dropzone
      onDrop={onDrop}
      onReject={(files) => console.log("rejected files", files)}
      maxSize={10 * 1024 ** 2} // 10MB
      accept={IMAGE_MIME_TYPE}
      disabled={disabled}
      radius="md"
      p="sm"
      style={{
        border: "1px dashed var(--mantine-color-gray-4)",
        backgroundColor: "var(--mantine-color-gray-0)",
        transition: "border-color 150ms ease, background-color 150ms ease",
        cursor: "pointer",
      }}
    >
      <Stack
        align="center"
        gap="sm"
        mih={220}
        justify="center"
        style={{ pointerEvents: "none", textAlign: "center" }}
      >
        <div>
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(48),
                height: rem(48),
                color: "var(--mantine-color-blue-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(48),
                height: rem(48),
                color: "var(--mantine-color-red-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              style={{
                width: rem(48),
                height: rem(48),
                color: "var(--mantine-color-dimmed)",
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>
        </div>

        <div>
          <Text size="xl" fw={600}>
            {t("imageToPdf.upload.headline")}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {t("imageToPdf.upload.subtitle")}
          </Text>
        </div>

        <Text
          size="xs"
          fw={600}
          c="var(--mantine-color-blue-6)"
          tt="uppercase"
          style={{ letterSpacing: 0.6 }}
        >
          {t("imageToPdf.upload.dropHint")}
        </Text>
      </Stack>
    </Dropzone>
  );
};
