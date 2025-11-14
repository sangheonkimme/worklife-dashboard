import { useMemo } from "react";
import {
  NumberInput,
  Select,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Paper,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SectionCard } from "./SectionCard";
import type { SettingsForm } from "./types";

interface FinanceSectionProps {
  form: SettingsForm;
  locale: string;
}

export const FinanceSection = ({ form, locale }: FinanceSectionProps) => {
  const { t } = useTranslation("settings");
  const currencyOptions = useMemo(
    () => [
      { label: t("finance.currencyOptions.KRW"), value: "KRW" },
      { label: t("finance.currencyOptions.USD"), value: "USD" },
      { label: t("finance.currencyOptions.JPY"), value: "JPY" },
      { label: t("finance.currencyOptions.EUR"), value: "EUR" },
      { label: t("finance.currencyOptions.SGD"), value: "SGD" },
    ],
    [t]
  );
  const weekOptions = useMemo(
    () => [
      { label: t("finance.weekdays.0"), value: "0" },
      { label: t("finance.weekdays.1"), value: "1" },
      { label: t("finance.weekdays.6"), value: "6" },
    ],
    [t]
  );

  const currencyPreview = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale || "ko-KR", {
        style: "currency",
        currency: form.values.finance.currency,
      }).format(1234567);
    } catch {
      return t("finance.currencyFormatError");
    }
  }, [form.values.finance.currency, locale, t]);

  const dirty =
    form.isDirty("finance.payday") ||
    form.isDirty("finance.currency") ||
    form.isDirty("finance.weekStartsOn");

  return (
    <SectionCard
      id="finance"
      title={t("sections.finance.title")}
      description={t("sections.finance.description")}
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <NumberInput
          label={t("finance.fields.payday.label")}
          description={t("finance.fields.payday.description")}
          min={1}
          max={31}
          withAsterisk
          {...form.getInputProps("finance.payday")}
        />
        <Select
          label={t("finance.fields.currency.label")}
          searchable
          withAsterisk
          data={currencyOptions}
          {...form.getInputProps("finance.currency")}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="lg">
        <Stack gap={8}>
          <Text fw={500} size="sm">
            {t("finance.fields.weekStartsOn")}
          </Text>
          <SegmentedControl
            value={String(form.values.finance.weekStartsOn)}
            onChange={(value) =>
              form.setFieldValue("finance.weekStartsOn", Number(value))
            }
            data={weekOptions}
          />
        </Stack>
        <Paper withBorder radius="md" p="md">
          <Text size="sm" c="dimmed" mb={4}>
            {t("finance.fields.preview")}
          </Text>
          <Text fw={600}>{currencyPreview}</Text>
        </Paper>
      </SimpleGrid>
    </SectionCard>
  );
};
