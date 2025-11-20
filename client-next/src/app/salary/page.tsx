"use client";

import { useState, useMemo } from "react";
import { Container, Stack, SimpleGrid, Card } from "@mantine/core";
import { SalaryInputForm } from "@/components/salary/SalaryInputForm";
import { SalaryResult } from "@/components/salary/SalaryResult";
import type { SalaryInput } from "@/types/salary";
import { initialSalaryInput } from "@/types/salary";
import { calculateSalary } from "@/utils/salaryCalculator";

const SalaryPage = () => {
  const [input, setInput] = useState<SalaryInput>(initialSalaryInput);
  const result = useMemo(() => calculateSalary(input), [input]);

  const handleReset = () => {
    setInput(initialSalaryInput);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <SalaryInputForm
              input={input}
              onChange={setInput}
              onReset={handleReset}
            />
          </Card>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <SalaryResult result={result} />
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default SalaryPage;
