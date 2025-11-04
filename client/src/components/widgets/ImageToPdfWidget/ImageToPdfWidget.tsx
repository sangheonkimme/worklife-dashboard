import { useState, useCallback, useEffect } from "react";
import { Stack, Button, Divider, LoadingOverlay, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
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
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pdfOptions, setPdfOptions] = useState<PdfOptions>(DEFAULT_PDF_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);

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
        title: "이미지 업로드 완료",
        message: `${files.length}개의 이미지가 추가되었습니다.`,
        color: "blue",
      });
    },
    [images.length]
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
      title: "전체 삭제 완료",
      message: "모든 이미지가 삭제되었습니다.",
      color: "gray",
    });
  }, [images]);

  // PDF 생성
  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      notifications.show({
        title: "이미지 없음",
        message: "변환할 이미지를 먼저 업로드해주세요.",
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
          title: "PDF 생성 완료",
          message: `${result.fileName} 파일이 다운로드되었습니다.`,
          color: "green",
        });
      } else {
        notifications.show({
          title: "PDF 생성 실패",
          message: result.error || "알 수 없는 오류가 발생했습니다.",
          color: "red",
        });
      }
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      notifications.show({
        title: "PDF 생성 실패",
        message: "예상치 못한 오류가 발생했습니다.",
        color: "red",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
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
          PDF 생성 및 다운로드
        </Button>
      </Stack>
    </Box>
  );
};
