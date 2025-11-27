"use client";

import { Affix, Button, Group, Paper, Text, rem } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";

interface SettingsActionBarProps {
  isDirty: boolean;
  isSubmitting: boolean;
  onReset: () => void;
  formId: string;
}

export const SettingsActionBar = ({
  isDirty,
  isSubmitting,
  onReset,
  formId,
}: SettingsActionBarProps) => {
  const { t } = useTranslation("common");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <Affix
      position={isDesktop ? { top: 120, right: 32 } : { bottom: 16, left: 0, right: 0 }}
      withinPortal={false}
      style={
        isDesktop
          ? undefined
          : {
              width: "100%",
              paddingLeft: rem(16),
              paddingRight: rem(16),
            }
      }
    >
      <Paper
        withBorder
        radius="lg"
        shadow="md"
        p="md"
        style={{
          minWidth: isDesktop ? 320 : "100%",
          backgroundColor: "var(--mantine-color-body)",
        }}
      >
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" fw={600}>
              {isDirty ? t("status.unsaved") : t("status.allSaved")}
            </Text>
            <Text size="xs" c="dimmed">
              {isDirty ? t("status.unsavedHint") : t("status.allSavedHint")}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              disabled={!isDirty || isSubmitting}
              onClick={onReset}
              leftSection={<IconRefresh size={14} />}
            >
              {t("actions.reset")}
            </Button>
            <Button type="submit" form={formId} disabled={!isDirty} loading={isSubmitting}>
              {t("actions.saveChanges")}
            </Button>
          </Group>
        </Group>
      </Paper>
    </Affix>
  );
};
