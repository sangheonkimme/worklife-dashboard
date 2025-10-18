import { Stack, Text, Card, Group, Divider, Tooltip, ActionIcon } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';
import type { TotalDeductions } from '@/types/salary';
import { formatCurrencyWithUnit } from '@/utils/salaryCalculator';

interface TaxBreakdownProps {
  deductions: TotalDeductions;
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

export function TaxBreakdown({ deductions }: TaxBreakdownProps) {
  return (
    <Stack gap="lg">
      <Text fw={700} size="lg">
        공제액 상세 내역
      </Text>

      {/* 4대 보험 상세 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>4대 보험 상세</Text>
            <Text fw={600} c="blue">
              {formatCurrencyWithUnit(deductions.insurance.total)}
            </Text>
          </Group>

          <Divider />

          <Stack gap="sm">
            <DeductionItem
              label="국민연금 (4.5%)"
              amount={deductions.insurance.nationalPension}
              tooltip="소득의 4.5%가 공제됩니다. (상한: 월 590만원)"
            />
            <DeductionItem
              label="건강보험 (3.545%)"
              amount={deductions.insurance.healthInsurance}
              tooltip="소득의 3.545%가 공제됩니다."
            />
            <DeductionItem
              label="장기요양보험료 (12.95%)"
              amount={deductions.insurance.longTermCare}
              tooltip="건강보험료의 12.95%가 추가로 공제됩니다."
            />
            <DeductionItem
              label="고용보험 (0.9%)"
              amount={deductions.insurance.employmentInsurance}
              tooltip="소득의 0.9%가 공제됩니다."
            />
          </Stack>
        </Stack>
      </Card>

      {/* 소득세 상세 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>소득세</Text>
            <Text fw={600} c="grape">
              {formatCurrencyWithUnit(deductions.tax.total)}
            </Text>
          </Group>

          <Divider />

          <Stack gap="sm">
            <DeductionItem
              label="소득세 (기본)"
              amount={deductions.tax.incomeTax}
              tooltip="간이세액표에 따라 계산됩니다. 부양가족 및 자녀 수에 따라 공제액이 조정됩니다."
            />
            {deductions.tax.incomeTaxReduction > 0 && (
              <Group justify="space-between" bg="violet.0" p="xs" style={{ borderRadius: 4 }}>
                <Group gap="xs">
                  <Text size="sm" c="violet" fw={600}>
                    중소기업 소득세 감면 (90%)
                  </Text>
                </Group>
                <Text size="sm" fw={600} c="violet">
                  -{formatCurrencyWithUnit(deductions.tax.incomeTaxReduction)}
                </Text>
              </Group>
            )}
            <DeductionItem
              label={deductions.tax.incomeTaxReduction > 0 ? "소득세 (감면 후)" : "소득세"}
              amount={deductions.tax.finalIncomeTax}
              tooltip={deductions.tax.incomeTaxReduction > 0
                ? "중소기업 취업자 감면이 적용된 최종 소득세입니다."
                : "간이세액표에 따라 계산됩니다. 부양가족 및 자녀 수에 따라 공제액이 조정됩니다."
              }
            />
            <DeductionItem
              label="지방소득세 (10%)"
              amount={deductions.tax.localIncomeTax}
              tooltip={deductions.tax.incomeTaxReduction > 0
                ? "감면 후 소득세의 10%가 추가로 공제됩니다."
                : "소득세의 10%가 추가로 공제됩니다."
              }
            />
          </Stack>
        </Stack>
      </Card>

      {/* 안내 문구 */}
      <Card padding="md" radius="md" bg="blue.0">
        <Text size="xs" c="dimmed" ta="center">
          * 실제 공제액은 회사 및 개인 상황에 따라 다를 수 있습니다.
        </Text>
        <Text size="xs" c="dimmed" ta="center" mt={4}>
          * 2025년 기준 세율이 적용되었습니다.
        </Text>
      </Card>
    </Stack>
  );
}
