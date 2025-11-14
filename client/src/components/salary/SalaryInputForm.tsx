import {
  Stack,
  SegmentedControl,
  NumberInput,
  Text,
  Group,
  ActionIcon,
  Checkbox,
  Card,
} from "@mantine/core";
import { IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { SalaryInput } from "@/types/salary";

interface SalaryInputFormProps {
  input: SalaryInput;
  onChange: (input: SalaryInput) => void;
  onReset: () => void;
}

export function SalaryInputForm({ input, onChange, onReset }: SalaryInputFormProps) {
  const { t } = useTranslation("salary");
  const handleChange = (
    field: keyof SalaryInput,
    value: string | number | boolean
  ) => {
    onChange({
      ...input,
      [field]: value,
    });
  };

  const incrementValue = (field: "dependents" | "childrenUnder20") => {
    onChange({
      ...input,
      [field]: input[field] + 1,
    });
  };

  const decrementValue = (field: "dependents" | "childrenUnder20") => {
    const currentValue = input[field];
    if (field === "dependents" && currentValue <= 1) return; // minimum 1 (self)
    if (currentValue <= 0) return;

    onChange({
      ...input,
      [field]: currentValue - 1,
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text fw={700} size="lg">
          {t("input.title")}
        </Text>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onReset}
          title={t("input.reset")}
        >
          <IconRefresh size={20} />
        </ActionIcon>
      </Group>

      {/* 기본 정보 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          {/* 연봉/월급 선택 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {t("input.salaryType")}
            </Text>
            <SegmentedControl
              fullWidth
              value={input.salaryType}
              onChange={(value) => handleChange("salaryType", value)}
              data={[
                {
                  label: t("input.salaryTypeOptions.annual"),
                  value: "annual",
                },
                {
                  label: t("input.salaryTypeOptions.monthly"),
                  value: "monthly",
                },
              ]}
            />
          </div>

          {/* 금액 입력 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {t(`input.amountLabel.${input.salaryType}`)}
            </Text>
            <NumberInput
              value={input.amount}
              onChange={(value) => handleChange("amount", Number(value) || 0)}
              thousandSeparator=","
              suffix={t("input.currencySuffix")}
              min={0}
              size="lg"
              hideControls
              placeholder={t("input.amountPlaceholder")}
              styles={{
                input: {
                  textAlign: "right",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                },
              }}
            />
          </div>
        </Stack>
      </Card>

      {/* 추가 옵션 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={500} c="dimmed">
            {t("input.optionsTitle")}
          </Text>

          {/* 퇴직금 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {t("input.retirement.label")}
            </Text>
            <SegmentedControl
              fullWidth
              value={input.retirementType}
              onChange={(value) => handleChange("retirementType", value)}
              data={[
                {
                  label: t("input.retirement.separate"),
                  value: "separate",
                },
                {
                  label: t("input.retirement.included"),
                  value: "included",
                },
              ]}
            />
          </div>

          {/* 비과세액 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {t("input.nonTaxable.label")}
            </Text>
            <NumberInput
              value={input.nonTaxableAmount}
              onChange={(value) =>
                handleChange("nonTaxableAmount", Number(value) || 0)
              }
              thousandSeparator=","
              suffix={t("input.currencySuffix")}
              min={0}
              hideControls
              placeholder={t("input.nonTaxable.placeholder")}
              styles={{
                input: {
                  textAlign: "right",
                },
              }}
            />
            {input.nonTaxableAmount > 0 && (
              <Text size="xs" c="dimmed" mt="xs">
                {t("input.nonTaxable.monthly", {
                  amount: Math.floor(input.nonTaxableAmount / 12).toLocaleString(),
                })}
              </Text>
            )}
          </div>

          {/* 부양가족수 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {t("input.dependents.label")}
            </Text>
            <Group justify="center" gap="md">
              <ActionIcon
                size="lg"
                variant="light"
                onClick={() => decrementValue("dependents")}
                disabled={input.dependents <= 1}
              >
                <IconMinus size={18} />
              </ActionIcon>
              <Text size="xl" fw={500} w={60} ta="center">
                {t("input.dependents.unit", { count: input.dependents })}
              </Text>
              <ActionIcon
                size="lg"
                variant="light"
                onClick={() => incrementValue("dependents")}
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Group>
          </div>

          {/* 자녀수 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {t("input.children.label")}
            </Text>
            <Group justify="center" gap="md">
              <ActionIcon
                size="lg"
                variant="light"
                onClick={() => decrementValue("childrenUnder20")}
                disabled={input.childrenUnder20 <= 0}
              >
                <IconMinus size={18} />
              </ActionIcon>
              <Text size="xl" fw={500} w={60} ta="center">
                {t("input.children.unit", { count: input.childrenUnder20 })}
              </Text>
              <ActionIcon
                size="lg"
                variant="light"
                onClick={() => incrementValue("childrenUnder20")}
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Group>
          </div>

          {/* 중소기업 감면 */}
          <div>
            <Checkbox
              checked={input.isSmallCompany}
              onChange={(event) =>
                handleChange("isSmallCompany", event.currentTarget.checked)
              }
              label={t("input.smallCompany")}
            />
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
