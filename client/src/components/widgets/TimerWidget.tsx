import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  RingProgress,
  Select,
  Stack,
  Switch,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconRotate,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useTimerStore } from "@/store/useTimerStore";
import type { WidgetProps } from "@/types/widget";
import { formatTimeSimple } from "@/utils/timeFormat";
import type { TimerStatus } from "@/types/timer";

const statusColor: Record<string, string> = {
  idle: "gray",
  running: "teal",
  paused: "yellow",
  finished: "green",
};

export function TimerWidget({ onClose, showHeader = true }: WidgetProps) {
  const { t } = useTranslation("widgets");
  const status = useTimerStore((state) => state.status);
  const totalMs = useTimerStore((state) => state.totalMs);
  const remainingMs = useTimerStore((state) => state.remainingMs);
  const settings = useTimerStore((state) => state.settings);
  const preAlertTriggered = useTimerStore(
    (state) => state.preAlertTriggered
  );
  const startTimer = useTimerStore((state) => state.startTimer);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);
  const resumeTimer = useTimerStore((state) => state.resumeTimer);
  const resetTimer = useTimerStore((state) => state.resetTimer);
  const setPreset = useTimerStore((state) => state.setPreset);
  const setCustomDuration = useTimerStore(
    (state) => state.setCustomDuration
  );
  const setSettings = useTimerStore((state) => state.setSettings);
  const restoreTimer = useTimerStore((state) => state.restoreTimer);

  const [settingsOpened, setSettingsOpened] = useState(false);
  const [minutes, setMinutes] = useState(Math.floor(totalMs / 60000));
  const [seconds, setSeconds] = useState(
    Math.floor((totalMs % 60000) / 1000)
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const prevPreAlertRef = useRef(preAlertTriggered);
  const prevStatusRef = useRef<TimerStatus>(status);

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {
        // ignore resume failure
      });
    }
    return audioContextRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const ctx = ensureAudioContext();
    if (ctx?.state === "suspended") {
      ctx
        .resume()
        .catch(() => {
          // ignore resume failure triggered outside user gestures
        });
    }
  }, [ensureAudioContext]);

  const playTone = useCallback(
    (frequency: number, duration = 0.35) => {
      const ctx = ensureAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    },
    [ensureAudioContext]
  );

  useEffect(() => {
    restoreTimer();
  }, [restoreTimer]);

  useEffect(() => {
    setMinutes(Math.floor(totalMs / 60000));
    setSeconds(Math.floor((totalMs % 60000) / 1000));
  }, [totalMs]);

  useEffect(() => {
    if (
      settings.notifications &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {
        // ignore permission errors
      });
    }
  }, [settings.notifications]);

  useEffect(() => {
    const previouslyTriggered = prevPreAlertRef.current;
    prevPreAlertRef.current = preAlertTriggered;

    if (!settings.soundEnabled) return;
    if (preAlertTriggered && !previouslyTriggered) {
      playTone(880, 0.25);
    }
  }, [preAlertTriggered, settings.soundEnabled, playTone]);

  useEffect(() => {
    const previousStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (!settings.soundEnabled) return;
    if (status === "finished" && previousStatus !== "finished") {
      playTone(520, 0.35);
      setTimeout(() => playTone(660, 0.35), 220);
    }
  }, [status, settings.soundEnabled, playTone]);

  const progress = useMemo(() => {
    if (totalMs <= 0) return 0;
    return Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  }, [remainingMs, totalMs]);

  const formattedRemaining = formatTimeSimple(Math.max(remainingMs, 0));
  const formattedTotal = totalMs > 0 ? formatTimeSimple(totalMs) : "00:00";
  const currentStatusColor = statusColor[status] ?? "gray";
  const statusText = t(`timer.status.${status}` as const);
  const preAlertOptions = useMemo(
    () => [
      { label: t("timer.preAlertOptions.none"), value: "none" },
      { label: t("timer.preAlertOptions.30s"), value: (30 * 1000).toString() },
      { label: t("timer.preAlertOptions.1m"), value: (60 * 1000).toString() },
      {
        label: t("timer.preAlertOptions.5m"),
        value: (5 * 60 * 1000).toString(),
      },
    ],
    [t]
  );

  const handleApplyCustom = () => {
    const clampedMinutes = Math.max(0, Math.min(99, minutes || 0));
    const clampedSeconds = Math.max(0, Math.min(59, seconds || 0));
    const totalMilliseconds =
      clampedMinutes * 60 * 1000 + clampedSeconds * 1000;

    if (totalMilliseconds <= 0) {
      notifications.show({
        title: t("timer.messages.invalidTitle"),
        message: t("timer.messages.invalidMessage"),
        color: "red",
      });
      return;
    }

    setCustomDuration(totalMilliseconds);
  };

  const handlePreAlertChange = (value: string | null) => {
    if (!value || value === "none") {
      setSettings({ preAlertMs: null });
      return;
    }
    setSettings({ preAlertMs: Number(value) });
  };

  const handleStart = () => {
    unlockAudio();
    startTimer();
  };

  const handleResume = () => {
    unlockAudio();
    resumeTimer();
  };

  const renderControls = () => {
    if (status === "running") {
      return (
        <Group justify="center" gap="sm">
          <Button
            leftSection={<IconPlayerPause size={16} />}
            variant="light"
            color="yellow"
            onClick={pauseTimer}
          >
            {t("timer.buttons.pause")}
          </Button>
          <Button
            leftSection={<IconPlayerStop size={16} />}
            variant="light"
            color="gray"
            onClick={resetTimer}
          >
            {t("timer.buttons.reset")}
          </Button>
        </Group>
      );
    }

    if (status === "paused") {
      return (
        <Group justify="center" gap="sm">
          <Button
            leftSection={<IconPlayerPlay size={16} />}
            color="teal"
            onClick={handleResume}
          >
            {t("timer.buttons.resume")}
          </Button>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconPlayerStop size={16} />}
            onClick={resetTimer}
          >
            {t("timer.buttons.reset")}
          </Button>
        </Group>
      );
    }

    return (
      <Group justify="center" gap="sm">
        <Button
          size="md"
          color="teal"
          leftSection={<IconPlayerPlay size={18} />}
          onClick={handleStart}
          disabled={totalMs <= 0}
        >
          {t("timer.buttons.start")}
        </Button>
        {status === "finished" && (
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRotate size={16} />}
            onClick={resetTimer}
          >
            {t("timer.buttons.restart")}
          </Button>
        )}
      </Group>
    );
  };

  const handleSoundToggle = (checked: boolean) => {
    setSettings({ soundEnabled: checked });
    if (checked) {
      unlockAudio();
    }
  };

  const renderStatusBadges = () => (
    <Group gap="xs" mt={showHeader ? 4 : 0}>
      <Badge color={currentStatusColor}>{statusText}</Badge>
      {preAlertTriggered && status === "running" && (
        <Badge color="yellow" variant="light">
          {t("timer.badges.endingSoon")}
        </Badge>
      )}
      {settings.autoRepeat && (
        <Tooltip label={t("timer.tooltips.autoRepeat")}>
          <Badge color="teal" variant="light">
            {t("timer.badges.autoRepeat")}
          </Badge>
        </Tooltip>
      )}
    </Group>
  );

  return (
    <Stack gap="md">
      {showHeader ? (
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={600}>
              {t("timer.title")}
            </Text>
            {renderStatusBadges()}
          </div>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              aria-label={t("timer.aria.openSettings")}
              onClick={() => setSettingsOpened(true)}
            >
              <IconSettings size={18} />
            </ActionIcon>
            {onClose && (
              <ActionIcon
                variant="subtle"
                aria-label={t("timer.aria.closeWidget")}
                onClick={onClose}
              >
                <IconX size={18} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      ) : (
        <Group justify="flex-end">
          <ActionIcon
            variant="subtle"
            aria-label={t("timer.aria.openSettings")}
            onClick={() => setSettingsOpened(true)}
          >
            <IconSettings size={18} />
          </ActionIcon>
        </Group>
      )}

      {!showHeader && renderStatusBadges()}

      <RingProgress
        size={220}
        thickness={14}
        label={
          <Stack gap={2} align="center">
            <Text
              size="xl"
              fw={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formattedRemaining}
            </Text>
            <Text size="xs" c="dimmed">
              {t("timer.display.total", { time: formattedTotal })}
            </Text>
          </Stack>
        }
        sections={[
          {
            value: progress,
            color: currentStatusColor,
          },
        ]}
        rootColor="var(--mantine-color-default)"
      />

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            {t("timer.sections.quickPresetsTitle")}
          </Text>
          <Text size="sm" c="dimmed">
            {t("timer.sections.quickPresetsDescription")}
          </Text>
        </Group>
        <Group gap="xs">
          {settings.presets.map((preset: number) => {
            const isActive = totalMs === preset && status === "idle";
            return (
              <Button
                key={preset}
                size="xs"
                variant={isActive ? "filled" : "light"}
                color="teal"
                onClick={() => setPreset(preset)}
              >
                {t("timer.presets.minutesLabel", {
                  value: Math.floor(preset / 60000),
                })}
              </Button>
            );
          })}
        </Group>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Text size="sm" fw={600}>
          {t("timer.sections.customTitle")}
        </Text>
        <Group align="flex-end" gap="xs">
          <NumberInput
            label={t("timer.fields.minutes")}
            min={0}
            max={99}
            value={minutes}
            onChange={(value) =>
              setMinutes(Math.max(0, Math.min(99, Number(value) || 0)))
            }
          />
          <NumberInput
            label={t("timer.fields.seconds")}
            min={0}
            max={59}
            value={seconds}
            onChange={(value) =>
              setSeconds(Math.max(0, Math.min(59, Number(value) || 0)))
            }
          />
          <Button variant="light" color="blue" onClick={handleApplyCustom}>
            {t("timer.buttons.apply")}
          </Button>
        </Group>
      </Stack>

      <Divider />

      {renderControls()}

      {status === "finished" && (
        <Text size="sm" c="dimmed" ta="center">
          {t("timer.messages.finished")}
        </Text>
      )}

      <Modal
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        title={t("timer.modal.title")}
        size="md"
        centered
      >
        <Stack gap="md">
          <Switch
            label={t("timer.modal.notificationsLabel")}
            checked={settings.notifications}
            onChange={(event) =>
              setSettings({ notifications: event.currentTarget.checked })
            }
          />
          <Switch
            label={t("timer.modal.soundLabel")}
            description={t("timer.modal.soundDescription")}
            checked={settings.soundEnabled}
            onChange={(event) =>
              handleSoundToggle(event.currentTarget.checked)
            }
          />
          <Switch
            label={t("timer.modal.autoRepeatLabel")}
            description={t("timer.modal.autoRepeatDescription")}
            checked={settings.autoRepeat}
            onChange={(event) =>
              setSettings({ autoRepeat: event.currentTarget.checked })
            }
          />
          <Select
            label={t("timer.modal.preAlertLabel")}
            placeholder={t("timer.modal.preAlertPlaceholder")}
            value={
              settings.preAlertMs ? settings.preAlertMs.toString() : "none"
            }
            data={preAlertOptions}
            onChange={handlePreAlertChange}
            allowDeselect={false}
          />
          <Text size="xs" c="dimmed">
            {t("timer.modal.browserPermission")}
          </Text>
        </Stack>
      </Modal>
    </Stack>
  );
}
