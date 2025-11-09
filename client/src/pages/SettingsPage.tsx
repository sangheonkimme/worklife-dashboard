import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Affix,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Slider,
  Stack,
  Switch,
  Text,
  Title,
  SegmentedControl,
  rem,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCheck, IconRefresh, IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import type { UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { UserSettings, WidgetDockPosition } from "@/types/userSettings";

export type SettingsFormValues = UserSettings;
export type SettingsForm = UseFormReturnType<
  SettingsFormValues,
  (values: SettingsFormValues) => SettingsFormValues
>;

const CURRENCY_OPTIONS = [
  { label: "대한민국 원 (KRW)", value: "KRW" },
  { label: "미국 달러 (USD)", value: "USD" },
  { label: "일본 엔 (JPY)", value: "JPY" },
  { label: "유로 (EUR)", value: "EUR" },
  { label: "싱가포르 달러 (SGD)", value: "SGD" },
];

const LOCALE_OPTIONS = [
  { label: "한국어 (ko-KR)", value: "ko-KR" },
  { label: "English (en-US)", value: "en-US" },
  { label: "日本語 (ja-JP)", value: "ja-JP" },
  { label: "Deutsch (de-DE)", value: "de-DE" },
];

const FALLBACK_TIMEZONES = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
];

export const getTimezoneOptions = () => {
  if (typeof Intl !== "undefined" && (Intl as any).supportedValuesOf) {
    try {
      return ((Intl as any).supportedValuesOf("timeZone") as string[]).map((tz) => ({
        label: tz,
        value: tz,
      }));
    } catch {
      return FALLBACK_TIMEZONES.map((tz) => ({ label: tz, value: tz }));
    }
  }
  return FALLBACK_TIMEZONES.map((tz) => ({ label: tz, value: tz }));
};

const minutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;
const millisecondsToMinutes = (milliseconds: number) =>
  Math.round(milliseconds / 1000 / 60);

const minutesToSeconds = (minutes: number) => minutes * 60;
const secondsToMinutes = (seconds: number) => Math.round(seconds / 60);

const hoursToMilliseconds = (hours: number) => hours * 60 * 60 * 1000;

const MAX_TIMER_DURATION_MS = hoursToMilliseconds(24);

export const createDefaultSettings = (): UserSettings => ({
  locale: "ko-KR",
  timezone:
    typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Asia/Seoul",
  finance: {
    payday: 25,
    currency: "KRW",
    weekStartsOn: 1,
  },
  appearance: {
    colorScheme: "system",
    sidebarPinned: true,
    widgetDockPosition: "right",
    widgetAutoClose: true,
  },
  timers: {
    presets: [5, 10, 15].map((min) => minutesToMilliseconds(min)),
    autoRepeat: false,
    preAlertMs: minutesToMilliseconds(1),
    notifications: true,
    soundEnabled: true,
  },
  pomodoro: {
    focusDuration: minutesToSeconds(25),
    shortBreakDuration: minutesToSeconds(5),
    longBreakDuration: minutesToSeconds(15),
    longBreakInterval: 4,
    autoStartBreak: false,
    autoStartFocus: false,
    soundEnabled: true,
    soundVolume: 60,
    notificationEnabled: true,
  },
  stopwatch: {
    defaultGoalTime: minutesToMilliseconds(30),
    notificationsEnabled: true,
  },
  notifications: {
    transactions: true,
    monthlyReport: true,
    checklist: true,
  },
});

export const SECTION_META = [
  { id: "finance", label: "재무 기본값" },
  { id: "locale", label: "지역 & 언어" },
  { id: "appearance", label: "테마 & 레이아웃" },
  { id: "timers", label: "타이머 & 집중" },
  { id: "notifications", label: "알림" },
];

