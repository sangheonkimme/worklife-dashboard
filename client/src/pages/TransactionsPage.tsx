import { useMemo, useState } from "react";
import {
  Container,
  Title,
  Text,
  Tabs,
  Box,
  Affix,
  ActionIcon,
  Transition,
  Stack,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Paper,
  ScrollArea,
  Badge,
  Skeleton,
  Select,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import {
  IconReceipt,
  IconChartBar,
  IconWallet,
  IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendarStats,
} from "@tabler/icons-react";
import { useWindowScroll } from "@mantine/hooks";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { transactionApi } from "@/services/api/transactionApi";
import TransactionsTab from "@/components/transactions/TransactionsTab";
import StatisticsTab from "@/components/transactions/StatisticsTab";
import BudgetsTab from "@/components/transactions/BudgetsTab";
import { useFinanceSettingsStore } from "@/store/useFinanceSettingsStore";
import {
  getCycleRange,
  getPreviousCycleRange,
  formatCycleLabel,
} from "@/utils/paydayCycle";
import { formatCurrency, formatDate } from "@/utils/format";
import { useTranslation } from "react-i18next";

const chartColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA15E",
  "#845EC2",
];

const calculateDiffPercent = (current: number, previous?: number | null) => {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export default function TransactionsPage() {
  const { t } = useTranslation(["finance", "common"]);
  const [activeTab, setActiveTab] = useState<string | null>("transactions");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [scroll] = useWindowScroll();
  const payday = useFinanceSettingsStore((state) => state.payday);
  const setPayday = useFinanceSettingsStore((state) => state.setPayday);

  const paydayOptions = useMemo(
    () =>
      Array.from({ length: 31 }, (_, index) => {
        const day = index + 1;
        return { value: day.toString(), label: `${day}일` };
      }),
    []
  );

  const {
    start: cycleStart,
    end: cycleEnd,
    days: cycleDays,
  } = useMemo(
    () => getCycleRange(selectedMonth, payday),
    [selectedMonth, payday]
  );

  const {
    start: prevCycleStart,
    end: prevCycleEnd,
    days: prevCycleDays,
  } = useMemo(
    () => getPreviousCycleRange(selectedMonth, payday),
    [selectedMonth, payday]
  );

  const cycleStartISO = cycleStart.toISOString();
  const cycleEndISO = cycleEnd.toISOString();
  const prevCycleStartISO = prevCycleStart.toISOString();
  const prevCycleEndISO = prevCycleEnd.toISOString();
  const cycleLabel = formatCycleLabel(cycleStart, cycleEnd);

  const { data: statistics, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-statistics", cycleStartISO, cycleEndISO, payday],
    queryFn: () =>
      transactionApi.getStatistics(cycleStartISO, cycleEndISO, "category"),
  });

  const { data: previousStatistics } = useQuery({
    queryKey: [
      "dashboard-statistics",
      "previous",
      prevCycleStartISO,
      prevCycleEndISO,
      payday,
    ],
    queryFn: () =>
      transactionApi.getStatistics(
        prevCycleStartISO,
        prevCycleEndISO,
        "category"
      ),
  });

  const { data: recentTransactionsData, isLoading: isRecentLoading } = useQuery(
    {
      queryKey: ["dashboard-recent-transactions"],
      queryFn: () =>
        transactionApi.getTransactions({
          page: 1,
          limit: 8,
          sortBy: "date",
          sortOrder: "desc",
        }),
    }
  );

  const summary = statistics?.summary;
  const previousSummary = previousStatistics?.summary;

  const averageDailyExpense = summary ? summary.expense / cycleDays : 0;
  const prevAverageDailyExpense = previousSummary
    ? previousSummary.expense / prevCycleDays
    : null;

  const expenseCategories =
    statistics?.byCategory.filter((item) => item.type === "EXPENSE") ?? [];

  const pieData = expenseCategories.map((item, index) => ({
    name:
      item.category?.name || t("common:labels.unclassified"),
    value: item.total,
    color: item.category?.color || chartColors[index % chartColors.length],
  }));

  const recentTransactions = recentTransactionsData?.transactions ?? [];

  const statsCards = [
    {
      title: t("dashboard.stats.expenses"),
      value: summary?.expense ?? 0,
      icon: IconTrendingDown,
      color: "red",
      diff: calculateDiffPercent(
        summary?.expense ?? 0,
        previousSummary?.expense ?? null
      ),
    },
    {
      title: t("dashboard.stats.income"),
      value: summary?.income ?? 0,
      icon: IconTrendingUp,
      color: "teal",
      diff: calculateDiffPercent(
        summary?.income ?? 0,
        previousSummary?.income ?? null
      ),
    },
    {
      title: t("dashboard.stats.net"),
      value: summary?.net ?? 0,
      icon: IconWallet,
      color: (summary?.net ?? 0) >= 0 ? "teal" : "red",
      diff: calculateDiffPercent(
        summary?.net ?? 0,
        previousSummary?.net ?? null
      ),
    },
    {
      title: t("dashboard.stats.daily"),
      value: averageDailyExpense,
      icon: IconCalendarStats,
      color: "orange",
      diff: calculateDiffPercent(averageDailyExpense, prevAverageDailyExpense),
      helper: t("dashboard.stats.helper", {
        days: cycleDays,
        day: payday,
      }),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>{t("dashboard.title")}</Title>
            <Text c="dimmed" size="sm">
              {t("dashboard.subtitle")}
            </Text>
            <Text c="dimmed" size="sm">
              {t("dashboard.periodSummary", {
                range: cycleLabel,
                day: payday,
              })}
            </Text>
          </div>
          <Group gap="sm">
            <MonthPickerInput
              label={t("dashboard.filters.monthLabel")}
              value={selectedMonth}
              onChange={(value) => value && setSelectedMonth(value)}
              placeholder={t("dashboard.filters.monthPlaceholder")}
              w={200}
              size="md"
            />
            <Select
              label={t("dashboard.filters.paydayLabel")}
              placeholder={t("dashboard.filters.paydayPlaceholder")}
              value={payday.toString()}
              data={paydayOptions}
              onChange={(value) => value && setPayday(Number(value))}
              w={120}
              size="md"
            />
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {isStatsLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={140} radius="md" />
              ))
            : statsCards.map((stat) => {
                const Icon = stat.icon;
                const diffValue = stat.diff;
                const hasDiff = diffValue != null;
                const isPositive = (diffValue ?? 0) >= 0;

                return (
                  <Card key={stat.title} withBorder radius="md" padding="lg">
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        {stat.title}
                      </Text>
                      <ThemeIcon color={stat.color} variant="light" size="lg">
                        <Icon size={20} stroke={1.5} />
                      </ThemeIcon>
                    </Group>

                    <Text fw={700} size="xl">
                      {formatCurrency(stat.value)}
                    </Text>

                    {stat.helper && (
                      <Text size="xs" c="dimmed">
                        {stat.helper}
                      </Text>
                    )}

                    <Text
                      c={hasDiff ? (isPositive ? "teal" : "red") : "dimmed"}
                      size="sm"
                      fw={500}
                      mt="xs"
                    >
                      {hasDiff ? (
                        <>
                          {isPositive ? "+" : ""}
                          {diffValue!.toFixed(1)}%
                          <Text span c="dimmed" fw={400} size="sm">
                            {" "}
                            {t("dashboard.stats.diffLabel")}
                          </Text>
                        </>
                      ) : (
                        t("dashboard.stats.noData")
                      )}
                    </Text>
                  </Card>
                );
              })}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" mb="md">
              <div>
                <Text size="lg" fw={600}>
                  {t("dashboard.categories.title")}
                </Text>
                <Text size="sm" c="dimmed">
                  {t("dashboard.categories.subtitle", {
                    range: cycleLabel,
                    amount: formatCurrency(summary?.expense ?? 0),
                  })}
                </Text>
              </div>
            </Group>

            {isStatsLoading ? (
              <Skeleton height={320} radius="md" />
            ) : pieData.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                {t("dashboard.categories.empty")}
              </Text>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                {t("dashboard.recent.title")}
              </Text>
              <Badge color="gray" variant="light">
                {t("dashboard.recent.badge", {
                  count: Math.min(recentTransactions.length, 8),
                })}
              </Badge>
            </Group>

            {isRecentLoading ? (
              <Stack gap="sm">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} height={70} radius="md" />
                ))}
              </Stack>
            ) : recentTransactions.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                {t("dashboard.recent.empty")}
              </Text>
            ) : (
              <ScrollArea h={320} type="never">
                <Stack gap="sm">
                  {recentTransactions.map((transaction) => {
                    const isIncome = transaction.type === "INCOME";
                    const categoryColor = transaction.category?.color || "gray";
                    const categoryName =
                      transaction.category?.name ||
                      t("common:labels.unclassified");
                    const dateLabel = formatDate(transaction.date);
                    const amountLabel = `${
                      isIncome ? "+" : "-"
                    }${formatCurrency(Math.abs(transaction.amount))}`;

                    return (
                      <Paper
                        key={transaction.id}
                        withBorder
                        radius="md"
                        p="md"
                        shadow="xs"
                      >
                        <Group justify="space-between" align="flex-start">
                          <Group>
                            <ThemeIcon
                              variant="light"
                              color={categoryColor}
                              size="lg"
                              radius="md"
                            >
                              <IconReceipt size={18} />
                            </ThemeIcon>
                            <div>
                              <Text fw={600}>
                                {transaction.description || categoryName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {dateLabel}
                              </Text>
                            </div>
                          </Group>
                          <div style={{ textAlign: "right" }}>
                            <Text fw={700} c={isIncome ? "teal" : "red"}>
                              {amountLabel}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {categoryName}
                            </Text>
                          </div>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </Card>
        </SimpleGrid>

        <Card withBorder radius="md" padding="lg">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="budgets" leftSection={<IconWallet size={16} />}>
                {t("dashboard.tabs.budgets")}
              </Tabs.Tab>
              <Tabs.Tab
                value="transactions"
                leftSection={<IconReceipt size={16} />}
              >
                {t("dashboard.tabs.transactions")}
              </Tabs.Tab>
              <Tabs.Tab
                value="statistics"
                leftSection={<IconChartBar size={16} />}
              >
                {t("dashboard.tabs.statistics")}
              </Tabs.Tab>
            </Tabs.List>

            <Box mt="md">
              <Tabs.Panel value="transactions">
                <TransactionsTab />
              </Tabs.Panel>

              <Tabs.Panel value="statistics">
                <StatisticsTab
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  payday={payday}
                />
              </Tabs.Panel>

              <Tabs.Panel value="budgets">
                <BudgetsTab />
              </Tabs.Panel>
            </Box>
          </Tabs>
        </Card>
      </Stack>

      {activeTab === "transactions" && (
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={scroll.y > 100}>
            {(transitionStyles) => (
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                style={transitionStyles}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("openTransactionModal"));
                }}
              >
                <IconPlus size={24} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      )}
    </Container>
  );
}
