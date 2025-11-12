import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import type {
  LanguagePreference,
  UserSettings,
  WidgetDockPosition,
} from "@/types/userSettings";

export type SettingsFormValues = UserSettings;
export type SettingsForm = UseFormReturnType<
  SettingsFormValues,
  (values: SettingsFormValues) => SettingsFormValues
>;

const LANGUAGE_VALUES: LanguagePreference[] = ["system", "ko", "en"];
const SECTION_IDS = ["finance", "locale", "appearance", "timers", "notifications"] as const;

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

  if (values.pomodoro.focusDuration < 60 || values.pomodoro.focusDuration > 3600) {
    errors["pomodoro.focusDuration"] = translate("validation.pomodoro.focusDuration");
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
  if (values.pomodoro.longBreakInterval < 1 || values.pomodoro.longBreakInterval > 8) {
    errors["pomodoro.longBreakInterval"] = translate(
      "validation.pomodoro.longBreakInterval"
    );
  }
  if (values.pomodoro.soundVolume < 0 || values.pomodoro.soundVolume > 100) {
    errors["pomodoro.soundVolume"] = translate("validation.pomodoro.soundVolume");
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

export const SettingsPage = () => {
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
  const currencyOptions = useMemo(
    () => [
      { label: t("settings:finance.currencyOptions.KRW"), value: "KRW" },
      { label: t("settings:finance.currencyOptions.USD"), value: "USD" },
      { label: t("settings:finance.currencyOptions.JPY"), value: "JPY" },
      { label: t("settings:finance.currencyOptions.EUR"), value: "EUR" },
      { label: t("settings:finance.currencyOptions.SGD"), value: "SGD" },
    ],
    [t]
  );
  const formatLocaleOptions = useMemo(
    () => [
      { label: t("settings:locale.formatLocaleOptions.ko-KR"), value: "ko-KR" },
      { label: t("settings:locale.formatLocaleOptions.en-US"), value: "en-US" },
      { label: t("settings:locale.formatLocaleOptions.ja-JP"), value: "ja-JP" },
      { label: t("settings:locale.formatLocaleOptions.de-DE"), value: "de-DE" },
    ],
    [t]
  );
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
    const validationErrors = validateSettingsValues(values, (key) => t(`settings:${key}`));
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

  const isLoading = (!initialized && status === "loading") || (!settings && isFetching);
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
          <Paper withBorder shadow="xs" p="md" radius="md" bg="var(--mantine-color-red-0)">
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
  const { t } = useTranslation('settings');
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
          {t("settings:status.lastSaved", {
            timestamp: dayjs(lastSavedAt).format("YYYY.MM.DD HH:mm:ss"),
          })}
        </Text>
      )}
    </Stack>
  );
};

const SectionNavigator = () => {
  const { t } = useTranslation("settings");
  return (
    <Group gap="xs">
      {SECTION_IDS.map((sectionId) => (
        <Button
          key={sectionId}
          component="a"
          href={`#${sectionId}`}
          variant="subtle"
          size="xs"
          radius="xl"
        >
          {t(`sections.${sectionId}.label`)}
        </Button>
      ))}
    </Group>
  );
};

interface SectionCardProps {
  id: string;
  title: string;
  description: string;
  dirty?: boolean;
  children: React.ReactNode;
}

const SectionCard = ({ id, title, description, dirty, children }: SectionCardProps) => {
  const { t } = useTranslation('settings');
  return (
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
            {t('status.modified')}
          </Badge>
        )}
      </Group>
      {children}
    </Card>
  );
};

