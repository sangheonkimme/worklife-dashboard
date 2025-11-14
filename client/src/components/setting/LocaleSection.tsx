import { useMemo } from "react";
import { SimpleGrid, Select, Paper, Group, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { SectionCard } from "./SectionCard";
import type { SettingsForm } from "./types";

const LANGUAGE_VALUES = ["system", "ko", "en"] as const;

interface LocaleSectionProps {
  form: SettingsForm;
  timezoneOptions: { label: string; value: string }[];
}

export const LocaleSection = ({ form, timezoneOptions }: LocaleSectionProps) => {
  const { t } = useTranslation("settings");
  const formatLocaleOptions = useMemo(
    () => [
      { label: t("locale.formatLocaleOptions.ko-KR"), value: "ko-KR" },
      { label: t("locale.formatLocaleOptions.en-US"), value: "en-US" },
      { label: t("locale.formatLocaleOptions.ja-JP"), value: "ja-JP" },
      { label: t("locale.formatLocaleOptions.de-DE"), value: "de-DE" },
    ],
    [t]
  );
  const dirty =
    form.isDirty("timezone") ||
    form.isDirty("locale") ||
    form.isDirty("language");

  const languageOptions = LANGUAGE_VALUES.map((value) => ({
    value,
    label: t(`locale.languageOptions.${value}`),
  }));

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(form.values.locale || "ko-KR", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: form.values.timezone,
      }).format(new Date());
    } catch {
      return dayjs().format("YYYY.MM.DD HH:mm");
    }
  }, [form.values.locale, form.values.timezone]);

  return (
    <SectionCard
      id="locale"
      title={t("sections.locale.title")}
      description={t("sections.locale.description")}
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Select
          label={t("locale.timezoneLabel")}
          searchable
          withAsterisk
          nothingFoundMessage={t("locale.noResults")}
          data={timezoneOptions}
          {...form.getInputProps("timezone")}
        />
        <Select
          label={t("locale.serviceLanguageLabel")}
          description={t("locale.serviceLanguageDescription")}
          searchable
          withAsterisk
          data={languageOptions}
          {...form.getInputProps("language")}
        />
        <Select
          label={t("locale.formatLocaleLabel")}
          description={t("locale.formatLocaleDescription")}
          searchable
          withAsterisk
          data={formatLocaleOptions}
          {...form.getInputProps("locale")}
        />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="lg">
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" c="dimmed">
              {t("locale.previewLabel")}
            </Text>
            <Text fw={600}>{formattedDate}</Text>
          </div>
        </Group>
      </Paper>
    </SectionCard>
  );
};