const validateSettingsValues = (values: SettingsFormValues): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (values.finance.payday < 1 || values.finance.payday > 31) {
    errors["finance.payday"] = "월급일은 1~31 사이여야 합니다.";
  }
  if (!values.finance.currency) {
    errors["finance.currency"] = "통화를 선택해주세요.";
  }
  if (!values.timezone) {
    errors["timezone"] = "시간대를 선택해주세요.";
  }
  if (!values.locale) {
    errors["locale"] = "언어를 선택해주세요.";
  }
  if (!values.timers.presets.length) {
    errors["timers.presets"] = "최소 1개 이상의 프리셋을 등록해주세요.";
  } else if (values.timers.presets.length > 6) {
    errors["timers.presets"] = "프리셋은 최대 6개까지 등록할 수 있어요.";
  } else if (
    values.timers.presets.some(
      (ms) => ms < minutesToMilliseconds(1) || ms > MAX_TIMER_DURATION_MS
    )
  ) {
    errors["timers.presets"] = "프리셋은 1분 이상, 24시간 이하로만 설정할 수 있어요.";
  }

  if (values.pomodoro.focusDuration < 60 || values.pomodoro.focusDuration > 3600) {
    errors["pomodoro.focusDuration"] = "집중 시간은 1~60분(60~3600초) 범위여야 합니다.";
  }
  if (
    values.pomodoro.shortBreakDuration < 60 ||
    values.pomodoro.shortBreakDuration > 1800
  ) {
    errors["pomodoro.shortBreakDuration"] = "휴식 시간은 1~30분 사이여야 합니다.";
  }
  if (
    values.pomodoro.longBreakDuration < 300 ||
    values.pomodoro.longBreakDuration > 3600
  ) {
    errors["pomodoro.longBreakDuration"] = "롱 브레이크는 5~60분 범위여야 합니다.";
  }
  if (values.pomodoro.longBreakInterval < 1 || values.pomodoro.longBreakInterval > 8) {
    errors["pomodoro.longBreakInterval"] = "롱 브레이크 주기는 1~8 사이여야 합니다.";
  }
  if (values.pomodoro.soundVolume < 0 || values.pomodoro.soundVolume > 100) {
    errors["pomodoro.soundVolume"] = "볼륨은 0~100 사이여야 합니다.";
  }
  if (
    values.stopwatch.defaultGoalTime !== null &&
    (values.stopwatch.defaultGoalTime < minutesToMilliseconds(1) ||
      values.stopwatch.defaultGoalTime > MAX_TIMER_DURATION_MS)
  ) {
    errors["stopwatch.defaultGoalTime"] =
      "목표 시간은 1분 이상, 24시간 이하여야 합니다.";
  }

  return errors;
};

