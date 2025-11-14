import type { UseFormReturnType } from "@mantine/form";
import type { UserSettings } from "@/types/userSettings";

export type SettingsFormValues = UserSettings;
export type SettingsForm = UseFormReturnType<
  SettingsFormValues,
  (values: SettingsFormValues) => SettingsFormValues
>;
