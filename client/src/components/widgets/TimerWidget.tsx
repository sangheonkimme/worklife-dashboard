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
import { useTimerStore } from "@/store/useTimerStore";
import type { WidgetProps } from "@/types/widget";
import { formatTimeSimple } from "@/utils/timeFormat";

const statusColor: Record<string, string> = {
  idle: "gray",
  running: "teal",
  paused: "yellow",
  finished: "green",
};

const statusLabel: Record<string, string> = {
  idle: "대기중",
  running: "진행 중",
  paused: "일시정지",
  finished: "완료",
};

const preAlertOptions = [
  { label: "사용 안 함", value: "none" },
  { label: "30초 전", value: (30 * 1000).toString() },
  { label: "1분 전", value: (60 * 1000).toString() },
  { label: "5분 전", value: (5 * 60 * 1000).toString() },
];

export function TimerWidget({ onClose }: WidgetProps) {
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
  const preAlertPlayedRef = useRef(false);
  const completionPlayedRef = useRef(false);

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
    if (!settings.soundEnabled) return;
    if (preAlertTriggered && !preAlertPlayedRef.current) {
      playTone(880, 0.25);
      preAlertPlayedRef.current = true;
    }
    if (!preAlertTriggered) {
      preAlertPlayedRef.current = false;
    }
  }, [preAlertTriggered, settings.soundEnabled, playTone]);

  useEffect(() => {
    if (!settings.soundEnabled) return;
    if (status === "finished" && !completionPlayedRef.current) {
      playTone(520, 0.35);
      setTimeout(() => playTone(660, 0.35), 220);
      completionPlayedRef.current = true;
    }
    if (status !== "finished") {
      completionPlayedRef.current = false;
    }
  }, [status, settings.soundEnabled, playTone]);

  const progress = useMemo(() => {
    if (totalMs <= 0) return 0;
    return Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  }, [remainingMs, totalMs]);

  const formattedRemaining = formatTimeSimple(Math.max(remainingMs, 0));
  const formattedTotal = totalMs > 0 ? formatTimeSimple(totalMs) : "00:00";
  const currentStatusColor = statusColor[status] ?? "gray";

  const handleApplyCustom = () => {
    const clampedMinutes = Math.max(0, Math.min(99, minutes || 0));
    const clampedSeconds = Math.max(0, Math.min(59, seconds || 0));
    const totalMilliseconds =
      clampedMinutes * 60 * 1000 + clampedSeconds * 1000;

    if (totalMilliseconds <= 0) {
      notifications.show({
        title: "유효한 시간을 입력하세요",
        message: "1초 이상으로 설정해야 합니다.",
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
            일시정지
          </Button>
          <Button
            leftSection={<IconPlayerStop size={16} />}
            variant="light"
            color="gray"
            onClick={resetTimer}
          >
            리셋
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
            재개
          </Button>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconPlayerStop size={16} />}
            onClick={resetTimer}
          >
            리셋
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
          시작
        </Button>
        {status === "finished" && (
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRotate size={16} />}
            onClick={resetTimer}
          >
            다시 설정
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

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="lg" fw={600}>
            일반 타이머
          </Text>
          <Group gap="xs" mt={4}>
            <Badge color={currentStatusColor}>{statusLabel[status]}</Badge>
            {preAlertTriggered && status === "running" && (
              <Badge color="yellow" variant="light">
                곧 종료
              </Badge>
            )}
            {settings.autoRepeat && (
              <Tooltip label="완료 시 자동으로 다시 시작">
                <Badge color="teal" variant="light">
                  자동 반복
                </Badge>
              </Tooltip>
            )}
          </Group>
        </div>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            aria-label="설정"
            onClick={() => setSettingsOpened(true)}
          >
            <IconSettings size={18} />
          </ActionIcon>
          {onClose && (
            <ActionIcon variant="subtle" aria-label="닫기" onClick={onClose}>
              <IconX size={18} />
            </ActionIcon>
          )}
        </Group>
      </Group>

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
              총 {formattedTotal}
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
            빠른 설정
          </Text>
          <Text size="sm" c="dimmed">
            클릭 한 번으로 시간 지정
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
                {Math.floor(preset / 60000)}분
              </Button>
            );
          })}
        </Group>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Text size="sm" fw={600}>
          커스텀 시간
        </Text>
        <Group align="flex-end" gap="xs">
          <NumberInput
            label="분"
            min={0}
            max={99}
            value={minutes}
            onChange={(value) =>
              setMinutes(Math.max(0, Math.min(99, Number(value) || 0)))
            }
          />
          <NumberInput
            label="초"
            min={0}
            max={59}
            value={seconds}
            onChange={(value) =>
              setSeconds(Math.max(0, Math.min(59, Number(value) || 0)))
            }
          />
          <Button variant="light" color="blue" onClick={handleApplyCustom}>
            적용
          </Button>
        </Group>
      </Stack>

      <Divider />

      {renderControls()}

      {status === "finished" && (
        <Text size="sm" c="dimmed" ta="center">
          타이머가 완료되었습니다. 다시 시작하려면 위 버튼을 사용하세요.
        </Text>
      )}

      <Modal
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        title="타이머 설정"
        size="md"
        centered
      >
        <Stack gap="md">
          <Switch
            label="타이머 알림 받기"
            checked={settings.notifications}
            onChange={(event) =>
              setSettings({ notifications: event.currentTarget.checked })
            }
          />
          <Switch
            label="소리 알림"
            description="사전 알림/완료 시 간단한 비프음을 재생합니다."
            checked={settings.soundEnabled}
            onChange={(event) =>
              handleSoundToggle(event.currentTarget.checked)
            }
          />
          <Switch
            label="완료 후 자동 반복"
            description="타이머가 끝나면 동일한 시간으로 다시 시작합니다."
            checked={settings.autoRepeat}
            onChange={(event) =>
              setSettings({ autoRepeat: event.currentTarget.checked })
            }
          />
          <Select
            label="사전 알림"
            placeholder="시간을 선택하세요"
            value={
              settings.preAlertMs ? settings.preAlertMs.toString() : "none"
            }
            data={preAlertOptions}
            onChange={handlePreAlertChange}
            allowDeselect={false}
          />
          <Text size="xs" c="dimmed">
            브라우저 알림을 위해 권한이 필요할 수 있습니다. 최초 사용 시 브라우저
            팝업을 허용해주세요.
          </Text>
        </Stack>
      </Modal>
    </Stack>
  );
}
