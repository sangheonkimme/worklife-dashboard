"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconCalculator, IconInfoCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { WidgetProps } from "@/types/widget";

type LoanRepaymentType = "amortized" | "equal_principal" | "interest_only";

interface LoanScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface LoanCalculationResult {
  schedule: LoanScheduleRow[];
  totalPayment: number;
  totalInterest: number;
  monthlyPayment: number;
  averagePayment: number;
}

export function LoanCalculatorWidget({ showHeader = true }: WidgetProps) {
  const { t, i18n } = useTranslation("widgets");
  const [loanAmount, setLoanAmount] = useState(100_000_000);
  const [annualRate, setAnnualRate] = useState(4.5);
  const [years, setYears] = useState(10);
  const [months, setMonths] = useState(0);
  const [graceMonths, setGraceMonths] = useState(0);
  const [repaymentType, setRepaymentType] = useState<LoanRepaymentType>(
    "amortized"
  );
  const [showAllRows, setShowAllRows] = useState(false);

  const totalMonths = useMemo(() => Math.max(0, years * 12 + months), [years, months]);
  const normalizedGrace = useMemo(() => {
    if (repaymentType === "interest_only") {
      return 0;
    }
    if (totalMonths <= 1) {
      return 0;
    }
    return Math.min(Math.max(graceMonths, 0), totalMonths - 1);
  }, [graceMonths, repaymentType, totalMonths]);

  const integerFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 0,
      }),
    [i18n.language]
  );

  const decimalFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 2,
      }),
    [i18n.language]
  );

  const formatCurrency = (value: number) =>
    `${integerFormatter.format(Math.round(value))}${t(
      "loanCalculator.units.currency"
    )}`;

  const formatPercent = (value: number) =>
    `${decimalFormatter.format(value)}${t("loanCalculator.units.percent")}`;

  const calculation = useMemo<LoanCalculationResult | null>(() => {
    if (loanAmount <= 0 || totalMonths <= 0) {
      return null;
    }

    const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0;
    const amortizationMonths =
      repaymentType === "interest_only"
        ? 0
        : Math.max(totalMonths - normalizedGrace, 0);

    if (repaymentType !== "interest_only" && amortizationMonths <= 0) {
      return null;
    }

    let remaining = loanAmount;
    const schedule: LoanScheduleRow[] = [];
    const amortizedPayment =
      repaymentType === "amortized" && amortizationMonths > 0
        ? monthlyRate === 0
          ? loanAmount / amortizationMonths
          : (loanAmount *
              monthlyRate *
              Math.pow(1 + monthlyRate, amortizationMonths)) /
            (Math.pow(1 + monthlyRate, amortizationMonths) - 1)
        : 0;
    const equalPrincipal =
      repaymentType === "equal_principal" && amortizationMonths > 0
        ? loanAmount / amortizationMonths
        : 0;

    for (let month = 1; month <= totalMonths; month += 1) {
      let interestPayment = monthlyRate * remaining;
      if (monthlyRate === 0) {
        interestPayment = 0;
      }

      let principalPayment = 0;
      let payment = 0;
      const isGraceMonth =
        repaymentType !== "interest_only" && month <= normalizedGrace;

      if (repaymentType === "interest_only") {
        if (month === totalMonths) {
          principalPayment = remaining;
        }
        payment = interestPayment + principalPayment;
      } else if (isGraceMonth) {
        payment = interestPayment;
      } else if (repaymentType === "amortized") {
        payment = amortizedPayment;
        principalPayment = payment - interestPayment;
      } else if (repaymentType === "equal_principal") {
        principalPayment = equalPrincipal;
        payment = principalPayment + interestPayment;
      }

      if (principalPayment > remaining) {
        principalPayment = remaining;
        payment = principalPayment + interestPayment;
      }

      remaining = Math.max(0, remaining - principalPayment);

      schedule.push({
        month,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: remaining,
      });
    }

    const totalPayment = schedule.reduce((sum, row) => sum + row.payment, 0);
    const totalInterest = schedule.reduce(
      (sum, row) => sum + row.interest,
      0
    );

    let representativeMonthlyPayment = 0;
    if (repaymentType === "amortized") {
      representativeMonthlyPayment = amortizedPayment;
    } else if (repaymentType === "equal_principal") {
      const firstAmortized = schedule.find(
        (row) => row.month > normalizedGrace
      );
      representativeMonthlyPayment = firstAmortized?.payment ?? 0;
    } else {
      representativeMonthlyPayment = schedule[0]?.payment ?? 0;
    }

    return {
      schedule,
      totalPayment,
      totalInterest,
      monthlyPayment: representativeMonthlyPayment,
      averagePayment: totalPayment / totalMonths,
    };
  }, [
    annualRate,
    loanAmount,
    normalizedGrace,
    repaymentType,
    totalMonths,
  ]);

  const repaymentOptions = useMemo(
    () => [
      {
        value: "amortized",
        label: t("loanCalculator.repaymentTypes.amortized"),
      },
      {
        value: "equal_principal",
        label: t("loanCalculator.repaymentTypes.equalPrincipal"),
      },
      {
        value: "interest_only",
        label: t("loanCalculator.repaymentTypes.interestOnly"),
      },
    ],
    [t]
  );

  const currentSchedule = calculation?.schedule ?? [];
  const visibleRows = showAllRows
    ? currentSchedule
    : currentSchedule.slice(0, 12);

  const invalidPeriod = totalMonths <= 0;

  const renderHeader = () => (
    <Group justify="space-between">
      <Group gap="xs">
        <ThemeIcon variant="light" color="teal">
          <IconCalculator size={18} />
        </ThemeIcon>
        <div>
          <Text fw={600}>{t("loanCalculator.title")}</Text>
          <Text size="sm" c="dimmed">
            {t("loanCalculator.subtitle")}
          </Text>
        </div>
      </Group>
      <Badge color="teal" variant="light">
        {t("loanCalculator.badge")}
      </Badge>
    </Group>
  );

  const summaryCards = calculation
    ? [
        {
          label: t("loanCalculator.results.monthlyPayment"),
          value: formatCurrency(calculation.monthlyPayment),
          description: repaymentType === "amortized"
            ? t("loanCalculator.results.fixedPayment")
            : t("loanCalculator.results.firstPayment"),
        },
        {
          label: t("loanCalculator.results.totalInterest"),
          value: formatCurrency(calculation.totalInterest),
          description: t("loanCalculator.results.totalInterestDesc"),
        },
        {
          label: t("loanCalculator.results.totalPayment"),
          value: formatCurrency(calculation.totalPayment),
          description: t("loanCalculator.results.totalPaymentDesc"),
        },
        {
          label: t("loanCalculator.results.averagePayment"),
          value: formatCurrency(calculation.averagePayment),
          description: t("loanCalculator.results.averagePaymentDesc"),
        },
      ]
    : [];

  return (
    <Stack gap="md">
      {showHeader && renderHeader()}

      <Card withBorder padding="md">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            {t("loanCalculator.sections.inputs")}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label={t("loanCalculator.fields.amount")}
              value={loanAmount}
              onChange={(value) => setLoanAmount(Number(value) || 0)}
              thousandSeparator="," 
              min={0}
              step={1_000_000}
              hideControls
              suffix={t("loanCalculator.units.currency")}
            />
            <NumberInput
              label={t("loanCalculator.fields.rate")}
              value={annualRate}
              onChange={(value) => setAnnualRate(Number(value) || 0)}
              decimalScale={2}
              min={0}
              max={25}
              step={0.05}
              hideControls
              suffix={t("loanCalculator.units.percent")}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            <NumberInput
              label={t("loanCalculator.fields.years")}
              value={years}
              onChange={(value) => setYears(Math.max(0, Number(value) || 0))}
              min={0}
              max={40}
              step={1}
              style={{ minWidth: 0 }}
            />
            <NumberInput
              label={t("loanCalculator.fields.months")}
              value={months}
              onChange={(value) =>
                setMonths(Math.min(11, Math.max(0, Number(value) || 0)))
              }
              min={0}
              max={11}
              step={1}
              style={{ minWidth: 0 }}
            />
            <Stack gap={4} style={{ minWidth: 0 }}>
              <NumberInput
                label={t("loanCalculator.fields.grace")}
                value={graceMonths}
                onChange={(value) =>
                  setGraceMonths(Math.max(0, Number(value) || 0))
                }
                min={0}
                max={Math.max(totalMonths - 1, 0)}
                step={1}
                disabled={repaymentType === "interest_only"}
              />
              <Text size="xs" c="dimmed">
                {t("loanCalculator.fields.graceHint")}
              </Text>
            </Stack>
          </SimpleGrid>

          <SegmentedControl
            value={repaymentType}
            onChange={(value) =>
              setRepaymentType(value as LoanRepaymentType)
            }
            data={repaymentOptions}
            fullWidth
          />
        </Stack>
      </Card>

      {invalidPeriod && (
        <Alert
          color="red"
          icon={<IconInfoCircle size={18} />}
          title={t("loanCalculator.messages.invalidTitle")}
        >
          {t("loanCalculator.messages.invalidPeriod")}
        </Alert>
      )}

      {calculation ? (
        <Card withBorder padding="md">
          <Stack gap="sm">
            <Text fw={600} size="sm">
              {t("loanCalculator.sections.results")}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              {summaryCards.map((item) => (
                <Card key={item.label} withBorder padding="sm">
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      {item.label}
                    </Text>
                    <Text fw={700} size="lg">
                      {item.value}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
            <Divider my="sm" />
            <Group gap="sm" wrap="wrap">
              <Badge color="gray" variant="light">
                {t("loanCalculator.summary.rate", {
                  rate: formatPercent(annualRate),
                })}
              </Badge>
              <Badge color="gray" variant="light">
                {t("loanCalculator.summary.period", {
                  months: totalMonths,
                })}
              </Badge>
              {normalizedGrace > 0 && (
                <Badge color="gray" variant="light">
                  {t("loanCalculator.summary.grace", {
                    months: normalizedGrace,
                  })}
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              {t("loanCalculator.notes.disclaimer")}
            </Text>
          </Stack>
        </Card>
      ) : (
        !invalidPeriod && (
          <Alert
            color="yellow"
            icon={<IconInfoCircle size={18} />}
            title={t("loanCalculator.messages.unavailableTitle")}
          >
            {t("loanCalculator.messages.unavailableBody")}
          </Alert>
        )
      )}

      {calculation && currentSchedule.length > 0 && (
        <Card withBorder padding="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <div>
                <Text fw={600} size="sm">
                  {t("loanCalculator.sections.schedule")}
                </Text>
                <Text size="xs" c="dimmed">
                  {t("loanCalculator.schedule.caption")}
                </Text>
              </div>
              <Button
                variant="light"
                size="xs"
                onClick={() => setShowAllRows((prev) => !prev)}
              >
                {showAllRows
                  ? t("loanCalculator.actions.showLess")
                  : t("loanCalculator.actions.showAll", {
                      count: currentSchedule.length,
                    })}
              </Button>
            </Group>
            <ScrollArea h={280} type="auto">
              <Table striped highlightOnHover withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("loanCalculator.schedule.month")}</Table.Th>
                    <Table.Th>{t("loanCalculator.schedule.payment")}</Table.Th>
                    <Table.Th>{t("loanCalculator.schedule.principal")}</Table.Th>
                    <Table.Th>{t("loanCalculator.schedule.interest")}</Table.Th>
                    <Table.Th>{t("loanCalculator.schedule.balance")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {visibleRows.map((row) => (
                    <Table.Tr key={row.month}>
                      <Table.Td>#{row.month}</Table.Td>
                      <Table.Td>{formatCurrency(row.payment)}</Table.Td>
                      <Table.Td>{formatCurrency(row.principal)}</Table.Td>
                      <Table.Td>{formatCurrency(row.interest)}</Table.Td>
                      <Table.Td>{formatCurrency(row.balance)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            {currentSchedule.length > 12 && !showAllRows && (
              <Text size="xs" c="dimmed">
                {t("loanCalculator.schedule.moreHint", {
                  remaining: currentSchedule.length - 12,
                })}
              </Text>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
