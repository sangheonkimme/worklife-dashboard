"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Stack, Button, Divider, LoadingOverlay, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { IconFileTypePdf, IconDownload } from "@tabler/icons-react";
import type { FileWithPath } from "@mantine/dropzone";
import { ImageUploadZone } from "./ImageUploadZone";
import { ImagePreviewList } from "./ImagePreviewList";
import { PdfOptionsPanel } from "./PdfOptionsPanel";
import { generatePdfFromImages, downloadPdf } from "@/utils/pdfGenerator";
import {
  DEFAULT_PDF_OPTIONS,
  type ImageFile,
  type PdfOptions,
} from "@/types/widget";

export const ImageToPdfWidget = () => {
  const { t } = useTranslation("widgets");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pdfOptions, setPdfOptions] = useState<PdfOptions>(DEFAULT_PDF_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const imagePreviewsRef = useRef<ImageFile[]>([]);

  // 이미지 추가
  const handleDrop = useCallback(
    (files: FileWithPath[]) => {
      const newImages: ImageFile[] = files.map((file, index) => ({
        file,
        id: `${Date.now()}-${index}`,
        preview: URL.createObjectURL(file),
        order: images.length + index,
      }));

      setImages((prev) => [...prev, ...newImages]);

      notifications.show({
        title: t("imageToPdf.notifications.uploadSuccess", {
          count: files.length,
        }),
        message: t("imageToPdf.notifications.uploadSuccess", {
          count: files.length,
        }),
        color: "blue",
      });
    },
    [images.length, t]
  );

  // 이미지 삭제
  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  // 전체 삭제
  const handleClearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    notifications.show({
      title: t("imageToPdf.notifications.clearSuccess"),
      message: t("imageToPdf.notifications.clearSuccess"),
      color: "gray",
    });
  }, [images, t]);

  // PDF 생성
  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      notifications.show({
        title: t("imageToPdf.notifications.emptyErrorTitle"),
        message: t("imageToPdf.notifications.emptyErrorMessage"),
        color: "yellow",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const files = images.map((img) => img.file);
      const result = await generatePdfFromImages(files, pdfOptions);

      if (result.success && result.data && result.fileName) {
        downloadPdf(result.data, result.fileName);
        notifications.show({
          title: t("imageToPdf.notifications.generateSuccessTitle"),
          message: t("imageToPdf.notifications.generateSuccessMessage", {
            fileName: result.fileName,
          }),
          color: "green",
        });
      } else {
        notifications.show({
          title: t("imageToPdf.notifications.generateErrorTitle"),
          message:
            result.error ||
            t("imageToPdf.notifications.generateErrorMessage"),
          color: "red",
        });
      }
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      notifications.show({
        title: t("imageToPdf.notifications.generateErrorTitle"),
        message: t("imageToPdf.notifications.unexpectedErrorMessage"),
        color: "red",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    imagePreviewsRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((img) =>
        URL.revokeObjectURL(img.preview)
      );
    };
  }, []);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isGenerating} />

      <Stack gap="lg">
        <ImageUploadZone onDrop={handleDrop} disabled={isGenerating} />

        {images.length > 0 && (
          <>
            <Divider />
            <ImagePreviewList
              images={images}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
            />
          </>
        )}

        <Divider />

        <PdfOptionsPanel options={pdfOptions} onChange={setPdfOptions} />

        <Button
          leftSection={<IconFileTypePdf size={20} />}
          rightSection={<IconDownload size={20} />}
          onClick={handleGeneratePdf}
          disabled={images.length === 0 || isGenerating}
          fullWidth
          size="md"
        >
          {t("imageToPdf.button")}
        </Button>
      </Stack>
    </Box>
  );
};
