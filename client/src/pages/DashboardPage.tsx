import { useState } from "react";
import {
  Title,
  Button,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  SimpleGrid,
  Progress,
  RingProgress,
} from "@mantine/core";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconUsers,
  IconShoppingCart,
  IconReceipt,
  IconCoin,
} from "@tabler/icons-react";

export function DashboardPage() {
  const [count, setCount] = useState(0);

  const stats = [
    {
      title: "총 사용자",
      value: "13,456",
      diff: 34,
      icon: IconUsers,
      color: "blue",
    },
    {
      title: "주문",
      value: "4,145",
      diff: 13,
      icon: IconShoppingCart,
      color: "teal",
    },
    {
      title: "매출",
      value: "₩1,234,567",
      diff: -13,
      icon: IconCoin,
      color: "yellow",
    },
    {
      title: "활성 세션",
      value: "745",
      diff: 18,
      icon: IconReceipt,
      color: "grape",
    },
  ];

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>대시보드 개요</Title>
        <Text c="dimmed" size="sm">
          실시간 비즈니스 메트릭과 성과 지표
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const DiffIcon =
            stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

          return (
            <Card
              key={stat.title}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <Icon
                  size={32}
                  stroke={1.5}
                  color={`var(--mantine-color-${stat.color}-6)`}
                />
              </Group>

              <Group mt="md" gap="xs">
                <Text c={stat.diff > 0 ? "teal" : "red"} fz="sm" fw={500}>
                  <span>
                    {stat.diff > 0 ? "+" : ""}
                    {stat.diff}%
                  </span>
                </Text>
                <DiffIcon
                  size={16}
                  stroke={1.5}
                  color={
                    stat.diff > 0
                      ? "var(--mantine-color-teal-6)"
                      : "var(--mantine-color-red-6)"
                  }
                />
                <Text fz="xs" c="dimmed">
                  지난 달 대비
                </Text>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={500}>
                한글 폰트 테스트 (Pretendard)
              </Text>
              <Badge color="blue" variant="light">
                다크 테마
              </Badge>
            </Group>

            <Text c="dimmed">
              이것은 한글 텍스트입니다. Pretendard 폰트가 올바르게 적용되었는지
              확인하세요.
            </Text>

            <Button
              onClick={() => setCount((count) => count + 1)}
              fullWidth
              variant="filled"
            >
              클릭 횟수: {count}
            </Button>

            <Text size="sm" c="dimmed" ta="center">
              버튼을 클릭하여 카운터를 증가시키세요
            </Text>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>프로젝트 진행 상황</Text>

            <div>
              <Group justify="space-between" mb={5}>
                <Text size="sm">프론트엔드 개발</Text>
                <Text size="sm" c="dimmed">
                  75%
                </Text>
              </Group>
              <Progress value={75} color="blue" size="sm" />
            </div>

            <div>
              <Group justify="space-between" mb={5}>
                <Text size="sm">백엔드 API</Text>
                <Text size="sm" c="dimmed">
                  60%
                </Text>
              </Group>
              <Progress value={60} color="teal" size="sm" />
            </div>

            <div>
              <Group justify="space-between" mb={5}>
                <Text size="sm">테스트 작성</Text>
                <Text size="sm" c="dimmed">
                  40%
                </Text>
              </Group>
              <Progress value={40} color="yellow" size="sm" />
            </div>

            <Group justify="center" mt="md">
              <RingProgress
                size={120}
                thickness={12}
                sections={[
                  { value: 75, color: "blue", tooltip: "프론트엔드 - 75%" },
                  { value: 60, color: "teal", tooltip: "백엔드 - 60%" },
                  { value: 40, color: "yellow", tooltip: "테스트 - 40%" },
                ]}
                label={
                  <Text ta="center" size="sm" fw={700}>
                    전체 58%
                  </Text>
                }
              />
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xs">
          <Text fw={500}>기술 스택</Text>
          <Group gap="xs">
            <Badge color="cyan">React</Badge>
            <Badge color="violet">TypeScript</Badge>
            <Badge color="blue">Vite</Badge>
            <Badge color="indigo">Mantine UI</Badge>
            <Badge color="pink">Pretendard Font</Badge>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
