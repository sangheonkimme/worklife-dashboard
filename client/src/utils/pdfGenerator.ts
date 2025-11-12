import { PDFDocument } from "pdf-lib";
import i18n from "@/lib/i18n";
import {
  type PdfOptions,
  type PdfGenerationResult,
  PAGE_SIZES,
} from "@/types/widget";

/**
 * 이미지 파일들을 PDF로 변환합니다.
 */
export async function generatePdfFromImages(
  images: File[],
  options: PdfOptions
): Promise<PdfGenerationResult> {
  try {
    if (images.length === 0) {
      return {
        success: false,
        error: i18n.t("widgets:imageToPdf.errors.noImages"),
      };
    }

    // PDF 문서 생성
    const pdfDoc = await PDFDocument.create();

    // 페이지 크기 계산
    const pageSize = getPageSize(options);
    const margin = options.margin || 0;

    // 각 이미지를 페이지로 추가
    for (const imageFile of images) {
      const imageBytes = await imageFile.arrayBuffer();

      // 이미지 타입에 따라 임베드
      let image;
      const mimeType = imageFile.type.toLowerCase();

      try {
        if (mimeType === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          // WEBP 등 다른 포맷은 Canvas를 통해 JPEG로 변환
          image = await embedImageViaCanvas(pdfDoc, imageFile);
        }
      } catch (error) {
        console.error(`Failed to embed image: ${imageFile.name}`, error);
        continue; // 실패한 이미지는 건너뜀
      }

      // 페이지 추가
      const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

      // 이미지 크기 및 위치 계산
      const { x, y, width, height } = calculateImageDimensions(
        image.width,
        image.height,
        pageSize.width,
        pageSize.height,
        margin,
        options.imageFit
      );

      // 이미지 그리기
      page.drawImage(image, { x, y, width, height });
    }

    // PDF 저장
    const pdfBytes = await pdfDoc.save();

    return {
      success: true,
      data: pdfBytes,
      fileName: generateFileName(),
    };
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : i18n.t("widgets:imageToPdf.errors.generic"),
    };
  }
}

/**
 * Canvas를 사용하여 이미지를 JPEG로 변환한 후 PDF에 임베드
 */
async function embedImageViaCanvas(
  pdfDoc: PDFDocument,
  imageFile: File
): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        // Canvas 생성
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Unable to access canvas context."));
          return;
        }

        // 이미지 그리기
        ctx.drawImage(img, 0, 0);

        // JPEG로 변환
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Failed to convert image"));
              return;
            }

            const arrayBuffer = await blob.arrayBuffer();
            const image = await pdfDoc.embedJpg(arrayBuffer);
            resolve(image);
          },
          "image/jpeg",
          0.95
        );
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * 페이지 크기 가져오기
 */
function getPageSize(options: PdfOptions): { width: number; height: number } {
  let size;

  if (options.pageSize === "Custom") {
    size = {
      width: options.customWidth || PAGE_SIZES.A4.width,
      height: options.customHeight || PAGE_SIZES.A4.height,
    };
  } else {
    size = PAGE_SIZES[options.pageSize];
  }

  // 가로 방향인 경우 width와 height 교환
  if (options.orientation === "landscape") {
    return { width: size.height, height: size.width };
  }

  return size;
}

/**
 * 이미지 크기 및 위치 계산
 */
function calculateImageDimensions(
  imgWidth: number,
  imgHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  fitMode: "fit" | "fill" | "original"
): { x: number; y: number; width: number; height: number } {
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  let width = imgWidth;
  let height = imgHeight;

  switch (fitMode) {
    case "fit": {
      // 비율을 유지하며 페이지에 맞춤
      const widthRatio = availableWidth / imgWidth;
      const heightRatio = availableHeight / imgHeight;
      const ratio = Math.min(widthRatio, heightRatio);

      width = imgWidth * ratio;
      height = imgHeight * ratio;
      break;
    }
    case "fill": {
      // 페이지를 채우도록 크기 조정 (비율 유지, 잘릴 수 있음)
      const widthRatio = availableWidth / imgWidth;
      const heightRatio = availableHeight / imgHeight;
      const ratio = Math.max(widthRatio, heightRatio);

      width = imgWidth * ratio;
      height = imgHeight * ratio;
      break;
    }
    case "original": {
      // 원본 크기 유지 (페이지보다 클 수 있음)
      width = imgWidth;
      height = imgHeight;
      break;
    }
  }

  // 중앙 정렬
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;

  return { x, y, width, height };
}

/**
 * PDF 파일명 생성
 */
function generateFileName(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "-");

  return `images-to-pdf-${timestamp}.pdf`;
}

/**
 * PDF 다운로드
 */
export function downloadPdf(pdfBytes: Uint8Array, fileName: string): void {
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