export const FinanceSection = ({
  form,
  locale,
}: {
  form: SettingsForm;
  locale: string;
}) => {
  const { t } = useTranslation("settings");
  const weekOptions = useMemo(
    () => [
      { label: t("finance.weekdays.0"), value: "0" },
      { label: t("finance.weekdays.1"), value: "1" },
      { label: t("finance.weekdays.6"), value: "6" },
    ],
    [t]
  );

  const currencyPreview = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale || "ko-KR", {
        style: "currency",
        currency: form.values.finance.currency,
      }).format(1234567);
    } catch {
      return t("finance.currencyFormatError");
    }
  }, [form.values.finance.currency, locale]);

  const dirty =
    form.isDirty("finance.payday") ||
    form.isDirty("finance.currency") ||
    form.isDirty("finance.weekStartsOn");

  return (
    <SectionCard
      id="finance"
      title={t("sections.finance.title")}
      description={t("sections.finance.description")}
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <NumberInput
          label={t("finance.fields.payday.label")}
          description={t("finance.fields.payday.description")}
          min={1}
          max={31}
          withAsterisk
          {...form.getInputProps("finance.payday")}
        />
        <Select
          label={t("finance.fields.currency.label")}
          searchable
          withAsterisk
          data={currencyOptions}
          {...form.getInputProps("finance.currency")}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="lg">
        <Stack gap={8}>
          <Text fw={500} size="sm">
            {t("finance.fields.weekStartsOn")}
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
            {t("finance.fields.preview")}
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
  const { t } = useTranslation("settings");
  const dirty =
    form.isDirty("timezone") ||
    form.isDirty("locale") ||
    form.isDirty("language");

  const languageOptions = LANGUAGE_VALUES.map((value) => ({
    value,
    label: t(`locale.languageOptions.${value}`),
  }));

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
      title={t("sections.locale.title")}
      description={t("sections.locale.description")}
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Select
          label={t("locale.timezoneLabel")}
          searchable
          withAsterisk
          nothingFoundMessage={t("locale.noResults")}
          data={timezoneOptions}
          {...form.getInputProps("timezone")}
        />
        <Select
          label={t("locale.serviceLanguageLabel")}
          description={t("locale.serviceLanguageDescription")}
          searchable
          withAsterisk
          data={languageOptions}
          {...form.getInputProps("language")}
        />
        <Select
          label={t("locale.formatLocaleLabel")}
          description={t("locale.formatLocaleDescription")}
          searchable
          withAsterisk
          data={formatLocaleOptions}
          {...form.getInputProps("locale")}
        />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="lg">
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" c="dimmed">
              {t("locale.previewLabel")}
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
  const { t } = useTranslation("settings");
  const dirty =
    form.isDirty("appearance.colorScheme") ||
    form.isDirty("appearance.sidebarPinned") ||
    form.isDirty("appearance.widgetDockPosition") ||
    form.isDirty("appearance.widgetAutoClose");

  const dockPosition = form.values.appearance.widgetDockPosition;

  return (
    <SectionCard
      id="appearance"
      title={t("sections.appearance.title")}
      description={t("sections.appearance.description")}
      dirty={dirty}
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Stack gap={8}>
          <Text fw={500} size="sm">
            {t('appearanceSettings.fields.colorScheme')}
          </Text>
          <SegmentedControl
            value={form.values.appearance.colorScheme}
            onChange={(value) =>
              form.setFieldValue("appearance.colorScheme", value as SettingsFormValues["appearance"]["colorScheme"])
            }
            data={[
              { label: t('appearanceSettings.colorSchemeOptions.light'), value: "light" },
              { label: t('appearanceSettings.colorSchemeOptions.dark'), value: "dark" },
              { label: t('appearanceSettings.colorSchemeOptions.system'), value: "system" },
            ]}
          />
        </Stack>

        <Stack gap="xs">
          <Switch
            label={t('appearanceSettings.fields.sidebarPinned.label')}
            description={t('appearanceSettings.fields.sidebarPinned.description')}
            checked={form.values.appearance.sidebarPinned}
            onChange={(event) =>
              form.setFieldValue("appearance.sidebarPinned", event.currentTarget.checked)
            }
          />
          <Switch
            label={t('appearanceSettings.fields.widgetAutoClose.label')}
            description={t('appearanceSettings.fields.widgetAutoClose.description')}
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
          {t('appearanceSettings.fields.dockPosition')}
        </Text>
        <SegmentedControl
          value={dockPosition}
          onChange={(value) =>
            form.setFieldValue("appearance.widgetDockPosition", value as WidgetDockPosition)
          }
          data={[
            { label: t('appearanceSettings.dockOptions.left'), value: "left" },
            { label: t('appearanceSettings.dockOptions.right'), value: "right" },
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
  const { t } = useTranslation("settings");
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
        title: t('timersSection.alerts.presetTooLong.title'),
        message: t('timersSection.alerts.presetTooLong.message'),
      });
      return;
    }
    const exists = form.values.timers.presets.includes(milliseconds);
    if (exists) {
      notifications.show({
        color: "yellow",
        title: t('timersSection.alerts.duplicatePreset.title'),
        message: t('timersSection.alerts.duplicatePreset.message'),
      });
      return;
    }
    if (form.values.timers.presets.length >= 6) {
      notifications.show({
        color: "yellow",
        title: t('timersSection.alerts.maxPresets.title'),
        message: t('timersSection.alerts.maxPresets.message'),
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
      title={t("sections.timers.title")}
      description={t("sections.timers.description")}
      dirty={dirty}
    >
      <Stack gap="lg">
        <div>
          <Group justify="space-between">
            <div>
              <Text fw={600}>{t('timersSection.timerCard.title')}</Text>
              <Text size="sm" c="dimmed">
                {t('timersSection.timerCard.description')}
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
                  {t('timersSection.timerCard.presetDisplay', {
                    minutes: millisecondsToMinutes(preset),
                  })}
                </Badge>
              ))}
            </Group>
            <Group grow>
              <NumberInput
                label={t('timersSection.timerCard.fields.presetLabel')}
                min={1}
                max={24 * 60}
                value={newPresetMinutes}
                onChange={(value) => setNewPresetMinutes(value === "" ? "" : Number(value))}
              />
              <Button mt="xl" variant="light" onClick={addPreset}>
                {t('timersSection.timerCard.fields.addButton')}
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
              label={t('timersSection.timerCard.fields.autoRepeat.label')}
              description={t('timersSection.timerCard.fields.autoRepeat.description')}
              checked={form.values.timers.autoRepeat}
              onChange={(event) =>
                form.setFieldValue("timers.autoRepeat", event.currentTarget.checked)
              }
            />
            <Switch
              label={t('timersSection.timerCard.fields.notifications.label')}
              description={t('timersSection.timerCard.fields.notifications.description')}
              checked={form.values.timers.notifications}
              onChange={(event) =>
                form.setFieldValue("timers.notifications", event.currentTarget.checked)
              }
            />
            <Switch
              label={t('timersSection.timerCard.fields.sound.label')}
              description={t('timersSection.timerCard.fields.sound.description')}
              checked={form.values.timers.soundEnabled}
              onChange={(event) =>
                form.setFieldValue("timers.soundEnabled", event.currentTarget.checked)
              }
            />
            <NumberInput
              label={t('timersSection.timerCard.fields.preAlert.label')}
              description={t('timersSection.timerCard.fields.preAlert.description')}
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
              <Text fw={600}>{t('timersSection.pomodoroCard.title')}</Text>
              <Text size="sm" c="dimmed">
                {t('timersSection.pomodoroCard.description')}
              </Text>
            </div>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mt="md">
            <NumberInput
              label={t('timersSection.pomodoroCard.fields.focus')}
              min={1}
              max={60}
              value={secondsToMinutes(form.values.pomodoro.focusDuration)}
              onChange={(value) =>
                form.setFieldValue("pomodoro.focusDuration", minutesToSeconds(Number(value) || 0))
              }
            />
            <NumberInput
              label={t('timersSection.pomodoroCard.fields.shortBreak')}
              min={1}
              max={30}
              value={secondsToMinutes(form.values.pomodoro.shortBreakDuration)}
              onChange={(value) =>
                form.setFieldValue("pomodoro.shortBreakDuration", minutesToSeconds(Number(value) || 0))
              }
            />
            <NumberInput
              label={t('timersSection.pomodoroCard.fields.longBreak')}
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
              label={t('timersSection.pomodoroCard.fields.longBreakInterval.label')}
              description={t('timersSection.pomodoroCard.fields.longBreakInterval.description')}
              min={1}
              max={8}
              {...form.getInputProps("pomodoro.longBreakInterval")}
            />
            <Stack gap="xs">
              <Switch
                label={t('timersSection.pomodoroCard.fields.autoStartBreak')}
                checked={form.values.pomodoro.autoStartBreak}
                onChange={(event) =>
                  form.setFieldValue("pomodoro.autoStartBreak", event.currentTarget.checked)
                }
              />
              <Switch
                label={t('timersSection.pomodoroCard.fields.autoStartFocus')}
                checked={form.values.pomodoro.autoStartFocus}
                onChange={(event) =>
                  form.setFieldValue("pomodoro.autoStartFocus", event.currentTarget.checked)
                }
              />
            </Stack>
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <Switch
              label={t('timersSection.pomodoroCard.fields.notifications')}
              checked={form.values.pomodoro.notificationEnabled}
              onChange={(event) =>
                form.setFieldValue("pomodoro.notificationEnabled", event.currentTarget.checked)
              }
            />
            <Switch
              label={t('timersSection.pomodoroCard.fields.sound')}
              checked={form.values.pomodoro.soundEnabled}
              onChange={(event) =>
                form.setFieldValue("pomodoro.soundEnabled", event.currentTarget.checked)
              }
            />
          </SimpleGrid>
          <Box mt="md">
            <Text fw={500} size="sm" mb="xs">
              {t('timersSection.pomodoroCard.fields.soundVolume')}
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
              <Text fw={600}>{t('timersSection.stopwatchCard.title')}</Text>
              <Text size="sm" c="dimmed">
                {t('timersSection.stopwatchCard.description')}
              </Text>
            </div>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <NumberInput
              label={t('timersSection.stopwatchCard.fields.goalTime.label')}
              description={t('timersSection.stopwatchCard.fields.goalTime.description')}
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
              label={t('timersSection.stopwatchCard.fields.notifications')}
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
  const { t } = useTranslation("settings");
  const dirty =
    form.isDirty("notifications.transactions") ||
    form.isDirty("notifications.monthlyReport") ||
    form.isDirty("notifications.checklist");

  return (
    <SectionCard
      id="notifications"
      title={t("sections.notifications.title")}
      description={t("sections.notifications.description")}
      dirty={dirty}
    >
      <Stack gap="sm">
        <Switch
          label={t('notificationsSection.transactions.label')}
          description={t('notificationsSection.transactions.description')}
          checked={form.values.notifications.transactions}
          onChange={(event) =>
            form.setFieldValue("notifications.transactions", event.currentTarget.checked)
          }
        />
        <Switch
          label={t('notificationsSection.monthlyReport.label')}
          description={t('notificationsSection.monthlyReport.description')}
          checked={form.values.notifications.monthlyReport}
          onChange={(event) =>
            form.setFieldValue("notifications.monthlyReport", event.currentTarget.checked)
          }
        />
        <Switch
          label={t('notificationsSection.checklist.label')}
          description={t('notificationsSection.checklist.description')}
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
  const { t } = useTranslation("common");
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
              {isDirty ? t("status.unsaved") : t("status.allSaved")}
            </Text>
            <Text size="xs" c="dimmed">
              {isDirty ? t("status.unsavedHint") : t("status.allSavedHint")}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              disabled={!isDirty || isSubmitting}
              onClick={onReset}
              leftSection={<IconRefresh size={14} />}
            >
              {t("actions.reset")}
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={!isDirty}
              loading={isSubmitting}
            >
              {t("actions.saveChanges")}
            </Button>
          </Group>
        </Group>
      </Paper>
    </Affix>
  );
};
