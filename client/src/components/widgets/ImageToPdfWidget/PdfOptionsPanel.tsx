import { Stack, Select, SegmentedControl, Text } from "@mantine/core";
import type { PdfOptions } from "@/types/widget";

interface PdfOptionsPanelProps {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
}

export const PdfOptionsPanel = ({
  options,
  onChange,
}: PdfOptionsPanelProps) => {
  // 안전한 기본값 처리
  const safeOptions = {
    pageSize: options?.pageSize || "A4",
    orientation: options?.orientation || "portrait",
    imageFit: options?.imageFit || "fit",
    margin: options?.margin || 20,
  } as PdfOptions;

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        PDF 설정
      </Text>

      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          페이지 크기
        </Text>
        <Select
          value={safeOptions.pageSize}
          onChange={(value) =>
            onChange({ ...safeOptions, pageSize: value as PdfOptions["pageSize"] })
          }
          data={[
            { value: "A4", label: "A4" },
            { value: "Letter", label: "Letter" },
          ]}
          size="sm"
        />
      </Stack>

      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          페이지 방향
        </Text>
        <SegmentedControl
          value={safeOptions.orientation}
          onChange={(value) =>
            onChange({
              ...safeOptions,
              orientation: value as PdfOptions["orientation"],
            })
          }
          data={[
            { value: "portrait", label: "세로" },
            { value: "landscape", label: "가로" },
          ]}
          fullWidth
          size="sm"
        />
      </Stack>

      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          이미지 맞춤
        </Text>
        <SegmentedControl
          value={safeOptions.imageFit}
          onChange={(value) =>
            onChange({ ...safeOptions, imageFit: value as PdfOptions["imageFit"] })
          }
          data={[
            { value: "fit", label: "맞춤" },
            { value: "fill", label: "채우기" },
            { value: "original", label: "원본" },
          ]}
          fullWidth
          size="sm"
        />
        <Text size="xs" c="dimmed">
          {safeOptions.imageFit === "fit" && "비율 유지하며 페이지에 맞춤"}
          {safeOptions.imageFit === "fill" && "페이지를 채우도록 크기 조정"}
          {safeOptions.imageFit === "original" && "원본 크기 유지"}
        </Text>
      </Stack>
    </Stack>
  );
};
