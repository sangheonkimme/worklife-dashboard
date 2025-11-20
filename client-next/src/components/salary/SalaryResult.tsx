"use client";

import {
  Stack,
  Text,
  Card,
  Group,
  Divider,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { SalaryResult as SalaryResultType } from "@/types/salary";
import { formatCurrencyWithUnit } from "@/utils/salaryCalculator";

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
  const { t } = useTranslation("salary");
  // 금액이 0보다 큰 경우에만 실제 계산값 사용, 아니면 0으로 표시
  const isValidAmount = result.monthlyGrossSalary > 0;

  const displayResult = isValidAmount ? result : {
    monthlyGrossSalary: 0,
    monthlyNetSalary: 0,
    deductions: {
      insurance: {
        nationalPension: 0,
        healthInsurance: 0,
        longTermCare: 0,
        employmentInsurance: 0,
        total: 0,
      },
      tax: {
        incomeTax: 0,
        incomeTaxReduction: 0,
        finalIncomeTax: 0,
        localIncomeTax: 0,
        total: 0,
      },
      total: 0,
    },
  };

  return (
    <Stack gap="md">
      <Text fw={700} size="lg">
        {t("result.title")}
      </Text>

      {/* 지급내역 - 간소화 */}
      <Group
        justify="space-between"
        p="md"
        bg="gray.0"
        style={{ borderRadius: 8 }}
      >
        <div>
          <Text size="xs" c="dimmed" mb={4}>
            {t("result.earningsTitle")}
          </Text>
          <Text fw={600}>{t("result.monthlySalary")}</Text>
        </div>
        <Text fw={700} size="xl">
          {formatCurrencyWithUnit(displayResult.monthlyGrossSalary)}
        </Text>
      </Group>

      <Divider />

      {/* 공제내역 */}
      <Stack gap="md">
        <Text fw={600} size="md">
          {t("result.deductionsTitle")}
        </Text>

        {/* 4대 보험 상세 */}
        <div>
          <Group justify="space-between" mb="md">
            <Text fw={600}>{t("result.insuranceTitle")}</Text>
            <Text fw={600} c="blue">
              {formatCurrencyWithUnit(displayResult.deductions.insurance.total)}
            </Text>
          </Group>

          <Stack gap="sm">
            <DeductionItem
              label={t("deductions.nationalPension.label")}
              amount={displayResult.deductions.insurance.nationalPension}
              tooltip={t("deductions.nationalPension.tooltip")}
            />
            <DeductionItem
              label={t("deductions.healthInsurance.label")}
              amount={displayResult.deductions.insurance.healthInsurance}
              tooltip={t("deductions.healthInsurance.tooltip")}
            />
            <DeductionItem
              label={t("deductions.longTermCare.label")}
              amount={displayResult.deductions.insurance.longTermCare}
              tooltip={t("deductions.longTermCare.tooltip")}
            />
            <DeductionItem
              label={t("deductions.employmentInsurance.label")}
              amount={displayResult.deductions.insurance.employmentInsurance}
              tooltip={t("deductions.employmentInsurance.tooltip")}
            />
          </Stack>
        </div>

        <Divider />

        {/* 소득세 상세 */}
        <div>
          <Group justify="space-between" mb="md">
            <Text fw={600}>{t("result.taxTitle")}</Text>
            <Text fw={600} c="grape">
              {formatCurrencyWithUnit(displayResult.deductions.tax.total)}
            </Text>
          </Group>

          <Stack gap="sm">
            <DeductionItem
              label={t("deductions.taxBase.label")}
              amount={displayResult.deductions.tax.incomeTax}
              tooltip={t("deductions.taxBase.tooltip")}
            />
            {displayResult.deductions.tax.incomeTaxReduction > 0 && (
              <Group
                justify="space-between"
                bg="violet.0"
                p="xs"
                style={{ borderRadius: 4 }}
              >
                <Group gap="xs">
                  <Text size="sm" c="violet" fw={600}>
                    {t("deductions.smallCompanyReduction.label")}
                  </Text>
                </Group>
                <Text size="sm" fw={600} c="violet">
                  -
                  {formatCurrencyWithUnit(
                    displayResult.deductions.tax.incomeTaxReduction
                  )}
                </Text>
              </Group>
            )}
            <DeductionItem
              label={
                displayResult.deductions.tax.incomeTaxReduction > 0
                  ? t("deductions.taxFinal.label")
                  : t("deductions.taxDefault.label")
              }
              amount={displayResult.deductions.tax.finalIncomeTax}
              tooltip={
                displayResult.deductions.tax.incomeTaxReduction > 0
                  ? t("deductions.taxFinal.tooltip")
                  : t("deductions.taxDefault.tooltip")
              }
            />
            <DeductionItem
              label={t("deductions.localIncomeTax.label")}
              amount={displayResult.deductions.tax.localIncomeTax}
              tooltip={
                displayResult.deductions.tax.incomeTaxReduction > 0
                  ? t("deductions.localIncomeTax.tooltipReduced")
                  : t("deductions.localIncomeTax.tooltipDefault")
              }
            />
          </Stack>
        </div>

        <Divider />

        <Group justify="space-between">
          <Text fw={600}>{t("result.totalDeductions")}</Text>
          <Text fw={600} size="lg" c="red">
            {formatCurrencyWithUnit(displayResult.deductions.total)}
          </Text>
        </Group>

        {/* 안내 문구 */}
        <div
          style={{
            backgroundColor: "var(--mantine-color-blue-0)",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <Text size="xs" c="dimmed" ta="center">
            {t("result.notes.disclaimer")}
          </Text>
          <Text size="xs" c="dimmed" ta="center" mt={4}>
            {t("result.notes.rates")}
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
          backgroundColor: "#228be6",
          color: "white",
        }}
      >
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg" c="white">
            {t("result.netPayTitle")}
          </Text>
          <Text size="2rem" fw={700} c="white">
            {formatCurrencyWithUnit(displayResult.monthlyNetSalary)}
          </Text>
        </Group>
      </Card>
    </Stack>
  );
}
