import {
  Title,
  Text,
  Stack,
  Card,
  Group,
  SimpleGrid,
  Table,
  Badge,
  ThemeIcon,
  Paper,
  ScrollArea,
  Avatar,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconShoppingCart,
  IconHome,
  IconCar,
  IconDevices,
  IconPizza,
  IconHeartbeat,
  IconPlane,
} from "@tabler/icons-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// 통계 데이터
const statsData = [
  {
    title: "이번 달 지출",
    value: "₩2,847,000",
    diff: 12.5,
    icon: IconWallet,
    color: "blue",
  },
  {
    title: "수입",
    value: "₩4,500,000",
    diff: 5.2,
    icon: IconTrendingUp,
    color: "teal",
  },
  {
    title: "저축",
    value: "₩1,653,000",
    diff: -8.3,
    icon: IconTrendingDown,
    color: "grape",
  },
  {
    title: "평균 일일 지출",
    value: "₩94,900",
    diff: 3.1,
    icon: IconShoppingCart,
    color: "orange",
  },
];

// 카테고리별 지출 데이터
const categoryData = [
  { name: "식비", value: 850000, color: "#FF6B6B", icon: IconPizza },
  { name: "교통", value: 320000, color: "#4ECDC4", icon: IconCar },
  { name: "주거", value: 1200000, color: "#45B7D1", icon: IconHome },
  { name: "쇼핑", value: 280000, color: "#96CEB4", icon: IconShoppingCart },
  { name: "의료", value: 120000, color: "#FFEAA7", icon: IconHeartbeat },
  { name: "여가", value: 77000, color: "#DDA15E", icon: IconPlane },
];

// 거래 내역 데이터
const transactions = [
  {
    id: 1,
    date: "2024-10-16",
    description: "CU 편의점",
    category: "식비",
    amount: -15000,
    icon: IconPizza,
    color: "red",
  },
  {
    id: 2,
    date: "2024-10-15",
    description: "지하철 교통카드 충전",
    category: "교통",
    amount: -50000,
    icon: IconCar,
    color: "cyan",
  },
  {
    id: 3,
    date: "2024-10-15",
    description: "월급",
    category: "수입",
    amount: 4500000,
    icon: IconWallet,
    color: "green",
  },
  {
    id: 4,
    date: "2024-10-14",
    description: "쿠팡 온라인 쇼핑",
    category: "쇼핑",
    amount: -85000,
    icon: IconShoppingCart,
    color: "orange",
  },
  {
    id: 5,
    date: "2024-10-14",
    description: "스타벅스",
    category: "식비",
    amount: -12000,
    icon: IconPizza,
    color: "red",
  },
  {
    id: 6,
    date: "2024-10-13",
    description: "넷플릭스 구독",
    category: "여가",
    amount: -13500,
    icon: IconDevices,
    color: "grape",
  },
  {
    id: 7,
    date: "2024-10-12",
    description: "약국",
    category: "의료",
    amount: -28000,
    icon: IconHeartbeat,
    color: "yellow",
  },
  {
    id: 8,
    date: "2024-10-11",
    description: "이마트 장보기",
    category: "식비",
    amount: -120000,
    icon: IconPizza,
    color: "red",
  },
];

export const ExpenseTrackerPage = () => {
  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>지출 추적 대시보드</Title>
        <Text c="dimmed" size="sm">
          이번 달 재정 현황과 카테고리별 지출 내역
        </Text>
      </div>

      {/* 통계 그리드 */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {statsData.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.diff > 0;

          return (
            <Card
              key={stat.title}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.title}
                </Text>
                <ThemeIcon
                  color={stat.color}
                  variant="light"
                  size="lg"
                  radius="md"
                >
                  <Icon size={20} stroke={1.5} />
                </ThemeIcon>
              </Group>

              <Text fw={700} size="xl">
                {stat.value}
              </Text>

              <Text c={isPositive ? "teal" : "red"} size="sm" fw={500} mt="xs">
                {isPositive ? "+" : ""}
                {stat.diff}%
                <Text span c="dimmed" fw={400} size="sm">
                  {" "}
                  지난 달 대비
                </Text>
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        {/* 도넛 차트 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={500} mb="md">
            카테고리별 지출
          </Text>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `₩${value.toLocaleString()}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <Stack gap="xs" mt="md">
            {categoryData.map((category) => {
              const Icon = category.icon;
              const percentage = (
                (category.value / totalExpense) *
                100
              ).toFixed(1);

              return (
                <Group key={category.name} justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon
                      size="sm"
                      radius="xl"
                      style={{ backgroundColor: category.color }}
                    >
                      <Icon size={14} />
                    </ThemeIcon>
                    <Text size="sm">{category.name}</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      ₩{category.value.toLocaleString()}
                    </Text>
                    <Badge size="sm" variant="light" color="gray">
                      {percentage}%
                    </Badge>
                  </Group>
                </Group>
              );
            })}
          </Stack>
        </Card>

        {/* 최근 거래 내역 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={500} mb="md">
            최근 거래 내역
          </Text>

          <ScrollArea h={400}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>날짜</Table.Th>
                  <Table.Th>내역</Table.Th>
                  <Table.Th>카테고리</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>금액</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transactions.map((transaction) => {
                  const Icon = transaction.icon;
                  const isIncome = transaction.amount > 0;

                  return (
                    <Table.Tr key={transaction.id}>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {transaction.date}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar
                            size="sm"
                            radius="xl"
                            color={transaction.color}
                          >
                            <Icon size={16} />
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {transaction.description}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="light"
                          color={transaction.color}
                        >
                          {transaction.category}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        <Text size="sm" fw={600} c={isIncome ? "teal" : "red"}>
                          {isIncome ? "+" : ""}₩
                          {Math.abs(transaction.amount).toLocaleString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      </SimpleGrid>

      {/* 월별 요약 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text size="lg" fw={500}>
            월별 요약
          </Text>
          <Badge size="lg" variant="light" color="blue">
            2024년 10월
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper
            p="md"
            radius="md"
            style={{ backgroundColor: "var(--mantine-color-blue-0)" }}
          >
            <Text size="sm" c="dimmed" mb={5}>
              총 수입
            </Text>
            <Text size="xl" fw={700} c="blue">
              ₩4,500,000
            </Text>
          </Paper>
          <Paper
            p="md"
            radius="md"
            style={{ backgroundColor: "var(--mantine-color-red-0)" }}
          >
            <Text size="sm" c="dimmed" mb={5}>
              총 지출
            </Text>
            <Text size="xl" fw={700} c="red">
              ₩2,847,000
            </Text>
          </Paper>
          <Paper
            p="md"
            radius="md"
            style={{ backgroundColor: "var(--mantine-color-teal-0)" }}
          >
            <Text size="sm" c="dimmed" mb={5}>
              순 저축
            </Text>
            <Text size="xl" fw={700} c="teal">
              ₩1,653,000
            </Text>
          </Paper>
        </SimpleGrid>
      </Card>
    </Stack>
  );
};

export default ExpenseTrackerPage;
