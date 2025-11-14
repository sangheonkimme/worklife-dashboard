import { Stack, Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SectionCard } from "./SectionCard";
import type { SettingsForm } from "./types";

interface NotificationsSectionProps {
  form: SettingsForm;
}

export const NotificationsSection = ({ form }: NotificationsSectionProps) => {
  const { t } = useTranslation("settings");
  const dirty =
    form.isDirty("notifications.transactions") ||
    form.isDirty("notifications.monthlyReport") ||
    form.isDirty("notifications.checklist");

  return (
    <SectionCard
      id="notifications"
      title={t("sections.notifications.title")}
      description={t("sections.notifications.description")}
      dirty={dirty}
    >
      <Stack gap="sm">
        <Switch
          label={t("notificationsSection.transactions.label")}
          description={t("notificationsSection.transactions.description")}
          checked={form.values.notifications.transactions}
          onChange={(event) =>
            form.setFieldValue("notifications.transactions", event.currentTarget.checked)
          }
        />
        <Switch
          label={t("notificationsSection.monthlyReport.label")}
          description={t("notificationsSection.monthlyReport.description")}
          checked={form.values.notifications.monthlyReport}
          onChange={(event) =>
            form.setFieldValue("notifications.monthlyReport", event.currentTarget.checked)
          }
        />
        <Switch
          label={t("notificationsSection.checklist.label")}
          description={t("notificationsSection.checklist.description")}
          checked={form.values.notifications.checklist}
          onChange={(event) =>
            form.setFieldValue("notifications.checklist", event.currentTarget.checked)
          }
        />
      </Stack>
    </SectionCard>
  );
};
