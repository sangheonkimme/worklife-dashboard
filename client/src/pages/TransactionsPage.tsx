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
    name: item.category?.name || "미분류",
    value: item.total,
    color: item.category?.color || chartColors[index % chartColors.length],
  }));

  const recentTransactions = recentTransactionsData?.transactions ?? [];

  const statsCards = [
    {
      title: "이번 달 지출",
      value: summary?.expense ?? 0,
      icon: IconTrendingDown,
      color: "red",
      diff: calculateDiffPercent(
        summary?.expense ?? 0,
        previousSummary?.expense ?? null
      ),
    },
    {
      title: "총 수입",
      value: summary?.income ?? 0,
      icon: IconTrendingUp,
      color: "teal",
      diff: calculateDiffPercent(
        summary?.income ?? 0,
        previousSummary?.income ?? null
      ),
    },
    {
      title: "순이익",
      value: summary?.net ?? 0,
      icon: IconWallet,
      color: (summary?.net ?? 0) >= 0 ? "teal" : "red",
      diff: calculateDiffPercent(
        summary?.net ?? 0,
        previousSummary?.net ?? null
      ),
    },
    {
      title: "평균 일일 지출",
      value: averageDailyExpense,
      icon: IconCalendarStats,
      color: "orange",
      diff: calculateDiffPercent(averageDailyExpense, prevAverageDailyExpense),
      helper: `${cycleDays}일 기준 · 월급일 ${payday}일`,
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>가계부 대시보드</Title>
            <Text c="dimmed" size="sm">
              예산, 거래내역, 통계를 한 화면에서 확인하세요.
            </Text>
            <Text c="dimmed" size="sm">
              {cycleLabel} · 월급일 {payday}일 기준
            </Text>
          </div>
          <Group gap="sm">
            <MonthPickerInput
              label="조회 월"
              value={selectedMonth}
              onChange={(value) => value && setSelectedMonth(value)}
              placeholder="월 선택"
              w={200}
              size="md"
            />
            <Select
              label="월급일"
              placeholder="선택"
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
                            지난 달 대비
                          </Text>
                        </>
                      ) : (
                        "지난 달 데이터 없음"
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
                  카테고리별 지출
                </Text>
                <Text size="sm" c="dimmed">
                  {cycleLabel} 기준 지출 {formatCurrency(summary?.expense ?? 0)}
                </Text>
              </div>
            </Group>

            {isStatsLoading ? (
              <Skeleton height={320} radius="md" />
            ) : pieData.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                선택한 기간에 지출 데이터가 없습니다
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
                최근 거래 내역
              </Text>
              <Badge color="gray" variant="light">
                최근 {Math.min(recentTransactions.length, 8)}건
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
                거래 내역이 없습니다. 첫 거래를 추가해보세요!
              </Text>
            ) : (
              <ScrollArea h={320} type="never">
                <Stack gap="sm">
                  {recentTransactions.map((transaction) => {
                    const isIncome = transaction.type === "INCOME";
                    const categoryColor = transaction.category?.color || "gray";
                    const categoryName = transaction.category?.name || "미분류";
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
                예산
              </Tabs.Tab>
              <Tabs.Tab
                value="transactions"
                leftSection={<IconReceipt size={16} />}
              >
                거래내역
              </Tabs.Tab>
              <Tabs.Tab
                value="statistics"
                leftSection={<IconChartBar size={16} />}
              >
                통계
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
