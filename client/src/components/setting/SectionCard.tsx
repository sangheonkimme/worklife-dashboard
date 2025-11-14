import type { ReactNode } from "react";
import { Card, Group, Title, Text, Badge } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface SectionCardProps {
  id: string;
  title: string;
  description: string;
  dirty?: boolean;
  children: ReactNode;
}

export const SectionCard = ({
  id,
  title,
  description,
  dirty,
  children,
}: SectionCardProps) => {
  const { t } = useTranslation("settings");

  return (
    <Card id={id} withBorder shadow="sm" radius="lg" padding="xl" component="section">
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={4}>{title}</Title>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </div>
        {dirty && (
          <Badge color="blue" variant="light">
            {t("status.modified")}
          </Badge>
        )}
      </Group>
      {children}
    </Card>
  );
};
