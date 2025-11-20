"use client";

import { Divider, SegmentedControl, SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { WidgetDockPosition } from "@/types/userSettings";
import { SectionCard } from "./SectionCard";
import type { SettingsForm } from "./types";

interface AppearanceSectionProps {
  form: SettingsForm;
}

export const AppearanceSection = ({ form }: AppearanceSectionProps) => {
  const { t } = useTranslation("settings");
  const dirty =
    form.isDirty("appearance.colorScheme") ||
    form.isDirty("appearance.sidebarPinned") ||
    form.isDirty("appearance.widgetDockPosition") ||
    form.isDirty("appearance.widgetAutoClose");

  const dockPosition = form.values.appearance.widgetDockPosition;

  return (
    <SectionCard
      id="appearance"
      title={t("sections.appearance.title")}
      description={t("sections.appearance.description")}
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Stack gap={8}>
          <Text fw={500} size="sm">
            {t("appearanceSettings.fields.colorScheme")}
          </Text>
          <SegmentedControl
            value={form.values.appearance.colorScheme}
            onChange={(value) =>
              form.setFieldValue(
                "appearance.colorScheme",
                value as SettingsForm["values"]["appearance"]["colorScheme"]
              )
            }
            data={[
              { label: t("appearanceSettings.colorSchemeOptions.light"), value: "light" },
              { label: t("appearanceSettings.colorSchemeOptions.dark"), value: "dark" },
              { label: t("appearanceSettings.colorSchemeOptions.system"), value: "system" },
            ]}
          />
        </Stack>

        <Stack gap="xs">
          <Switch
            label={t("appearanceSettings.fields.sidebarPinned.label")}
            description={t("appearanceSettings.fields.sidebarPinned.description")}
            checked={form.values.appearance.sidebarPinned}
            onChange={(event) =>
              form.setFieldValue("appearance.sidebarPinned", event.currentTarget.checked)
            }
          />
          <Switch
            label={t("appearanceSettings.fields.widgetAutoClose.label")}
            description={t("appearanceSettings.fields.widgetAutoClose.description")}
            checked={form.values.appearance.widgetAutoClose}
            onChange={(event) =>
              form.setFieldValue("appearance.widgetAutoClose", event.currentTarget.checked)
            }
          />
        </Stack>
      </SimpleGrid>

      <Divider my="lg" />

      <Stack gap="xs">
        <Text fw={500} size="sm">
          {t("appearanceSettings.fields.dockPosition")}
        </Text>
        <SegmentedControl
          value={dockPosition}
          onChange={(value) =>
            form.setFieldValue("appearance.widgetDockPosition", value as WidgetDockPosition)
          }
          data={[
            { label: t("appearanceSettings.dockOptions.left"), value: "left" },
            { label: t("appearanceSettings.dockOptions.right"), value: "right" },
          ]}
        />
      </Stack>
    </SectionCard>
  );
};
