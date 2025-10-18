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
import { IconMinus, IconPlus } from "@tabler/icons-react";
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
    <Stack gap="md">
      <Text fw={700} size="lg">
        급여 정보 입력
      </Text>

      {/* 기본 정보 */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
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
            />
          </div>

          {/* 금액 입력 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {input.salaryType === "annual" ? "연봉" : "월급"}
            </Text>
            <NumberInput
              value={input.amount}
              onChange={(value) => handleChange("amount", Number(value) || 0)}
              thousandSeparator=","
              suffix=" 원"
              min={0}
              size="lg"
              hideControls
              placeholder="금액을 입력하세요"
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
            추가 옵션
          </Text>

          {/* 퇴직금 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              퇴직금
            </Text>
            <SegmentedControl
              fullWidth
              value={input.retirementType}
              onChange={(value) => handleChange("retirementType", value)}
              data={[
                { label: "별도", value: "separate" },
                { label: "포함", value: "included" },
              ]}
            />
          </div>

          {/* 비과세액 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              비과세액 (식대 포함)
            </Text>
            <NumberInput
              value={input.nonTaxableAmount}
              onChange={(value) => {
                const numValue = Number(value) || 0;
                const limitedValue = Math.min(numValue, NON_TAXABLE_MAX);
                handleChange("nonTaxableAmount", limitedValue);
              }}
              thousandSeparator=","
              suffix=" 원"
              min={0}
              max={NON_TAXABLE_MAX}
              hideControls
              placeholder="최대 200,000원"
              styles={{
                input: {
                  textAlign: "right",
                },
              }}
            />
          </div>

          {/* 부양가족수 */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              부양가족수 (본인 포함)
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
                {input.dependents}명
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
              8세 이상 20세 이하 자녀수
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
                {input.childrenUnder20}명
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
              label="중소기업 취업자 소득세 감면"
            />
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
