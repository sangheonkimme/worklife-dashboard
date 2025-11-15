import { useState, useMemo } from "react";
import {
  Button,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  SimpleGrid,
  Progress,
  RingProgress,
  Grid,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SalaryCalculatorCard } from "@/components/salary/SalaryCalculatorCard";
import { StickyNotes } from "@/components/dashboard/StickyNotes";
import { PomodoroTimerCard } from "@/components/dashboard/PomodoroTimerCard";
import { StopwatchCard } from "@/components/dashboard/StopwatchCard";
import { DashboardChecklist } from "@/components/dashboard/DashboardChecklist";

export const DashboardPage = () => {
  const [count, setCount] = useState(0);
  const { t } = useTranslation("dashboard");

  const progressSections = useMemo(
    () => [
      {
        value: 75,
        color: "blue",
        tooltip: t("overview.progressCard.tooltip", {
          label: t("overview.progressCard.frontend"),
          value: 75,
        }),
      },
      {
        value: 60,
        color: "teal",
        tooltip: t("overview.progressCard.tooltip", {
          label: t("overview.progressCard.backend"),
          value: 60,
        }),
      },
      {
        value: 40,
        color: "yellow",
        tooltip: t("overview.progressCard.tooltip", {
          label: t("overview.progressCard.testing"),
          value: 40,
        }),
      },
    ],
    [t]
  );

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Text fw={600} size="lg">
          {t("overview.quickSectionTitle")}
        </Text>
        <Grid gutter="lg" align="stretch">
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <StickyNotes />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}>
            <DashboardChecklist />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* 
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
      </SimpleGrid> */}

      {/* 주요 기능 카드 */}
      <div>
        <Text fw={600} size="lg" mb="md">
          {t("overview.featureSectionTitle")}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          <SalaryCalculatorCard />
          <PomodoroTimerCard />
          <StopwatchCard />
        </SimpleGrid>
      </div>

      {/* 사용하지 않음 - 2025.11.16 */}
      {/* <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={500}>
                {t("overview.demoCard.title")}
              </Text>
              <Badge color="blue" variant="light">
                {t("overview.demoCard.badge")}
              </Badge>
            </Group>

            <Text c="dimmed">
              {t("overview.demoCard.body")}
            </Text>

            <Button
              onClick={() => setCount((count) => count + 1)}
              fullWidth
              variant="filled"
            >
              {t("overview.demoCard.button", { count })}
            </Button>

            <Text size="sm" c="dimmed" ta="center">
              {t("overview.demoCard.hint")}
            </Text>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>{t("overview.progressCard.title")}</Text>

            <div>
              <Group justify="space-between" mb={5}>
                <Text size="sm">{t("overview.progressCard.frontend")}</Text>
                <Text size="sm" c="dimmed">
                  75%
                </Text>
              </Group>
              <Progress value={75} color="blue" size="sm" />
            </div>

            <div>
              <Group justify="space-between" mb={5}>
                <Text size="sm">{t("overview.progressCard.backend")}</Text>
                <Text size="sm" c="dimmed">
                  60%
                </Text>
              </Group>
              <Progress value={60} color="teal" size="sm" />
            </div>

            <div>
              <Group justify="space-between" mb={5}>
                <Text size="sm">{t("overview.progressCard.testing")}</Text>
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
                sections={progressSections}
                label={
                  <Text ta="center" size="sm" fw={700}>
                    {t("overview.progressCard.overall", { value: 58 })}
                  </Text>
                }
              />
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xs">
          <Text fw={500}>{t("overview.techStack.title")}</Text>
          <Group gap="xs">
            <Badge color="cyan">
              {t("overview.techStack.badges.react")}
            </Badge>
            <Badge color="violet">
              {t("overview.techStack.badges.typescript")}
            </Badge>
            <Badge color="blue">{t("overview.techStack.badges.vite")}</Badge>
            <Badge color="indigo">
              {t("overview.techStack.badges.mantine")}
            </Badge>
            <Badge color="pink">
              {t("overview.techStack.badges.font")}
            </Badge>
          </Group>
        </Stack>
      </Card> */}
    </Stack>
  );
};

export default DashboardPage;