export const SettingsPage = () => {
  const {
    settings,
    initialized,
    status,
    error: settingsError,
    isFetching,
    isUpdating,
    updateSettings,
    refetch,
  } = useUserSettings();

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);
  const initialValues = useMemo(
    () => settings ?? createDefaultSettings(),
    [settings]
  );

  const form = useForm<SettingsFormValues, (values: SettingsFormValues) => SettingsFormValues>({
    initialValues,
  });

  useEffect(() => {
    if (settings) {
      form.setValues(settings);
      form.resetDirty(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSubmit = async (values: SettingsFormValues) => {
    const validationErrors = validateSettingsValues(values);
    if (Object.keys(validationErrors).length > 0) {
      form.setErrors(validationErrors);
      notifications.show({
        color: "yellow",
        title: "입력을 확인해주세요",
        message: "일부 필드에 잘못된 값이 있습니다. 안내 메시지를 확인해주세요.",
      });
      return;
    }

    try {
      const updated = await updateSettings(values);
      form.clearErrors();
      form.resetDirty(updated);
      setLastSavedAt(new Date());
      notifications.show({
        color: "green",
        title: "저장 완료",
        message: "설정이 저장되었습니다.",
        icon: <IconCheck size={18} />,
      });
    } catch (submitError) {
      notifications.show({
        color: "red",
        title: "저장 실패",
        message:
          submitError instanceof Error
            ? submitError.message
            : "설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
        icon: <IconX size={18} />,
      });
    }
  };

  const handleReset = () => {
    if (!settings) return;
    form.setValues(settings);
    form.resetDirty(settings);
    form.clearErrors();
  };

  const isLoading = (!initialized && status === "loading") || (!settings && isFetching);
  const hasError = status === "error" && !!settingsError;
  const isDirty = form.isDirty();

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <PageHeader title="환경설정" description="계정 전역에서 사용하는 기본값을 관리하세요." />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} radius="md" withBorder shadow="sm" padding="lg">
                <Skeleton height={24} width="40%" mb="md" />
                <Stack gap="sm">
                  <Skeleton height={20} radius="sm" />
                  <Skeleton height={20} radius="sm" />
                  <Skeleton height={20} radius="sm" />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" id="settings-page">
      <Stack gap="lg">
        <PageHeader
          title="환경설정"
          description="급여 주기, 통화, 테마, 타이머 기본값 등을 한 곳에서 관리하세요."
          lastSavedAt={lastSavedAt}
        />

        <SectionNavigator />

        {hasError && (
          <Paper withBorder shadow="xs" p="md" radius="md" bg="var(--mantine-color-red-0)">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600}>설정을 불러오지 못했어요</Text>
                <Text size="sm" c="dimmed">
                  {settingsError}
                </Text>
              </div>
              <Button size="xs" variant="light" leftSection={<IconRefresh size={14} />} onClick={() => refetch()}>
                다시 시도
              </Button>
            </Group>
          </Paper>
        )}

        <form id="user-settings-form" onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <FinanceSection form={form} locale={form.values.locale} />
            <LocaleSection
              form={form}
              timezoneOptions={timezoneOptions}
            />
            <AppearanceSection form={form} />
            <TimerSection form={form} />
            <NotificationsSection form={form} />
          </Stack>
        </form>
      </Stack>

      <SettingsActionBar
        isDirty={isDirty}
        isSubmitting={isUpdating}
        onReset={handleReset}
        formId="user-settings-form"
      />
    </Container>
  );
};

interface PageHeaderProps {
  title: string;
  description: string;
  lastSavedAt?: Date | null;
}

const PageHeader = ({ title, description, lastSavedAt }: PageHeaderProps) => {
  return (
    <Stack gap={4}>
      <div>
        <Title order={2}>{title}</Title>
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      </div>
      {lastSavedAt && (
        <Text size="xs" c="dimmed">
          마지막 저장: {dayjs(lastSavedAt).format("YYYY.MM.DD HH:mm:ss")}
        </Text>
      )}
    </Stack>
  );
};

const SectionNavigator = () => (
  <Group gap="xs">
    {SECTION_META.map((section) => (
      <Button
        key={section.id}
        component="a"
        href={`#${section.id}`}
        variant="subtle"
        size="xs"
        radius="xl"
      >
        {section.label}
      </Button>
    ))}
  </Group>
);

interface SectionCardProps {
  id: string;
  title: string;
  description: string;
  dirty?: boolean;
  children: React.ReactNode;
}

const SectionCard = ({ id, title, description, dirty, children }: SectionCardProps) => (
  <Card id={id} withBorder shadow="sm" radius="lg" padding="xl" component="section">
    <Group justify="space-between" align="flex-start" mb="lg">
      <div>
        <Title order={4}>{title}</Title>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </div>
      {dirty && (
        <Badge color="blue" variant="light">
          수정됨
        </Badge>
      )}
    </Group>
    {children}
  </Card>
);

