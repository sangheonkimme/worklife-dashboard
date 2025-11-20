"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  NumberInput,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { SectionCard } from "./SectionCard";
import type { SettingsForm } from "./types";
import {
  MAX_TIMER_DURATION_MS,
  millisecondsToMinutes,
  minutesToMilliseconds,
  minutesToSeconds,
  secondsToMinutes,
} from "./utils";

interface TimerSectionProps {
  form: SettingsForm;
}

export const TimerSection = ({ form }: TimerSectionProps) => {
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
        title: t("timersSection.alerts.presetTooLong.title"),
        message: t("timersSection.alerts.presetTooLong.message"),
      });
      return;
    }
    const exists = form.values.timers.presets.includes(milliseconds);
    if (exists) {
      notifications.show({
        color: "yellow",
        title: t("timersSection.alerts.duplicatePreset.title"),
        message: t("timersSection.alerts.duplicatePreset.message"),
      });
      return;
    }
    if (form.values.timers.presets.length >= 6) {
      notifications.show({
        color: "yellow",
        title: t("timersSection.alerts.maxPresets.title"),
        message: t("timersSection.alerts.maxPresets.message"),
      });
      return;
    }
    form.setFieldValue(
      "timers.presets",
      [...form.values.timers.presets, milliseconds].sort((a, b) => a - b)
    );
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
              <Text fw={600}>{t("timersSection.timerCard.title")}</Text>
              <Text size="sm" c="dimmed">
                {t("timersSection.timerCard.description")}
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
                  {t("timersSection.timerCard.presetDisplay", {
                    minutes: millisecondsToMinutes(preset),
                  })}
                </Badge>
              ))}
            </Group>
            <Group gap="sm" align="flex-end" wrap="nowrap">
              <NumberInput
                label={t("timersSection.timerCard.fields.presetLabel")}
                min={1}
                max={24 * 60}
                value={newPresetMinutes}
                onChange={(value) => setNewPresetMinutes(value === "" ? "" : Number(value))}
                placeholder={t("timersSection.timerCard.fields.presetPlaceholder")}
                style={{ flex: 1 }}
              />
              <Button
                variant="light"
                color="teal"
                onClick={addPreset}
                styles={{ root: { height: 40 } }}
              >
                {t("timersSection.timerCard.fields.addButton")}
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
              label={t("timersSection.timerCard.fields.autoRepeat.label")}
              description={t("timersSection.timerCard.fields.autoRepeat.description")}
              checked={form.values.timers.autoRepeat}
              onChange={(event) =>
                form.setFieldValue("timers.autoRepeat", event.currentTarget.checked)
              }
            />
            <Switch
              label={t("timersSection.timerCard.fields.notifications.label")}
              description={t("timersSection.timerCard.fields.notifications.description")}
              checked={form.values.timers.notifications}
              onChange={(event) =>
                form.setFieldValue("timers.notifications", event.currentTarget.checked)
              }
            />
            <Switch
              label={t("timersSection.timerCard.fields.sound.label")}
              description={t("timersSection.timerCard.fields.sound.description")}
              checked={form.values.timers.soundEnabled}
              onChange={(event) =>
                form.setFieldValue("timers.soundEnabled", event.currentTarget.checked)
              }
            />
            <NumberInput
              label={t("timersSection.timerCard.fields.preAlert.label")}
              description={t("timersSection.timerCard.fields.preAlert.description")}
              min={0}
              max={60}
              value={
                form.values.timers.preAlertMs
                  ? millisecondsToMinutes(form.values.timers.preAlertMs)
                  : 0
              }
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
              <Text fw={600}>{t("timersSection.pomodoroCard.title")}</Text>
              <Text size="sm" c="dimmed">
                {t("timersSection.pomodoroCard.description")}
              </Text>
            </div>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mt="md">
            <NumberInput
              label={t("timersSection.pomodoroCard.fields.focus")}
              min={1}
              max={60}
              value={secondsToMinutes(form.values.pomodoro.focusDuration)}
              onChange={(value) =>
                form.setFieldValue("pomodoro.focusDuration", minutesToSeconds(Number(value) || 0))
              }
            />
            <NumberInput
              label={t("timersSection.pomodoroCard.fields.shortBreak")}
              min={1}
              max={30}
              value={secondsToMinutes(form.values.pomodoro.shortBreakDuration)}
              onChange={(value) =>
                form.setFieldValue(
                  "pomodoro.shortBreakDuration",
                  minutesToSeconds(Number(value) || 0)
                )
              }
            />
            <NumberInput
              label={t("timersSection.pomodoroCard.fields.longBreak")}
              min={5}
              max={60}
              value={secondsToMinutes(form.values.pomodoro.longBreakDuration)}
              onChange={(value) =>
                form.setFieldValue(
                  "pomodoro.longBreakDuration",
                  minutesToSeconds(Number(value) || 0)
                )
              }
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <NumberInput
              label={t("timersSection.pomodoroCard.fields.longBreakInterval.label")}
              description={t("timersSection.pomodoroCard.fields.longBreakInterval.description")}
              min={1}
              max={8}
              {...form.getInputProps("pomodoro.longBreakInterval")}
            />
            <Stack gap="xs">
              <Switch
                label={t("timersSection.pomodoroCard.fields.autoStartBreak")}
                checked={form.values.pomodoro.autoStartBreak}
                onChange={(event) =>
                  form.setFieldValue("pomodoro.autoStartBreak", event.currentTarget.checked)
                }
              />
              <Switch
                label={t("timersSection.pomodoroCard.fields.autoStartFocus")}
                checked={form.values.pomodoro.autoStartFocus}
                onChange={(event) =>
                  form.setFieldValue("pomodoro.autoStartFocus", event.currentTarget.checked)
                }
              />
            </Stack>
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <Switch
              label={t("timersSection.pomodoroCard.fields.notifications")}
              checked={form.values.pomodoro.notificationEnabled}
              onChange={(event) =>
                form.setFieldValue("pomodoro.notificationEnabled", event.currentTarget.checked)
              }
            />
            <Switch
              label={t("timersSection.pomodoroCard.fields.sound")}
              checked={form.values.pomodoro.soundEnabled}
              onChange={(event) =>
                form.setFieldValue("pomodoro.soundEnabled", event.currentTarget.checked)
              }
            />
          </SimpleGrid>
          <Box mt="md">
            <Text fw={500} size="sm" mb="xs">
              {t("timersSection.pomodoroCard.fields.soundVolume")}
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
              <Text fw={600}>{t("timersSection.stopwatchCard.title")}</Text>
              <Text size="sm" c="dimmed">
                {t("timersSection.stopwatchCard.description")}
              </Text>
            </div>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
            <NumberInput
              label={t("timersSection.stopwatchCard.fields.goalTime.label")}
              description={t("timersSection.stopwatchCard.fields.goalTime.description")}
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
              label={t("timersSection.stopwatchCard.fields.notifications")}
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
