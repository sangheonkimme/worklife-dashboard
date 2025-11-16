import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
  rem,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  IconClipboard,
  IconDownload,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import type { WidgetProps } from "@/types/widget";
import type { CropHistoryItem } from "@/types/imageCrop";
import {
  copyBlobToClipboard,
  downloadBlob,
  getCroppedImage,
  getImageDimensions,
} from "@/utils/imageCrop";
import { useImageCropStore } from "@/store/useImageCropStore";

type ImageSource = {
  src: string;
  width: number;
  height: number;
  name: string;
};

type FreeformCropSizePx = {
  width: number;
  height: number;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ZOOM_BOUNDS = { min: 1, max: 3 };
const FREEFORM_MIN_SIZE_PX = 80;
const FREEFORM_MIN_SIZE_RATIO = 0.2;

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getFreeformMinDimensionPx = (dimension: number) => {
  if (dimension <= 0) {
    return 0;
  }

  return Math.min(
    dimension,
    Math.max(FREEFORM_MIN_SIZE_PX, dimension * FREEFORM_MIN_SIZE_RATIO)
  );
};

const formatLabels: Record<string, { label: string; extension: string }> = {
  png: { label: "PNG", extension: "png" },
  jpeg: { label: "JPEG", extension: "jpg" },
  webp: { label: "WebP", extension: "webp" },
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read file."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function ImageCropWidget({ showHeader = true }: WidgetProps) {
  const { t } = useTranslation("widgets");
  const [source, setSource] = useState<ImageSource | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    ref: cropContainerRef,
    width: cropContainerWidth,
    height: cropContainerHeight,
  } = useElementSize();
  const [freeformCropSizePx, setFreeformCropSizePx] =
    useState<FreeformCropSizePx | null>(null);
  const hasCropBounds = cropContainerWidth > 0 && cropContainerHeight > 0;

  const settings = useImageCropStore((state) => state.settings);
  const setSettings = useImageCropStore((state) => state.setSettings);
  const setAspectPreset = useImageCropStore((state) => state.setAspectPreset);
  const history = useImageCropStore((state) => state.history);
  const addHistory = useImageCropStore((state) => state.addHistory);
  const removeHistory = useImageCropStore((state) => state.removeHistory);
  const clearHistory = useImageCropStore((state) => state.clearHistory);

  const aspectRatio = useMemo(() => {
    switch (settings.aspectPresetId) {
      case "1:1":
        return 1;
      case "4:3":
        return 4 / 3;
      case "16:9":
        return 16 / 9;
      case "9:16":
        return 9 / 16;
      case "4:5":
        return 4 / 5;
      case "custom": {
        const { customAspect } = settings;
        if (customAspect && customAspect.width > 0 && customAspect.height > 0) {
          return customAspect.width / customAspect.height;
        }
        return undefined;
      }
      default:
        return undefined;
    }
  }, [settings]);

  const defaultFreeformCropSizePx = useMemo<FreeformCropSizePx | null>(() => {
    if (!source) {
      return null;
    }

    const minWidth = getFreeformMinDimensionPx(source.width);
    const minHeight = getFreeformMinDimensionPx(source.height);

    return {
      width: clampNumber(source.width * 0.8, minWidth, source.width),
      height: clampNumber(source.height * 0.8, minHeight, source.height),
    };
  }, [source]);

  const effectiveFreeformCropSizePx =
    useMemo<FreeformCropSizePx | null>(() => {
      if (
        settings.aspectPresetId !== "free" ||
        !source ||
        !defaultFreeformCropSizePx
      ) {
        return null;
      }

      const minWidth = getFreeformMinDimensionPx(source.width);
      const minHeight = getFreeformMinDimensionPx(source.height);

      return {
        width: clampNumber(
          freeformCropSizePx?.width ?? defaultFreeformCropSizePx.width,
          minWidth,
          source.width
        ),
        height: clampNumber(
          freeformCropSizePx?.height ?? defaultFreeformCropSizePx.height,
          minHeight,
          source.height
        ),
      };
    }, [
      defaultFreeformCropSizePx,
      freeformCropSizePx,
      settings.aspectPresetId,
      source,
    ]);

  const freeformWidthBounds = useMemo(() => {
    if (!source) {
      return null;
    }

    return {
      min: getFreeformMinDimensionPx(source.width),
      max: source.width,
    };
  }, [source]);

  const freeformHeightBounds = useMemo(() => {
    if (!source) {
      return null;
    }

    return {
      min: getFreeformMinDimensionPx(source.height),
      max: source.height,
    };
  }, [source]);

  const cropperCropSize = useMemo(() => {
    if (
      settings.aspectPresetId !== "free" ||
      !effectiveFreeformCropSizePx ||
      !source ||
      !hasCropBounds
    ) {
      return undefined;
    }

    const widthRatio = effectiveFreeformCropSizePx.width / source.width;
    const heightRatio = effectiveFreeformCropSizePx.height / source.height;

    return {
      width: clampNumber(
        widthRatio * cropContainerWidth,
        1,
        cropContainerWidth
      ),
      height: clampNumber(
        heightRatio * cropContainerHeight,
        1,
        cropContainerHeight
      ),
    };
  }, [
    cropContainerHeight,
    cropContainerWidth,
    effectiveFreeformCropSizePx,
    hasCropBounds,
    settings.aspectPresetId,
    source,
  ]);

  const handleFileLoad = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        notifications.show({
          title: t("imageCrop.notifications.unsupportedTitle"),
          message: t("imageCrop.notifications.unsupportedMessage"),
          color: "red",
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        notifications.show({
          title: t("imageCrop.notifications.sizeTitle"),
          message: t("imageCrop.notifications.sizeMessage"),
          color: "red",
        });
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const { width, height } = await getImageDimensions(dataUrl);
        setSource({
          src: dataUrl,
          width,
          height,
          name: file.name,
        });
        setFreeformCropSizePx(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        notifications.show({
          title: t("imageCrop.notifications.loadedTitle"),
          message: t("imageCrop.notifications.loadedMessage", {
            width,
            height,
          }),
          color: "green",
        });
      } catch (error) {
        console.error("Image load failed", error);
        notifications.show({
          title: t("imageCrop.notifications.loadFailedTitle"),
          message: t("imageCrop.notifications.loadFailedMessage"),
          color: "red",
        });
      }
    },
    [t]
  );

  const handleDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      await handleFileLoad(files[0]);
    },
    [handleFileLoad]
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (event.clipboardData) {
        const files = Array.from(event.clipboardData.files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (files.length) {
          event.preventDefault();
          handleFileLoad(files[0]);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFileLoad]);

  useEffect(() => {
    if (!source || !defaultFreeformCropSizePx) {
      return;
    }

    setFreeformCropSizePx((prev) => {
      if (!prev) {
        return defaultFreeformCropSizePx;
      }

      const minWidth = getFreeformMinDimensionPx(source.width);
      const minHeight = getFreeformMinDimensionPx(source.height);

      return {
        width: clampNumber(prev.width, minWidth, source.width),
        height: clampNumber(prev.height, minHeight, source.height),
      };
    });
  }, [defaultFreeformCropSizePx, source]);

  const handleExport = useCallback(
    async (mode: "download" | "clipboard") => {
      if (!source || !croppedAreaPixels) {
        notifications.show({
          title: t("imageCrop.notifications.noImageTitle"),
          message: t("imageCrop.notifications.noImageMessage"),
          color: "yellow",
        });
        return;
      }

      setIsProcessing(true);
      try {
        const cropResult = await getCroppedImage(
          source.src,
          croppedAreaPixels,
          settings.format,
          settings.quality,
          settings.transparentBackground
        );

        const timestamp = new Date().toISOString().split("T")[0];
        const metadata = formatLabels[settings.format];
        const baseName = source.name?.replace(/\.[^/.]+$/, "") || "crop";
        const fileName = `${baseName}-${timestamp}.${metadata.extension}`;

        if (mode === "download") {
          downloadBlob(cropResult.blob, fileName);
          notifications.show({
            title: t("imageCrop.notifications.exportSuccessTitle"),
            message: t("imageCrop.notifications.exportSuccessMessage"),
            color: "green",
          });
        } else if (mode === "clipboard") {
          await copyBlobToClipboard(cropResult.blob);
          notifications.show({
            title: t("imageCrop.notifications.copiedTitle"),
            message: t("imageCrop.notifications.copiedMessage"),
            color: "green",
          });
        }

        const historyItem: CropHistoryItem = {
          id: crypto.randomUUID?.() ?? `${Date.now()}`,
          createdAt: Date.now(),
          dataUrl: cropResult.dataUrl,
          width: cropResult.width,
          height: cropResult.height,
          format: settings.format,
          fileName,
        };
        addHistory(historyItem);
      } catch (error) {
        console.error("Crop export failed", error);
        notifications.show({
          title: t("imageCrop.notifications.exportFailedTitle"),
          message: t("imageCrop.notifications.exportFailedMessage"),
          color: "red",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [
      addHistory,
      croppedAreaPixels,
      settings.format,
      settings.quality,
      settings.transparentBackground,
      source,
      t,
    ]
  );

  const handleFreeformWidthChange = useCallback(
    (value: number) => {
      if (
        settings.aspectPresetId !== "free" ||
        !source ||
        !defaultFreeformCropSizePx
      ) {
        return;
      }

      const minWidth = getFreeformMinDimensionPx(source.width);
      const minHeight = getFreeformMinDimensionPx(source.height);
      const fallback = defaultFreeformCropSizePx.width;
      const nextWidth = clampNumber(
        Number.isFinite(value) ? value : fallback,
        minWidth,
        source.width
      );

      setFreeformCropSizePx((prev) => ({
        width: nextWidth,
        height: clampNumber(
          prev?.height ?? defaultFreeformCropSizePx.height,
          minHeight,
          source.height
        ),
      }));
    },
    [defaultFreeformCropSizePx, settings.aspectPresetId, source]
  );

  const handleFreeformHeightChange = useCallback(
    (value: number) => {
      if (
        settings.aspectPresetId !== "free" ||
        !source ||
        !defaultFreeformCropSizePx
      ) {
        return;
      }

      const minWidth = getFreeformMinDimensionPx(source.width);
      const minHeight = getFreeformMinDimensionPx(source.height);
      const fallback = defaultFreeformCropSizePx.height;
      const nextHeight = clampNumber(
        Number.isFinite(value) ? value : fallback,
        minHeight,
        source.height
      );

      setFreeformCropSizePx((prev) => ({
        width: clampNumber(
          prev?.width ?? defaultFreeformCropSizePx.width,
          minWidth,
          source.width
        ),
        height: nextHeight,
      }));
    },
    [defaultFreeformCropSizePx, settings.aspectPresetId, source]
  );

  const handleFreeformWidthInput = useCallback(
    (value: string | number) => {
      const nextValue =
        typeof value === "number" ? value : Number(value.replace(/,/g, ""));
      if (Number.isNaN(nextValue)) {
        return;
      }
      handleFreeformWidthChange(nextValue);
    },
    [handleFreeformWidthChange]
  );

  const handleFreeformHeightInput = useCallback(
    (value: string | number) => {
      const nextValue =
        typeof value === "number" ? value : Number(value.replace(/,/g, ""));
      if (Number.isNaN(nextValue)) {
        return;
      }
      handleFreeformHeightChange(nextValue);
    },
    [handleFreeformHeightChange]
  );

  const renderHeader = () => (
    <Group justify="space-between">
      <Group gap="xs">
        <ThemeIcon variant="light" color="cyan">
          <IconPhoto size={18} />
        </ThemeIcon>
        <div>
          <Text fw={600}>{t("imageCrop.title")}</Text>
          <Text size="sm" c="dimmed">
            {t("imageCrop.subtitle")}
          </Text>
        </div>
      </Group>
      {source && (
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => {
            setSource(null);
            setFreeformCropSizePx(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
          }}
          aria-label={t("imageCrop.actions.clearImage")}
        >
          <IconTrash size={18} />
        </ActionIcon>
      )}
    </Group>
  );

  const aspectOptions = useMemo(
    () => [
      { label: t("imageCrop.aspect.free"), value: "free" },
      { label: "1:1", value: "1:1" },
      { label: "4:3", value: "4:3" },
      { label: "16:9", value: "16:9" },
      { label: "9:16", value: "9:16" },
      { label: "4:5", value: "4:5" },
      { label: t("imageCrop.aspect.custom"), value: "custom" },
    ],
    [t]
  );

  return (
    <Stack gap="md">
      {showHeader && renderHeader()}

      {source ? (
        <>
          <Card withBorder padding="sm">
            <Box
              pos="relative"
              ref={cropContainerRef}
              style={{
                width: "100%",
                height: 360,
              }}
            >
              <Cropper
                image={source.src}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                cropSize={cropperCropSize}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                showGrid
                restrictPosition
              />
            </Box>
            <Group justify="space-between" mt="sm">
              <Badge>
                {source.width} × {source.height}px
              </Badge>
              <Text size="sm" c="dimmed">
                {source.name}
              </Text>
            </Group>
          </Card>

          <Card withBorder padding="md">
            <Stack gap="sm">
              <Text fw={600} size="sm">
                {t("imageCrop.sections.aspect")}
              </Text>
              <SegmentedControl
                value={settings.aspectPresetId}
                onChange={(value) =>
                  setAspectPreset(value as typeof settings.aspectPresetId)
                }
                data={aspectOptions}
                fullWidth
              />
              {settings.aspectPresetId === "free" &&
                effectiveFreeformCropSizePx && (
                  <Stack gap="xs">
                    <Group justify="space-between" gap={4}>
                      <Text fw={600} size="sm">
                        {t("imageCrop.sections.freeformArea")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {Math.round(effectiveFreeformCropSizePx.width)} ×
                        {" "}
                        {Math.round(effectiveFreeformCropSizePx.height)}px
                      </Text>
                    </Group>
                    <Stack gap={6}>
                      <Group justify="space-between" align="flex-end">
                        <Text size="sm" c="dimmed">
                          {t("imageCrop.fields.cropWidth")}
                        </Text>
                        <NumberInput
                          value={
                            effectiveFreeformCropSizePx
                              ? Math.round(effectiveFreeformCropSizePx.width)
                              : undefined
                          }
                          onChange={handleFreeformWidthInput}
                          min={freeformWidthBounds?.min}
                          max={freeformWidthBounds?.max}
                          step={1}
                          hideControls
                          maw={120}
                          disabled={!source}
                        />
                      </Group>
                      <Slider
                        min={freeformWidthBounds?.min ?? 0}
                        max={freeformWidthBounds?.max ?? 0}
                        value={effectiveFreeformCropSizePx.width}
                        onChange={handleFreeformWidthChange}
                        step={1}
                        disabled={!source}
                      />
                    </Stack>
                    <Stack gap={6}>
                      <Group justify="space-between" align="flex-end">
                        <Text size="sm" c="dimmed">
                          {t("imageCrop.fields.cropHeight")}
                        </Text>
                        <NumberInput
                          value={
                            effectiveFreeformCropSizePx
                              ? Math.round(effectiveFreeformCropSizePx.height)
                              : undefined
                          }
                          onChange={handleFreeformHeightInput}
                          min={freeformHeightBounds?.min}
                          max={freeformHeightBounds?.max}
                          step={1}
                          hideControls
                          maw={120}
                          disabled={!source}
                        />
                      </Group>
                      <Slider
                        min={freeformHeightBounds?.min ?? 0}
                        max={freeformHeightBounds?.max ?? 0}
                        value={effectiveFreeformCropSizePx.height}
                        onChange={handleFreeformHeightChange}
                        step={1}
                        disabled={!source}
                      />
                    </Stack>
                  </Stack>
                )}
              {settings.aspectPresetId === "custom" && (
                <Group gap="sm">
                  <NumberInput
                    label={t("imageCrop.fields.aspectWidth")}
                    min={1}
                    value={settings.customAspect?.width ?? 1}
                    onChange={(value) =>
                      setAspectPreset("custom", {
                        width: Number(value) || 1,
                        height: settings.customAspect?.height ?? 1,
                      })
                    }
                  />
                  <NumberInput
                    label={t("imageCrop.fields.aspectHeight")}
                    min={1}
                    value={settings.customAspect?.height ?? 1}
                    onChange={(value) =>
                      setAspectPreset("custom", {
                        width: settings.customAspect?.width ?? 1,
                        height: Number(value) || 1,
                      })
                    }
                  />
                </Group>
              )}

              <Divider my="sm" />

              <Stack gap={4}>
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {t("imageCrop.sections.zoom")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {zoom.toFixed(2)}×
                  </Text>
                </Group>
                <Slider
                  min={ZOOM_BOUNDS.min}
                  max={ZOOM_BOUNDS.max}
                  value={zoom}
                  onChange={setZoom}
                  step={0.05}
                />
              </Stack>

              <Stack gap={6}>
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {t("imageCrop.sections.format")}
                  </Text>
                  <Badge>{formatLabels[settings.format].label}</Badge>
                </Group>
                <SegmentedControl
                  value={settings.format}
                  onChange={(value) =>
                    setSettings({ format: value as typeof settings.format })
                  }
                  data={[
                    { value: "png", label: "PNG" },
                    { value: "jpeg", label: "JPEG" },
                    { value: "webp", label: "WebP" },
                  ]}
                />
              </Stack>

              <Stack gap={4}>
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {t("imageCrop.sections.quality")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {(settings.quality * 100).toFixed(0)}%
                  </Text>
                </Group>
                <Slider
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={settings.quality}
                  onChange={(value) => setSettings({ quality: value })}
                  disabled={settings.format === "png"}
                />
              </Stack>

              <Switch
                label={t("imageCrop.sections.transparent")}
                checked={settings.transparentBackground}
                onChange={(event) =>
                  setSettings({
                    transparentBackground: event.currentTarget.checked,
                  })
                }
                disabled={settings.format === "jpeg"}
                description={
                  settings.format === "jpeg"
                    ? t("imageCrop.sections.transparentHint")
                    : undefined
                }
              />
            </Stack>
          </Card>

          <Group w="100%" grow>
            <Button
              leftSection={<IconDownload size={18} />}
              onClick={() => handleExport("download")}
              disabled={isProcessing}
            >
              {t("imageCrop.actions.download")}
            </Button>
            <Button
              leftSection={<IconClipboard size={18} />}
              variant="light"
              onClick={() => handleExport("clipboard")}
              disabled={isProcessing}
            >
              {t("imageCrop.actions.copy")}
            </Button>
          </Group>
        </>
      ) : (
        <Paper
          withBorder={false}
          radius="md"
          p={0}
          style={{ background: "transparent" }}
        >
          <Dropzone
            onDrop={handleDrop}
            onReject={() =>
              notifications.show({
                title: t("imageCrop.notifications.unsupportedTitle"),
                message: t("imageCrop.notifications.unsupportedMessage"),
                color: "red",
              })
            }
            accept={IMAGE_MIME_TYPE}
            multiple={false}
            disabled={isProcessing}
            maxSize={MAX_FILE_SIZE}
            styles={{
              root: {
                border: "1px dashed var(--mantine-color-gray-4)",
                background: "var(--mantine-color-gray-0)",
                cursor: isProcessing ? "not-allowed" : "pointer",
              },
              inner: {
                padding: "var(--mantine-spacing-md)",
              },
            }}
          >
            <Stack
              align="center"
              gap="sm"
              mih={260}
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
              <Stack gap={4} align="center">
                <Text size="xl" fw={600}>
                  {t("imageCrop.empty.title")}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  {t("imageCrop.empty.description")}
                </Text>
              </Stack>
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
        </Paper>
      )}

      <Divider />

      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>{t("imageCrop.history.title")}</Text>
          {history.length > 0 && (
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={clearHistory}
              aria-label={t("imageCrop.history.clear")}
            >
              <IconTrash size={18} />
            </ActionIcon>
          )}
        </Group>
        {history.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t("imageCrop.history.empty")}
          </Text>
        ) : (
          <Stack gap="sm">
            {history.map((item) => (
              <Group
                key={item.id}
                wrap="nowrap"
                align="flex-start"
                style={{
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-md)",
                  padding: "var(--mantine-spacing-sm)",
                }}
              >
                <Box
                  component="img"
                  src={item.dataUrl}
                  alt={item.fileName}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: "var(--mantine-radius-sm)",
                  }}
                />
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {item.fileName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.width} × {item.height}px · {item.format.toUpperCase()}
                  </Text>
                </Stack>
                <Group gap="xs">
                  <Tooltip label={t("imageCrop.history.download")}>
                    <ActionIcon
                      variant="subtle"
                      onClick={async () => {
                        const response = await fetch(item.dataUrl);
                        const blob = await response.blob();
                        downloadBlob(blob, item.fileName);
                      }}
                    >
                      <IconDownload size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t("imageCrop.history.copy")}>
                    <ActionIcon
                      variant="subtle"
                      onClick={async () => {
                        try {
                          const res = await fetch(item.dataUrl);
                          const blob = await res.blob();
                          await copyBlobToClipboard(blob);
                          notifications.show({
                            title: t("imageCrop.notifications.copiedTitle"),
                            message: t("imageCrop.notifications.copiedMessage"),
                            color: "green",
                          });
                        } catch (error) {
                          console.error("Copy failed", error);
                        }
                      }}
                    >
                      <IconClipboard size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t("imageCrop.history.remove")}>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeHistory(item.id)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
