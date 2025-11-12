import { Stack, Text, Card, Group, Divider, Tooltip, ActionIcon } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('salary');
  return (
    <Stack gap="lg">
      <Text fw={700} size="lg">
        {t('breakdown.title')}
      </Text>

      {/* 4대 보험 상세 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>{t('breakdown.insuranceTitle')}</Text>
            <Text fw={600} c="blue">
              {formatCurrencyWithUnit(deductions.insurance.total)}
            </Text>
          </Group>

          <Divider />

          <Stack gap="sm">
            <DeductionItem
              label={t('deductions.nationalPension.label')}
              amount={deductions.insurance.nationalPension}
              tooltip={t('deductions.nationalPension.tooltip')}
            />
            <DeductionItem
              label={t('deductions.healthInsurance.label')}
              amount={deductions.insurance.healthInsurance}
              tooltip={t('deductions.healthInsurance.tooltip')}
            />
            <DeductionItem
              label={t('deductions.longTermCare.label')}
              amount={deductions.insurance.longTermCare}
              tooltip={t('deductions.longTermCare.tooltip')}
            />
            <DeductionItem
              label={t('deductions.employmentInsurance.label')}
              amount={deductions.insurance.employmentInsurance}
              tooltip={t('deductions.employmentInsurance.tooltip')}
            />
          </Stack>
        </Stack>
      </Card>

      {/* 소득세 상세 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>{t('breakdown.taxTitle')}</Text>
            <Text fw={600} c="grape">
              {formatCurrencyWithUnit(deductions.tax.total)}
            </Text>
          </Group>

          <Divider />

          <Stack gap="sm">
            <DeductionItem
              label={t('deductions.taxBase.label')}
              amount={deductions.tax.incomeTax}
              tooltip={t('deductions.taxBase.tooltip')}
            />
            {deductions.tax.incomeTaxReduction > 0 && (
              <Group justify="space-between" bg="violet.0" p="xs" style={{ borderRadius: 4 }}>
                <Group gap="xs">
                  <Text size="sm" c="violet" fw={600}>
                    {t('deductions.smallCompanyReduction.label')}
                  </Text>
                </Group>
                <Text size="sm" fw={600} c="violet">
                  -{formatCurrencyWithUnit(deductions.tax.incomeTaxReduction)}
                </Text>
              </Group>
            )}
            <DeductionItem
              label={
                deductions.tax.incomeTaxReduction > 0
                  ? t('deductions.taxFinal.label')
                  : t('deductions.taxDefault.label')
              }
              amount={deductions.tax.finalIncomeTax}
              tooltip={deductions.tax.incomeTaxReduction > 0
                ? t('deductions.taxFinal.tooltip')
                : t('deductions.taxDefault.tooltip')
              }
            />
            <DeductionItem
              label={t('deductions.localIncomeTax.label')}
              amount={deductions.tax.localIncomeTax}
              tooltip={deductions.tax.incomeTaxReduction > 0
                ? t('deductions.localIncomeTax.tooltipReduced')
                : t('deductions.localIncomeTax.tooltipDefault')
              }
            />
          </Stack>
        </Stack>
      </Card>

      {/* 안내 문구 */}
      <Card padding="md" radius="md" bg="blue.0">
        <Text size="xs" c="dimmed" ta="center">
          {t('breakdown.footnote1')}
        </Text>
        <Text size="xs" c="dimmed" ta="center" mt={4}>
          {t('breakdown.footnote2')}
        </Text>
      </Card>
    </Stack>
  );
}