export const FinanceSection = ({
  form,
  locale,
}: {
  form: SettingsForm;
  locale: string;
}) => {
  const weekOptions = [
    { label: "일요일", value: "0" },
    { label: "월요일", value: "1" },
    { label: "토요일", value: "6" },
  ];

  const currencyPreview = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale || "ko-KR", {
        style: "currency",
        currency: form.values.finance.currency,
      }).format(1234567);
    } catch {
      return "지원되지 않는 통화 형식입니다.";
    }
  }, [form.values.finance.currency, locale]);

  const dirty =
    form.isDirty("finance.payday") ||
    form.isDirty("finance.currency") ||
    form.isDirty("finance.weekStartsOn");

  return (
    <SectionCard
      id="finance"
      title="재무 기본값"
      description="거래 및 통계 위젯에 적용될 월급일, 통화, 주 시작 요일을 지정합니다."
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <NumberInput
          label="월급일"
          description="1~31일 중 선택"
          min={1}
          max={31}
          withAsterisk
          {...form.getInputProps("finance.payday")}
        />
        <Select
          label="기본 통화"
          searchable
          withAsterisk
          data={CURRENCY_OPTIONS}
          {...form.getInputProps("finance.currency")}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="lg">
        <Stack gap={8}>
          <Text fw={500} size="sm">
            주 시작 요일
          </Text>
          <SegmentedControl
            value={String(form.values.finance.weekStartsOn)}
            onChange={(value) =>
              form.setFieldValue("finance.weekStartsOn", Number(value))
            }
            data={weekOptions}
          />
        </Stack>
        <Paper withBorder radius="md" p="md">
          <Text size="sm" c="dimmed" mb={4}>
            통화 포맷 미리보기
          </Text>
          <Text fw={600}>{currencyPreview}</Text>
        </Paper>
      </SimpleGrid>
    </SectionCard>
  );
};

export const LocaleSection = ({
  form,
  timezoneOptions,
}: {
  form: SettingsForm;
  timezoneOptions: { label: string; value: string }[];
}) => {
  const dirty =
    form.isDirty("timezone") ||
    form.isDirty("locale");

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(form.values.locale || "ko-KR", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: form.values.timezone,
      }).format(new Date());
    } catch {
      return dayjs().format("YYYY.MM.DD HH:mm");
    }
  }, [form.values.locale, form.values.timezone]);

  return (
    <SectionCard
      id="locale"
      title="지역 & 언어"
      description="시간대와 언어를 지정해 날짜, 통화 등의 표기에 반영합니다."
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Select
          label="시간대"
          searchable
          withAsterisk
          nothingFoundMessage="검색 결과가 없습니다"
          data={timezoneOptions}
          {...form.getInputProps("timezone")}
        />
        <Select
          label="서비스 언어"
          searchable
          withAsterisk
          data={LOCALE_OPTIONS}
          {...form.getInputProps("locale")}
        />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="lg">
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" c="dimmed">
              날짜/시간 미리보기
            </Text>
            <Text fw={600}>{formattedDate}</Text>
          </div>
        </Group>
      </Paper>
    </SectionCard>
  );
};

export const AppearanceSection = ({
  form,
}: {
  form: SettingsForm;
}) => {
  const dirty =
    form.isDirty("appearance.colorScheme") ||
    form.isDirty("appearance.sidebarPinned") ||
    form.isDirty("appearance.widgetDockPosition") ||
    form.isDirty("appearance.widgetAutoClose");

  const dockPosition = form.values.appearance.widgetDockPosition;

  return (
    <SectionCard
      id="appearance"
      title="테마 & 레이아웃"
      description="전역 색상 모드와 사이드바, 위젯 독 기본 상태를 관리합니다."
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Stack gap={8}>
          <Text fw={500} size="sm">
            컬러 스킴
          </Text>
          <SegmentedControl
            value={form.values.appearance.colorScheme}
            onChange={(value) =>
              form.setFieldValue("appearance.colorScheme", value as SettingsFormValues["appearance"]["colorScheme"])
            }
            data={[
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
              { label: "System", value: "system" },
            ]}
          />
        </Stack>

        <Stack gap="xs">
          <Switch
            label="사이드바 고정"
            description="로그인 시 자동으로 펼쳐진 상태를 유지합니다."
            checked={form.values.appearance.sidebarPinned}
            onChange={(event) =>
              form.setFieldValue("appearance.sidebarPinned", event.currentTarget.checked)
            }
          />
          <Switch
            label="위젯 자동 닫힘"
            description="다른 위젯을 열면 기존 위젯을 닫습니다."
            checked={form.values.appearance.widgetAutoClose}
            onChange={(event) =>
              form.setFieldValue("appearance.widgetAutoClose", event.currentTarget.checked)
            }
          />
        </Stack>
      </SimpleGrid>

      <Divider my="lg" />

      <Stack gap="xs">
        <Text fw={500} size="sm">
          위젯 독 위치
        </Text>
        <SegmentedControl
          value={dockPosition}
          onChange={(value) =>
            form.setFieldValue("appearance.widgetDockPosition", value as WidgetDockPosition)
          }
          data={[
            { label: "좌측", value: "left" },
            { label: "우측", value: "right" },
          ]}
        />
      </Stack>
    </SectionCard>
  );
};

