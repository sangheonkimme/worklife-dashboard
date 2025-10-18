import { Stack, Text, Card, Group, Table, Divider, Tooltip, ActionIcon } from '@mantine/core';
import { IconHelp, IconMinus } from '@tabler/icons-react';
import type { SalaryResult as SalaryResultType } from '@/types/salary';
import { formatCurrencyWithUnit } from '@/utils/salaryCalculator';

interface SalaryResultProps {
  result: SalaryResultType;
}

interface DeductionItemProps {
  label: string;
  amount: number;
  tooltip?: string;
}

function DeductionItem({ label, amount, tooltip }: DeductionItemProps) {
  return (
    <Group justify="space-between">
      <Group gap="xs">
        <Text size="sm">{label}</Text>
        {tooltip && (
          <Tooltip label={tooltip} multiline w={220}>
            <ActionIcon variant="subtle" size="xs" color="gray">
              <IconHelp size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Text size="sm" fw={500}>
        {formatCurrencyWithUnit(amount)}
      </Text>
    </Group>
  );
}

export function SalaryResult({ result }: SalaryResultProps) {

  return (
    <Stack gap="lg">
      <Text fw={700} size="lg">
        급여명세서
      </Text>

      <Divider />

      {/* 지급내역 */}
      <Stack gap="md">
        <Text fw={600} size="md">
          지급내역
        </Text>
        
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>구분</Table.Th>
              <Table.Th>임금항목</Table.Th>
              <Table.Th ta="right">지급 금액</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>매월</Table.Td>
              <Table.Td>기본급</Table.Td>
              <Table.Td ta="right">{formatCurrencyWithUnit(result.monthlyGrossSalary)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>매월</Table.Td>
              <Table.Td>연장근로수당</Table.Td>
              <Table.Td ta="right">0 원</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        
        <Divider />
        
        <Group justify="space-between">
          <Text fw={600}>지급총액</Text>
          <Text fw={600} size="lg">{formatCurrencyWithUnit(result.monthlyGrossSalary)}</Text>
        </Group>
      </Stack>

      {/* 구분선과 간격 */}
      <div style={{ margin: '24px 0' }}>
        <Divider size="md" />
      </div>

      {/* 공제내역 */}
      <Stack gap="md">
        <Text fw={600} size="md">
          공제내역
        </Text>
        
        {/* 4대 보험 상세 */}
        <div>
          <Group justify="space-between" mb="md">
            <Text fw={600}>4대 보험</Text>
            <Text fw={600} c="blue">
              {formatCurrencyWithUnit(result.deductions.insurance.total)}
            </Text>
          </Group>

          <Stack gap="sm">
            <DeductionItem
              label="국민연금 (4.5%)"
              amount={result.deductions.insurance.nationalPension}
              tooltip="소득의 4.5%가 공제됩니다. (상한: 월 590만원)"
            />
            <DeductionItem
              label="건강보험 (3.545%)"
              amount={result.deductions.insurance.healthInsurance}
              tooltip="소득의 3.545%가 공제됩니다."
            />
            <DeductionItem
              label="장기요양보험료 (12.95%)"
              amount={result.deductions.insurance.longTermCare}
              tooltip="건강보험료의 12.95%가 추가로 공제됩니다."
            />
            <DeductionItem
              label="고용보험 (0.9%)"
              amount={result.deductions.insurance.employmentInsurance}
              tooltip="소득의 0.9%가 공제됩니다."
            />
          </Stack>
        </div>

        <Divider />

        {/* 소득세 상세 */}
        <div>
          <Group justify="space-between" mb="md">
            <Text fw={600}>소득세</Text>
            <Text fw={600} c="grape">
              {formatCurrencyWithUnit(result.deductions.tax.total)}
            </Text>
          </Group>

          <Stack gap="sm">
            <DeductionItem
              label="소득세 (기본)"
              amount={result.deductions.tax.incomeTax}
              tooltip="간이세액표에 따라 계산됩니다. 부양가족 및 자녀 수에 따라 공제액이 조정됩니다."
            />
            {result.deductions.tax.incomeTaxReduction > 0 && (
              <Group justify="space-between" bg="violet.0" p="xs" style={{ borderRadius: 4 }}>
                <Group gap="xs">
                  <Text size="sm" c="violet" fw={600}>
                    중소기업 소득세 감면 (90%)
                  </Text>
                </Group>
                <Text size="sm" fw={600} c="violet">
                  -{formatCurrencyWithUnit(result.deductions.tax.incomeTaxReduction)}
                </Text>
              </Group>
            )}
            <DeductionItem
              label={result.deductions.tax.incomeTaxReduction > 0 ? "소득세 (감면 후)" : "소득세"}
              amount={result.deductions.tax.finalIncomeTax}
              tooltip={result.deductions.tax.incomeTaxReduction > 0
                ? "중소기업 취업자 감면이 적용된 최종 소득세입니다."
                : "간이세액표에 따라 계산됩니다. 부양가족 및 자녀 수에 따라 공제액이 조정됩니다."
              }
            />
            <DeductionItem
              label="지방소득세 (10%)"
              amount={result.deductions.tax.localIncomeTax}
              tooltip={result.deductions.tax.incomeTaxReduction > 0
                ? "감면 후 소득세의 10%가 추가로 공제됩니다."
                : "소득세의 10%가 추가로 공제됩니다."
              }
            />
          </Stack>
        </div>
        
        <Divider />
        
        <Group justify="space-between">
          <Text fw={600}>공제총액</Text>
          <Text fw={600} size="lg" c="red">{formatCurrencyWithUnit(result.deductions.total)}</Text>
        </Group>

        {/* 안내 문구 */}
        <div style={{ backgroundColor: 'var(--mantine-color-blue-0)', padding: '12px', borderRadius: '8px' }}>
          <Text size="xs" c="dimmed" ta="center">
            * 실제 공제액은 회사 및 개인 상황에 따라 다를 수 있습니다.
          </Text>
          <Text size="xs" c="dimmed" ta="center" mt={4}>
            * 2025년 기준 세율이 적용되었습니다.
          </Text>
        </div>
      </Stack>

      {/* 실지급액 */}
      <Card
        shadow="md"
        padding="xl"
        radius="md"
        withBorder
        style={{
          backgroundColor: '#228be6',
          color: 'white',
        }}
      >
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg" c="white">
            실지급액
          </Text>
          <Text size="2rem" fw={700} c="white">
            {formatCurrencyWithUnit(result.monthlyNetSalary)}
          </Text>
        </Group>
      </Card>
    </Stack>
  );
}
