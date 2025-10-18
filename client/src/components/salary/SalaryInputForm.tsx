import {
  Stack,
  SegmentedControl,
  NumberInput,
  Text,
  Group,
  ActionIcon,
  Checkbox,
  Alert,
} from "@mantine/core";
import { IconMinus, IconPlus, IconHelp, IconInfoCircle } from "@tabler/icons-react";
import type { SalaryInput } from "@/types/salary";
import { NON_TAXABLE_MAX } from "@/utils/salaryCalculator";

interface SalaryInputFormProps {
  input: SalaryInput;
  onChange: (input: SalaryInput) => void;
}

export function SalaryInputForm({ input, onChange }: SalaryInputFormProps) {
  const handleChange = (field: keyof SalaryInput, value: string | number | boolean) => {
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
    if (field === "dependents" && currentValue <= 1) return; // 최소 1명 (본인)
    if (currentValue <= 0) return;

    onChange({
      ...input,
      [field]: currentValue - 1,
    });
  };

  return (
    <Stack gap="lg">
      <Text fw={700} size="lg">
        현재(희망)연봉 입력
      </Text>

      {/* 연봉/월급 선택 */}
      <div>
        <Text size="sm" fw={500} mb="xs">
          연봉/월급 선택
        </Text>
        <SegmentedControl
          fullWidth
          value={input.salaryType}
          onChange={(value) => handleChange("salaryType", value)}
          data={[
            { label: "연봉", value: "annual" },
            { label: "월급", value: "monthly" },
          ]}
          styles={{
            root: {
              backgroundColor: "var(--mantine-color-gray-1)",
            },
          }}
        />
      </div>

      {/* 퇴직금 선택 */}
      <div>
        <Group gap="xs" mb="xs">
          <Text size="sm" fw={500}>
            퇴직금
          </Text>
          <IconHelp size={16} color="var(--mantine-color-gray-6)" />
        </Group>
        <SegmentedControl
          fullWidth
          value={input.retirementType}
          onChange={(value) => handleChange("retirementType", value)}
          data={[
            { label: "별도", value: "separate" },
            { label: "포함", value: "included" },
          ]}
          styles={{
            root: {
              backgroundColor: "var(--mantine-color-gray-1)",
            },
          }}
        />
      </div>

      {/* 비과세액 */}
      <div>
        <Group gap="xs" mb="xs">
          <Text size="sm" fw={500}>
            비과세액(식대포함)
          </Text>
          <IconHelp size={16} color="var(--mantine-color-gray-6)" />
        </Group>
        <NumberInput
          value={input.nonTaxableAmount}
          onChange={(value) => {
            const numValue = Number(value) || 0;
            // 최대 20만원까지만 입력 가능
            const limitedValue = Math.min(numValue, NON_TAXABLE_MAX);
            handleChange("nonTaxableAmount", limitedValue);
          }}
          thousandSeparator=","
          suffix=" 원"
          min={0}
          max={NON_TAXABLE_MAX}
          hideControls
          styles={{
            input: {
              textAlign: "right",
            },
          }}
        />
        {input.nonTaxableAmount > 0 && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
            mt="xs"
            p="xs"
          >
            <Text size="xs">
              식대 비과세는 월 {NON_TAXABLE_MAX.toLocaleString()}원까지
              가능합니다.
              {input.nonTaxableAmount >= NON_TAXABLE_MAX && (
                <Text component="span" c="blue" fw={500}>
                  {" "}
                  (최대)
                </Text>
              )}
            </Text>
          </Alert>
        )}
      </div>

      {/* 부양가족수 */}
      <div>
        <Group gap="xs" mb="xs">
          <Text size="sm" fw={500}>
            부양가족수(본인포함)
          </Text>
          <IconHelp size={16} color="var(--mantine-color-gray-6)" />
        </Group>
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
            {input.dependents} 명
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

      {/* 8세 이상 20세 이하 자녀수 */}
      <div>
        <Group gap="xs" mb="xs">
          <Text size="sm" fw={500}>
            8세 이상 20세 이하 자녀수
          </Text>
          <IconHelp size={16} color="var(--mantine-color-gray-6)" />
        </Group>
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
            {input.childrenUnder20} 명
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

      {/* 중소기업 취업자 소득세 감면 */}
      <div>
        <Checkbox
          checked={input.isSmallCompany}
          onChange={(event) =>
            handleChange("isSmallCompany", event.currentTarget.checked)
          }
          label={
            <Group gap="xs">
              <Text size="sm" fw={500}>
                중소기업 취업자 소득세 감면
              </Text>
              <IconHelp size={16} color="var(--mantine-color-gray-6)" />
            </Group>
          }
        />
        {input.isSmallCompany && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="violet"
            variant="light"
            mt="xs"
            p="xs"
          >
            <Text size="xs">
              중소기업 취업자 (만 15~34세)는 소득세의 90%가 감면됩니다.
              <br />
              감면기간: 최대 5년, 지방소득세도 감면액 기준으로 감소합니다.
            </Text>
          </Alert>
        )}
      </div>

      {/* 연봉/월급 금액 입력 */}
      <div>
        <Text size="sm" fw={500} mb="xs">
          {input.salaryType === "annual" ? "연봉" : "월급"}
        </Text>
        <NumberInput
          value={input.amount}
          onChange={(value) => handleChange("amount", Number(value) || 0)}
          thousandSeparator=","
          prefix="예) "
          suffix=" 원"
          min={0}
          size="lg"
          hideControls
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
  );
}
