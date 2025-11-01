import { useState, useMemo } from "react";
import { Container, Stack, SimpleGrid, Card } from "@mantine/core";
import { SalaryInputForm } from "@/components/salary/SalaryInputForm";
import { SalaryResult } from "@/components/salary/SalaryResult";
import type { SalaryInput } from "@/types/salary";
import { initialSalaryInput } from "@/types/salary";
import { calculateSalary } from "@/utils/salaryCalculator";

export function SalaryCalculatorPage() {
  const [input, setInput] = useState<SalaryInput>(initialSalaryInput);

  // useMemo로 계산 결과 최적화
  const result = useMemo(() => calculateSalary(input), [input]);

  const handleReset = () => {
    setInput(initialSalaryInput);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* 메인 콘텐츠 - 2열 레이아웃 */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* 왼쪽: 입력 폼 */}
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <SalaryInputForm
              input={input}
              onChange={setInput}
              onReset={handleReset}
            />
          </Card>

          {/* 오른쪽: 결과 표시 */}
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <SalaryResult result={result} />
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default SalaryCalculatorPage;
