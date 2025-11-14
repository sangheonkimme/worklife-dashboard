import { Group, Text, rem } from "@mantine/core";
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
    >
      <Group
        justify="center"
        gap="xl"
        mih={220}
        style={{ pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            {t("imageToPdf.upload.headline")}
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            {t("imageToPdf.upload.subtitle")}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
};
