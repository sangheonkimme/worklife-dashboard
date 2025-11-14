import { Stack, Title, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface PageHeaderProps {
  title: string;
  description: string;
  lastSavedAt?: Date | null;
}

export const PageHeader = ({ title, description, lastSavedAt }: PageHeaderProps) => {
  const { t } = useTranslation("settings");

  return (
    <Stack gap={4}>
      <div>
        <Title order={2}>{title}</Title>
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      </div>
      {lastSavedAt && (
        <Text size="xs" c="dimmed">
          {t("settings:status.lastSaved", {
            timestamp: dayjs(lastSavedAt).format("YYYY.MM.DD HH:mm:ss"),
          })}
        </Text>
      )}
    </Stack>
  );
};
