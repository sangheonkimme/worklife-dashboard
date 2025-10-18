import { useState, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Button,
  Card,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { SalaryInputForm } from "@/components/salary/SalaryInputForm";
import { SalaryResult } from "@/components/salary/SalaryResult";
import { TaxBreakdown } from "@/components/salary/TaxBreakdown";
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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* 헤더 */}
        <div>
          <Title order={2}>연봉 계산기</Title>
          <Text c="dimmed" size="sm" mt="xs">
            2025년 기준 세율로 실수령액을 계산합니다
          </Text>
        </div>

        {/* 메인 콘텐츠 - 2열 레이아웃 */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* 왼쪽: 입력 폼 */}
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <SalaryInputForm input={input} onChange={setInput} />
          </Card>

          {/* 오른쪽: 결과 표시 */}
          <Stack gap="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <SalaryResult result={result} />
            </Card>

            {/* 초기화 버튼 */}
            <Button
              variant="outline"
              leftSection={<IconRefresh size={16} />}
              onClick={handleReset}
              fullWidth
            >
              초기화
            </Button>
          </Stack>
        </SimpleGrid>

        {/* 세금 공제 상세 - 전체 너비 */}
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <TaxBreakdown deductions={result.deductions} />
        </Card>
      </Stack>
    </Container>
  );
}

export default SalaryCalculatorPage;
