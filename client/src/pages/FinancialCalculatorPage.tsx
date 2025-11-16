import { Card, Container, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { LoanCalculatorWidget } from "@/components/widgets";

export function FinancialCalculatorPage() {
  const { t } = useTranslation("finance");

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={2}>{t("calculatorPage.title")}</Title>
          <Text c="dimmed">{t("calculatorPage.subtitle")}</Text>
        </Stack>
        <Card padding="xl" radius="md" withBorder>
          <Stack gap="sm">
            <Stack gap={2}>
              <Text fw={600}>{t("calculatorPage.widgetCardTitle")}</Text>
              <Text size="sm" c="dimmed">
                {t("calculatorPage.widgetCardDescription")}
              </Text>
            </Stack>
            <LoanCalculatorWidget showHeader={false} />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

export default FinancialCalculatorPage;
