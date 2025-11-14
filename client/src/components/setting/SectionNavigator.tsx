import { Button, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";

const SECTION_IDS = ["finance", "locale", "appearance", "timers", "notifications"] as const;

export const SectionNavigator = () => {
  const { t } = useTranslation("settings");

  return (
    <Group gap="xs">
      {SECTION_IDS.map((sectionId) => (
        <Button
          key={sectionId}
          component="a"
          href={`#${sectionId}`}
          variant="subtle"
          size="xs"
          radius="xl"
        >
          {t(`sections.${sectionId}.label`)}
        </Button>
      ))}
    </Group>
  );
};