export const TimerSection = ({
  form,
}: {
  form: SettingsForm;
}) => {
  const [newPresetMinutes, setNewPresetMinutes] = useState<number | "">("");
  const dirty =
    form.isDirty("timers") ||
    form.isDirty("pomodoro") ||
    form.isDirty("stopwatch");

  const addPreset = () => {
    if (newPresetMinutes === "" || newPresetMinutes <= 0) return;
    const milliseconds = minutesToMilliseconds(Number(newPresetMinutes));
    if (milliseconds > MAX_TIMER_DURATION_MS) {
      notifications.show({
        color: "yellow",
        title: "프리셋 제한",
        message: "프리셋은 24시간을 초과할 수 없습니다.",
      });
      return;
    }
    const exists = form.values.timers.presets.includes(milliseconds);
    if (exists) {
      notifications.show({
        color: "yellow",
        title: "중복 프리셋",
        message: "이미 동일한 프리셋이 존재합니다.",
      });
      return;
    }
    if (form.values.timers.presets.length >= 6) {
      notifications.show({
        color: "yellow",
        title: "프리셋 한도",
        message: "프리셋은 최대 6개까지 추가할 수 있어요.",
      });
      return;
    }
    form.setFieldValue("timers.presets", [...form.values.timers.presets, milliseconds].sort((a, b) => a - b));
    setNewPresetMinutes("");
  };

  const removePreset = (value: number) => {
    const next = form.values.timers.presets.filter((preset) => preset !== value);
    form.setFieldValue("timers.presets", next);
  };

  const timerPresets = form.values.timers.presets;

  return (
    <SectionCard
      id="timers"
      title="타이머 & 집중 도구"
      description="일반 타이머, 포모도로, 스톱워치 기본값을 설정해 기기마다 동일하게 사용합니다."
      dirty={dirty}
    >
      <Stack gap="lg">
        <div>
          <Group justify="space-between">
            <div>
              <Text fw={600}>일반 타이머</Text>
              <Text size="sm" c="dimmed">
                프리셋과 알림 기본 옵션을 관리합니다.
              </Text>
            </div>
          </Group>
          <Stack gap="sm" mt="sm">
            <Group gap="xs">
              {timerPresets.map((preset) => (
                <Badge
                  key={preset}
                  radius="xl"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => removePreset(preset)}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  }
                >
                  {millisecondsToMinutes(preset)}분
                </Badge>
              ))}
            </Group>
            <Group grow>
              <NumberInput
                label="새 프리셋 (분)"
                min={1}
                max={24 * 60}
                value={newPresetMinutes}
                onChange={(value) => setNewPresetMinutes(value === "" ? "" : Number(value))}
              />
              <Button mt="xl" variant="light" onClick={addPreset}>
                추가
              </Button>
            </Group>
            {form.errors["timers.presets"] && (
              <Text size="xs" c="red">
                {form.errors["timers.presets"]}
              </Text>
            )}
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="lg">
            <Switch
              label="자동 반복"
              description="완료 후 즉시 다음 타이머를 시작합니다."
              checked={form.values.timers.autoRepeat}
              onChange={(event) =>
                form.setFieldValue("timers.autoRepeat", event.currentTarget.checked)
              }
            />
            <Switch
              label="알림 활성화"
              description="타이머 완료 시 브라우저 알림을 표시합니다."
              checked={form.values.timers.notifications}
              onChange={(event) =>
                form.setFieldValue("timers.notifications", event.currentTarget.checked)
              }
            />
            <Switch
              label="사운드 활성화"
              description="완료 시 사운드를 재생합니다."
              checked={form.values.timers.soundEnabled}
              onChange={(event) =>
                form.setFieldValue("timers.soundEnabled", event.currentTarget.checked)
              }
            />
            <NumberInput
              label="사전 알림 (분)"
              description="완료 전에 알려줄 시간을 분 단위로 지정합니다."
              min={0}
              max={60}
              value={form.values.timers.preAlertMs ? millisecondsToMinutes(form.values.timers.preAlertMs) : 0}
              onChange={(value) =>
                form.setFieldValue(
                  "timers.preAlertMs",
                  value === null ? null : minutesToMilliseconds(Number(value))
                )
              }
            />
          </SimpleGrid>
        </div>

        <Divider />

        <div>
          <Group justify="space-between">
            <div>
              <Text fw={600}>포모도로</Text>
              <Text size="sm" c="dimmed">
                집중/휴식 길이와 자동 시작, 알림 옵션을 설정합니다.
              </Text>
            </div>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mt="md">
            <NumberInput
              label="집중 시간 (분)"
              min={1}
              max={60}
              value={secondsToMinutes(form.values.pomodoro.focusDuration)}
              onChange={(value) =>
                form.setFieldValue("pomodoro.focusDuration", minutesToSeconds(Number(value) || 0))
              }
            />
            <NumberInput
              label="짧은 휴식 (분)"
              min={1}
              max={30}
              value={secondsToMinutes(form.values.pomodoro.shortBreakDuration)}
              onChange={(value) =>
                form.setFieldValue("pomodoro.shortBreakDuration", minutesToSeconds(Number(value) || 0))
              }
            />
            <NumberInput
              label="긴 휴식 (분)"
              min={5}
              max={60}
              value={secondsToMinutes(form.values.pomodoro.longBreakDuration)}
              onChange={(value) =>
                form.setFieldValue("pomodoro.longBreakDuration", minutesToSeconds(Number(value) || 0))
              }
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <NumberInput
              label="롱 브레이크 주기"
              description="몇 번째 세션마다 긴 휴식을 진행할지"
              min={1}
              max={8}
              {...form.getInputProps("pomodoro.longBreakInterval")}
            />
            <Stack gap="xs">
              <Switch
                label="집중 종료 후 자동으로 휴식 시작"
                checked={form.values.pomodoro.autoStartBreak}
                onChange={(event) =>
                  form.setFieldValue("pomodoro.autoStartBreak", event.currentTarget.checked)
                }
              />
              <Switch
                label="휴식 종료 후 자동으로 집중 시작"
                checked={form.values.pomodoro.autoStartFocus}
                onChange={(event) =>
                  form.setFieldValue("pomodoro.autoStartFocus", event.currentTarget.checked)
                }
              />
            </Stack>
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <Switch
              label="알림 활성화"
              checked={form.values.pomodoro.notificationEnabled}
              onChange={(event) =>
                form.setFieldValue("pomodoro.notificationEnabled", event.currentTarget.checked)
              }
            />
            <Switch
              label="사운드 활성화"
              checked={form.values.pomodoro.soundEnabled}
              onChange={(event) =>
                form.setFieldValue("pomodoro.soundEnabled", event.currentTarget.checked)
              }
            />
          </SimpleGrid>
          <Box mt="md">
            <Text fw={500} size="sm" mb="xs">
              사운드 볼륨
            </Text>
            <Slider
              value={form.values.pomodoro.soundVolume}
              onChange={(value) => form.setFieldValue("pomodoro.soundVolume", value)}
              label={(value) => `${value}%`}
              marks={[
                { value: 0, label: "0%" },
                { value: 50, label: "50%" },
                { value: 100, label: "100%" },
              ]}
            />
          </Box>
        </div>

        <Divider />

        <div>
          <Group justify="space-between">
            <div>
              <Text fw={600}>스톱워치</Text>
              <Text size="sm" c="dimmed">
                목표 시간과 알림 여부를 지정합니다.
              </Text>
            </div>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <NumberInput
              label="기본 목표 시간 (분)"
              description="0으로 설정하면 목표 시간을 사용하지 않습니다."
              min={0}
              max={24 * 60}
              value={
                form.values.stopwatch.defaultGoalTime
                  ? millisecondsToMinutes(form.values.stopwatch.defaultGoalTime)
                  : 0
              }
              onChange={(value) => {
                if (!value || Number(value) === 0) {
                  form.setFieldValue("stopwatch.defaultGoalTime", null);
                  return;
                }
                form.setFieldValue(
                  "stopwatch.defaultGoalTime",
                  minutesToMilliseconds(Number(value))
                );
              }}
            />
            <Switch
              label="목표 도달 알림 수신"
              checked={form.values.stopwatch.notificationsEnabled}
              onChange={(event) =>
                form.setFieldValue(
                  "stopwatch.notificationsEnabled",
                  event.currentTarget.checked
                )
              }
            />
          </SimpleGrid>
        </div>
      </Stack>
    </SectionCard>
  );
};

