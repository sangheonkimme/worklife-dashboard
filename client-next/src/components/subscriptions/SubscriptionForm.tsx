import { useForm } from "@mantine/form";
import {
  Stack,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Group,
  Button,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type {
  BillingCycle,
  CreateSubscriptionDto,
  SubscriptionStatus,
  UpdateSubscriptionDto,
} from "@/types/subscription";

const billingCycleOptions: { value: BillingCycle; label: string }[] = [
  { value: "WEEKLY", label: "매주" },
  { value: "MONTHLY", label: "매월" },
  { value: "YEARLY", label: "매년" },
];

const statusOptions: { value: SubscriptionStatus; label: string }[] = [
  { value: "ACTIVE", label: "활성" },
  { value: "PAUSED", label: "일시중지" },
  { value: "CANCELLED", label: "취소" },
];

type FormValues = CreateSubscriptionDto | UpdateSubscriptionDto;

interface Props {
  initialValues?: Partial<CreateSubscriptionDto>;
  onSubmit: (values: FormValues) => void;
  loading?: boolean;
}

export const SubscriptionForm = ({
  initialValues,
  onSubmit,
  loading,
}: Props) => {
  const form = useForm<FormValues>({
    initialValues: {
      name: initialValues?.name || "",
      amount: initialValues?.amount || 0,
      billingCycle: initialValues?.billingCycle || "MONTHLY",
      nextBillingDate:
        initialValues?.nextBillingDate || new Date().toISOString(),
      paymentMethod: initialValues?.paymentMethod || "",
      category: initialValues?.category || "",
      status: initialValues?.status || "ACTIVE",
      notifyDaysBefore: initialValues?.notifyDaysBefore ?? 3,
      notes: initialValues?.notes || "",
    },
    validate: {
      name: (value) => (value ? null : "서비스명을 입력해주세요"),
      amount: (value) => (value > 0 ? null : "금액은 0보다 커야 합니다"),
      nextBillingDate: (value) => (value ? null : "다음 결제일을 입력해주세요"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="서비스명"
          placeholder="예) Netflix"
          required
          {...form.getInputProps("name")}
        />

        <NumberInput
          label="금액"
          placeholder="15,000"
          thousandSeparator=","
          min={0}
          required
          {...form.getInputProps("amount")}
        />

        <Group grow>
          <Select
            label="결제 주기"
            data={billingCycleOptions}
            required
            {...form.getInputProps("billingCycle")}
            onChange={(value) =>
              form.setFieldValue("billingCycle", value as BillingCycle)
            }
          />
          <DateInput
            label="다음 결제일"
            required
            value={
              form.values.nextBillingDate
                ? new Date(form.values.nextBillingDate)
                : null
            }
            onChange={(date) =>
              form.setFieldValue("nextBillingDate", date?.toISOString() || "")
            }
          />
        </Group>

        <Group grow>
          <TextInput
            label="결제 수단"
            placeholder="card_1234"
            {...form.getInputProps("paymentMethod")}
          />
          <TextInput
            label="카테고리"
            placeholder="엔터테인먼트"
            {...form.getInputProps("category")}
          />
        </Group>

        <Group grow>
          <Select
            label="상태"
            data={statusOptions}
            {...form.getInputProps("status")}
            onChange={(value) =>
              form.setFieldValue("status", value as SubscriptionStatus)
            }
          />
          <NumberInput
            label="알림 (일 전)"
            min={1}
            max={14}
            {...form.getInputProps("notifyDaysBefore")}
          />
        </Group>

        <Textarea label="메모" minRows={2} {...form.getInputProps("notes")} />

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            저장
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
