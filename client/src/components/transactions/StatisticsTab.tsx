import { useMemo } from "react";
import {
  Stack,
  Paper,
  Group,
  Text,
  RingProgress,
  Grid,
  SimpleGrid,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { transactionApi } from "@/services/api/transactionApi";
import { getCycleRange, formatCycleLabel } from "@/utils/paydayCycle";
import { formatCurrency } from "@/utils/format";

interface StatisticsTabProps {
  selectedMonth: Date;
  onMonthChange: (value: Date) => void;
  payday: number;
}

export default function StatisticsTab({
  selectedMonth,
  onMonthChange,
  payday,
}: StatisticsTabProps) {
  const { t } = useTranslation(["finance", "common"]);
  const { start: cycleStart, end: cycleEnd } = useMemo(
    () => getCycleRange(selectedMonth, payday),
    [selectedMonth, payday]
  );
  const startDate = cycleStart.toISOString();
  const endDate = cycleEnd.toISOString();
  const cycleLabel = formatCycleLabel(cycleStart, cycleEnd);

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ["statistics", startDate, endDate, payday],
    queryFn: () => transactionApi.getStatistics(startDate, endDate, "category"),
  });

  const savingsRate =
    statistics?.summary?.income && statistics.summary.income > 0
      ? ((statistics.summary.income - statistics.summary.expense) /
          statistics.summary.income) *
        100
      : 0;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={600}>
          {t("statisticsTab.title")}
        </Text>
        <MonthPickerInput
          label={t("statisticsTab.monthPicker.label")}
          value={selectedMonth}
          onChange={(value) => value && onMonthChange(value)}
          placeholder={t("statisticsTab.monthPicker.placeholder")}
          w={200}
          size="md"
        />
      </Group>
      <Text size="sm" c="dimmed">
        {t("statisticsTab.subtitle", { range: cycleLabel, payday })}
      </Text>

      {/* Summary cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {t("statisticsTab.summary.income")}
            </Text>
            <Text size="xl" fw={700} c="teal">
              {formatCurrency(statistics?.summary.income || 0)}
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {t("statisticsTab.summary.expense")}
            </Text>
            <Text size="xl" fw={700} c="red">
              {formatCurrency(statistics?.summary.expense || 0)}
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {t("statisticsTab.summary.net")}
            </Text>
            <Text
              size="xl"
              fw={700}
              c={
                statistics?.summary.net && statistics.summary.net > 0
                  ? "teal"
                  : "red"
              }
            >
              {formatCurrency(statistics?.summary.net || 0)}
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {t("statisticsTab.summary.savingsRate")}
            </Text>
            <Text size="xl" fw={700} c={savingsRate > 0 ? "teal" : "gray"}>
              {savingsRate.toFixed(1)}%
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Expenses by category */}
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="lg" fw={600}>
            {t("statisticsTab.expenseByCategory.title")}
          </Text>

          {statistics?.byCategory.filter((item) => item.type === "EXPENSE")
            .length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              {t("statisticsTab.expenseByCategory.empty")}
            </Text>
          ) : (
            <Grid>
              {statistics?.byCategory
                .filter((item) => item.type === "EXPENSE")
                .sort((a, b) => b.total - a.total)
                .slice(0, 6)
                .map((item) => {
                  const percentage =
                    statistics?.summary?.expense &&
                    statistics.summary.expense > 0
                      ? (item.total / statistics.summary.expense) * 100
                      : 0;

                  return (
                    <Grid.Col
                      key={item.category?.id || "uncategorized"}
                      span={{ base: 12, sm: 6, md: 4 }}
                    >
                      <Paper p="md" withBorder>
                        <Group justify="space-between" wrap="nowrap">
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="xs">
                              {item.category?.color && (
                                <div
                                  style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    backgroundColor: item.category.color,
                                  }}
                                />
                              )}
                              <Text size="sm" fw={500}>
                                {item.category?.name ||
                                  t("common:labels.unclassified")}
                              </Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                              {t("statisticsTab.transactionCount", {
                                count: item.count,
                              })}
                            </Text>
                            <Text size="lg" fw={700}>
                              {formatCurrency(item.total)}
                            </Text>
                          </Stack>

                          <RingProgress
                            size={80}
                            thickness={8}
                            sections={[
                              {
                                value: percentage,
                                color: item.category?.color || "blue",
                              },
                            ]}
                            label={
                              <Text size="xs" ta="center" fw={700}>
                                {percentage.toFixed(0)}%
                              </Text>
                            }
                          />
                        </Group>
                      </Paper>
                    </Grid.Col>
                  );
                })}
            </Grid>
          )}
        </Stack>
      </Paper>

      {/* Income by category */}
      {statistics?.byCategory &&
        statistics.byCategory.filter((item) => item.type === "INCOME").length >
          0 && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text size="lg" fw={600}>
                {t("statisticsTab.incomeByCategory.title")}
              </Text>

              <Grid>
                {statistics?.byCategory
                  .filter((item) => item.type === "INCOME")
                  .sort((a, b) => b.total - a.total)
                  .map((item) => {
                    const percentage =
                      statistics?.summary?.income &&
                      statistics.summary.income > 0
                        ? (item.total / statistics.summary.income) * 100
                        : 0;

                    return (
                      <Grid.Col
                        key={item.category?.id || "uncategorized"}
                        span={{ base: 12, sm: 6, md: 4 }}
                      >
                        <Paper p="md" withBorder>
                          <Group justify="space-between" wrap="nowrap">
                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Group gap="xs">
                                {item.category?.color && (
                                  <div
                                    style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor: item.category.color,
                                    }}
                                  />
                                )}
                              <Text size="sm" fw={500}>
                                {item.category?.name ||
                                  t("common:labels.unclassified")}
                              </Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                              {t("statisticsTab.transactionCount", {
                                count: item.count,
                              })}
                            </Text>
                              <Text size="lg" fw={700} c="teal">
                                {formatCurrency(item.total)}
                              </Text>
                            </Stack>

                            <RingProgress
                              size={80}
                              thickness={8}
                              sections={[
                                {
                                  value: percentage,
                                  color: item.category?.color || "teal",
                                },
                              ]}
                              label={
                                <Text size="xs" ta="center" fw={700}>
                                  {percentage.toFixed(0)}%
                                </Text>
                              }
                            />
                          </Group>
                        </Paper>
                      </Grid.Col>
                    );
                  })}
              </Grid>
            </Stack>
          </Paper>
        )}
    </Stack>
  );
}
