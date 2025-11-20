import type { Area } from "react-easy-crop";
import type { CropFormat } from "@/types/imageCrop";

const FORMAT_TO_MIME: Record<CropFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const QUALITY_CAP = {
  min: 0.5,
  max: 1,
};

export interface CropResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to data URL."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export async function getCroppedImage(
  imageSrc: string,
  croppedArea: Area,
  format: CropFormat,
  quality: number,
  transparentBackground: boolean
): Promise<CropResult> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("widgets:imageCrop.errors.canvas");
  }

  canvas.width = Math.max(1, Math.round(croppedArea.width));
  canvas.height = Math.max(1, Math.round(croppedArea.height));

  if (!transparentBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    image,
    croppedArea.x,
    croppedArea.y,
    croppedArea.width,
    croppedArea.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const mimeType = FORMAT_TO_MIME[format];
  const effectiveQuality =
    format === "png"
      ? undefined
      : Math.min(
          QUALITY_CAP.max,
          Math.max(QUALITY_CAP.min, quality)
        );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("widgets:imageCrop.errors.blob"));
      },
      mimeType,
      effectiveQuality
    );
  });

  const dataUrl = await blobToDataUrl(blob);

  return {
    blob,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const copyBlobToClipboard = async (blob: Blob) => {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof window === "undefined"
  ) {
    throw new Error("Clipboard API unavailable.");
  }

  // Some browsers do not support ClipboardItem typings yet.
  const item = new window.ClipboardItem({
    [blob.type]: blob,
  });

  await navigator.clipboard.write([item]);
};

export const getImageDimensions = async (imageSrc: string) => {
  const image = await loadImage(imageSrc);
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
};