export const NotificationsSection = ({
  form,
}: {
  form: SettingsForm;
}) => {
  const dirty =
    form.isDirty("notifications.transactions") ||
    form.isDirty("notifications.monthlyReport") ||
    form.isDirty("notifications.checklist");

  return (
    <SectionCard
      id="notifications"
      title="알림"
      description="서비스에서 제공하는 주요 알림을 제어합니다."
      dirty={dirty}
    >
      <Stack gap="sm">
        <Switch
          label="거래 알림"
          description="거래 동기화 및 이상 패턴 발견 시 알림"
          checked={form.values.notifications.transactions}
          onChange={(event) =>
            form.setFieldValue("notifications.transactions", event.currentTarget.checked)
          }
        />
        <Switch
          label="월간 리포트 이메일"
          description="매월 첫째 주 월요일 오전에 리포트를 발송합니다."
          checked={form.values.notifications.monthlyReport}
          onChange={(event) =>
            form.setFieldValue("notifications.monthlyReport", event.currentTarget.checked)
          }
        />
        <Switch
          label="대시보드 체크리스트 알림"
          description="체크리스트 또는 타이머 완료 알림을 받습니다."
          checked={form.values.notifications.checklist}
          onChange={(event) =>
            form.setFieldValue("notifications.checklist", event.currentTarget.checked)
          }
        />
      </Stack>
    </SectionCard>
  );
};

