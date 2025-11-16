import {
  Stack,
  Grid,
  SimpleGrid,
} from "@mantine/core";
import { SalaryCalculatorCard } from "@/components/salary/SalaryCalculatorCard";
import { StickyNotes } from "@/components/dashboard/StickyNotes";
import { PomodoroTimerCard } from "@/components/dashboard/PomodoroTimerCard";
import { StopwatchCard } from "@/components/dashboard/StopwatchCard";
import { ImageToPdfCard } from "@/components/dashboard/ImageToPdfCard";
import { TimerCard } from "@/components/dashboard/TimerCard";
import { DashboardChecklist } from "@/components/dashboard/DashboardChecklist";

export const DashboardPage = () => {
  return (
    <Stack gap="lg">
      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <StickyNotes />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 3 }}>
          <DashboardChecklist />
        </Grid.Col>
      </Grid>
      <div>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          <SalaryCalculatorCard />
          <PomodoroTimerCard />
          <StopwatchCard />
          <ImageToPdfCard />
          <TimerCard />
        </SimpleGrid>
      </div>
    </Stack>
  );
};

export default DashboardPage;
