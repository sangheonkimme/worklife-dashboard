"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconCheck, IconRefresh, IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { UserSettings } from "@/types/userSettings";
import { PageHeader } from "@/components/setting/PageHeader";
import { SectionNavigator } from "@/components/setting/SectionNavigator";
import { FinanceSection } from "@/components/setting/FinanceSection";
import { LocaleSection } from "@/components/setting/LocaleSection";
import { AppearanceSection } from "@/components/setting/AppearanceSection";
import { TimerSection } from "@/components/setting/TimerSection";
import { NotificationsSection } from "@/components/setting/NotificationsSection";
import { SettingsActionBar } from "@/components/setting/SettingsActionBar";
import type { SettingsFormValues } from "@/components/setting/types";
import {
  MAX_TIMER_DURATION_MS,
  minutesToMilliseconds,
  minutesToSeconds,
} from "@/components/setting/utils";

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

const getTimezoneOptions = () => {
  if (typeof Intl !== "undefined" && Intl.supportedValuesOf) {
    try {
      return (Intl.supportedValuesOf("timeZone") as string[]).map((tz) => ({
        label: tz,
        value: tz,
      }));
    } catch {
      return FALLBACK_TIMEZONES.map((tz) => ({ label: tz, value: tz }));
    }
  }
  return FALLBACK_TIMEZONES.map((tz) => ({ label: tz, value: tz }));
};

const createDefaultSettings = (): UserSettings => ({
  locale: "ko-KR",
  language: "system",
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

const validateSettingsValues = (
  values: SettingsFormValues,
  translate: (key: string) => string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (values.finance.payday < 1 || values.finance.payday > 31) {
    errors["finance.payday"] = translate("validation.finance.payday");
  }
  if (!values.finance.currency) {
    errors["finance.currency"] = translate("validation.finance.currency");
  }
  if (!values.timezone) {
    errors["timezone"] = translate("validation.timezone");
  }
  if (!values.locale) {
    errors["locale"] = translate("validation.locale");
  }
  if (!values.language) {
    errors["language"] = translate("validation.language");
  }
  if (!values.timers.presets.length) {
    errors["timers.presets"] = translate("validation.timers.presetRequired");
  } else if (values.timers.presets.length > 6) {
    errors["timers.presets"] = translate("validation.timers.presetLimit");
  } else if (
    values.timers.presets.some(
      (ms) => ms < minutesToMilliseconds(1) || ms > MAX_TIMER_DURATION_MS
    )
  ) {
    errors["timers.presets"] = translate("validation.timers.presetRange");
  }

  if (
    values.pomodoro.focusDuration < 60 ||
    values.pomodoro.focusDuration > 3600
  ) {
    errors["pomodoro.focusDuration"] = translate(
      "validation.pomodoro.focusDuration"
    );
  }
  if (
    values.pomodoro.shortBreakDuration < 60 ||
    values.pomodoro.shortBreakDuration > 1800
  ) {
    errors["pomodoro.shortBreakDuration"] = translate(
      "validation.pomodoro.shortBreakDuration"
    );
  }
  if (
    values.pomodoro.longBreakDuration < 300 ||
    values.pomodoro.longBreakDuration > 3600
  ) {
    errors["pomodoro.longBreakDuration"] = translate(
      "validation.pomodoro.longBreakDuration"
    );
  }
  if (
    values.pomodoro.longBreakInterval < 1 ||
    values.pomodoro.longBreakInterval > 8
  ) {
    errors["pomodoro.longBreakInterval"] = translate(
      "validation.pomodoro.longBreakInterval"
    );
  }
  if (values.pomodoro.soundVolume < 0 || values.pomodoro.soundVolume > 100) {
    errors["pomodoro.soundVolume"] = translate(
      "validation.pomodoro.soundVolume"
    );
  }
  if (
    values.stopwatch.defaultGoalTime !== null &&
    (values.stopwatch.defaultGoalTime < minutesToMilliseconds(1) ||
      values.stopwatch.defaultGoalTime > MAX_TIMER_DURATION_MS)
  ) {
    errors["stopwatch.defaultGoalTime"] = translate(
      "validation.stopwatch.goalTime"
    );
  }

  return errors;
};

const SettingsPageClient = () => {
  const { t } = useTranslation(["settings", "common"]);
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

  const form = useForm<
    SettingsFormValues,
    (values: SettingsFormValues) => SettingsFormValues
  >({
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
    const validationErrors = validateSettingsValues(values, (key) =>
      t(`settings:${key}`)
    );
    if (Object.keys(validationErrors).length > 0) {
      form.setErrors(validationErrors);
      notifications.show({
        color: "yellow",
        title: t("common:notifications.validation.title"),
        message: t("common:notifications.validation.message"),
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
        title: t("common:notifications.saveSuccess.title"),
        message: t("common:notifications.saveSuccess.message"),
        icon: <IconCheck size={18} />,
      });
    } catch (submitError) {
      notifications.show({
        color: "red",
        title: t("settings:page.saveErrorTitle"),
        message:
          submitError instanceof Error
            ? submitError.message
            : t("settings:page.saveErrorMessage"),
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

  const isLoading =
    (!initialized && status === "loading") || (!settings && isFetching);
  const hasError = status === "error" && !!settingsError;
  const isDirty = form.isDirty();

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <PageHeader
            title={t("settings:page.title")}
            description={t("settings:page.description")}
          />
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
          title={t("settings:page.title")}
          description={t("settings:page.description")}
          lastSavedAt={lastSavedAt}
        />

        <SectionNavigator />

        {hasError && (
          <Paper
            withBorder
            shadow="xs"
            p="md"
            radius="md"
            bg="var(--mantine-color-red-0)"
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600}>{t("common:errors.settingsFetchTitle")}</Text>
                <Text size="sm" c="dimmed">
                  {settingsError ?? t("settings:page.errorDescription")}
                </Text>
              </div>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconRefresh size={14} />}
                onClick={() => refetch()}
              >
                {t("common:actions.retry")}
              </Button>
            </Group>
          </Paper>
        )}

        <form id="user-settings-form" onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <FinanceSection form={form} locale={form.values.locale} />
            <LocaleSection form={form} timezoneOptions={timezoneOptions} />
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

export default SettingsPageClient;
