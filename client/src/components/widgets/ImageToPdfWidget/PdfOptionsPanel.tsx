import { Stack, Select, SegmentedControl, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { PdfOptions } from "@/types/widget";

interface PdfOptionsPanelProps {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
}

export const PdfOptionsPanel = ({
  options,
  onChange,
}: PdfOptionsPanelProps) => {
  const { t } = useTranslation("widgets");
  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        {t("imageToPdf.options.title")}
      </Text>

      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          {t("imageToPdf.options.pageSize")}
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
          {t("imageToPdf.options.orientation")}
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
            {
              value: "portrait",
              label: t("imageToPdf.options.orientationOptions.portrait"),
            },
            {
              value: "landscape",
              label: t("imageToPdf.options.orientationOptions.landscape"),
            },
          ]}
          fullWidth
          size="sm"
        />
      </Stack>

      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          {t("imageToPdf.options.imageFit")}
        </Text>
        <SegmentedControl
          value={options.imageFit}
          onChange={(value) =>
            onChange({ ...options, imageFit: value as PdfOptions["imageFit"] })
          }
          data={[
            { value: "fit", label: t("imageToPdf.options.imageFitOptions.fit") },
            { value: "fill", label: t("imageToPdf.options.imageFitOptions.fill") },
            {
              value: "original",
              label: t("imageToPdf.options.imageFitOptions.original"),
            },
          ]}
          fullWidth
          size="sm"
        />
        <Text size="xs" c="dimmed">
          {options.imageFit === "fit" &&
            t("imageToPdf.options.imageFitDescriptions.fit")}
          {options.imageFit === "fill" &&
            t("imageToPdf.options.imageFitDescriptions.fill")}
          {options.imageFit === "original" &&
            t("imageToPdf.options.imageFitDescriptions.original")}
        </Text>
      </Stack>
    </Stack>
  );
};