interface SettingsActionBarProps {
  isDirty: boolean;
  isSubmitting: boolean;
  onReset: () => void;
  formId: string;
}

const SettingsActionBar = ({
  isDirty,
  isSubmitting,
  onReset,
  formId,
}: SettingsActionBarProps) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <Affix
      position={
        isDesktop
          ? { top: 120, right: 32 }
          : { bottom: 16, left: 0, right: 0 }
      }
      withinPortal={false}
      style={
        isDesktop
          ? undefined
          : {
              width: "100%",
              paddingLeft: rem(16),
              paddingRight: rem(16),
            }
      }
    >
      <Paper
        withBorder
        radius="lg"
        shadow="md"
        p="md"
        style={{
          minWidth: isDesktop ? 320 : "100%",
          backgroundColor: "var(--mantine-color-body)",
        }}
      >
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" fw={600}>
              {isDirty ? "저장되지 않은 변경 사항이 있어요" : "모든 변경 사항이 저장되었습니다"}
            </Text>
            <Text size="xs" c="dimmed">
              {isDirty ? "페이지를 떠나기 전에 저장하세요." : "필요 시 설정을 수정할 수 있어요."}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              disabled={!isDirty || isSubmitting}
              onClick={onReset}
              leftSection={<IconRefresh size={14} />}
            >
              되돌리기
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={!isDirty}
              loading={isSubmitting}
            >
              저장
            </Button>
          </Group>
        </Group>
      </Paper>
    </Affix>
  );
};
