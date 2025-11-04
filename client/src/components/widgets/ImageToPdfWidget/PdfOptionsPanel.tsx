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
          value={options.pageSize}
          onChange={(value) =>
            onChange({ ...options, pageSize: value as PdfOptions["pageSize"] })
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
          value={options.orientation}
          onChange={(value) =>
            onChange({
              ...options,
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
          value={options.imageFit}
          onChange={(value) =>
            onChange({ ...options, imageFit: value as PdfOptions["imageFit"] })
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
          {options.imageFit === "fit" && "비율 유지하며 페이지에 맞춤"}
          {options.imageFit === "fill" && "페이지를 채우도록 크기 조정"}
          {options.imageFit === "original" && "원본 크기 유지"}
        </Text>
      </Stack>
    </Stack>
  );
};
