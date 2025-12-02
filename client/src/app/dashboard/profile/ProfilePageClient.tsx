"use client";

import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Avatar,
  Badge,
  Divider,
  PasswordInput,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconUser,
  IconMail,
  IconLock,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/services/api/authApi";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import { formatDate } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/error";
import type { UpdateProfilePayload } from "@/types";
import { useTranslation } from "react-i18next";

interface ProfileFormValues {
  name: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePageClient = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { t } = useTranslation('profile');

  const form = useForm<ProfileFormValues>({
    initialValues: {
      name: user?.name || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => {
        if (!value || value.trim().length < 2) {
          return t('validation.name');
        }
        return null;
      },
      currentPassword: (value) => {
        if (isChangingPassword && !value) {
          return t('validation.currentPassword');
        }
        return null;
      },
      newPassword: (value) => {
        if (isChangingPassword) {
          if (!value) return t('validation.newPassword');
          if (value.length < 8) {
            return t('validation.passwordLength');
          }
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return t('validation.passwordStrength');
          }
        }
        return null;
      },
      confirmPassword: (value, values) => {
        if (isChangingPassword && value !== values.newPassword) {
          return t('validation.confirmPassword');
        }
        return null;
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const updateData: UpdateProfilePayload = {};

      // Update name if it changed
      if (values.name !== user?.name) {
        updateData.name = values.name;
      }

      // Apply password change
      if (isChangingPassword && values.newPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      return authApi.updateProfile(updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      notifications.show({
        title: t('notifications.successTitle'),
        message: t('notifications.successMessage'),
        color: "green",
        icon: <IconCheck size={18} />,
      });

      // Reset password fields
      form.setValues({
        ...form.values,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t('notifications.errorTitle'),
        message: getApiErrorMessage(error, t('notifications.errorMessage')),
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    },
  });

  const handleSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Alert color="yellow" icon={<IconAlertCircle size={18} />}>
          {t('page.loading')}
        </Alert>
      </Container>
    );
  }

  return (
    <AuthRequiredWrapper>
      <Container size="sm" py="xl">
        <Stack gap="lg">
        <div>
          <Title order={2}>{t('page.title')}</Title>
          <Text c="dimmed" size="sm">
            {t('page.description')}
          </Text>
        </div>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            {/* Profile header */}
            <Group>
              <Avatar size={80} radius="xl" color="blue">
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text size="lg" fw={500}>
                  {user.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {user.email}
                </Text>
                <Group gap="xs" mt={4}>
                  <Badge color="green" variant="light" size="sm">
                    {t('status.active')}
                  </Badge>
                  {user.createdAt && (
                    <Text size="xs" c="dimmed">
                      {t('status.joined', {
                        date: formatDate(user.createdAt, "long"),
                      })}
                    </Text>
                  )}
                </Group>
              </div>
            </Group>

            <Divider />

            {/* Profile form */}
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label={t('form.email')}
                  value={user.email}
                  leftSection={<IconMail size={16} />}
                  disabled
                />

                <TextInput
                  label={t('form.name.label')}
                  placeholder={t('form.name.placeholder')}
                  leftSection={<IconUser size={16} />}
                  {...form.getInputProps("name")}
                  required
                />

                <Divider label={t('form.passwordSection')} labelPosition="center" />

                {!isChangingPassword ? (
                  <Button
                    variant="light"
                    leftSection={<IconLock size={16} />}
                    onClick={() => setIsChangingPassword(true)}
                  >
                    {t('form.passwordToggle')}
                  </Button>
                ) : (
                  <Stack gap="md">
                    <Alert color="blue" icon={<IconAlertCircle size={18} />}>
                      {t('alerts.password')}
                    </Alert>

                    <PasswordInput
                      label={t('form.currentPassword.label')}
                      placeholder={t('form.currentPassword.placeholder')}
                      leftSection={<IconLock size={16} />}
                      {...form.getInputProps("currentPassword")}
                      required={isChangingPassword}
                    />

                    <PasswordInput
                      label={t('form.newPassword.label')}
                      placeholder={t('form.newPassword.placeholder')}
                      leftSection={<IconLock size={16} />}
                      {...form.getInputProps("newPassword")}
                      required={isChangingPassword}
                    />

                    <PasswordInput
                      label={t('form.confirmPassword.label')}
                      placeholder={t('form.confirmPassword.placeholder')}
                      leftSection={<IconLock size={16} />}
                      {...form.getInputProps("confirmPassword")}
                      required={isChangingPassword}
                    />

                    <Button
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        setIsChangingPassword(false);
                        form.setValues({
                          ...form.values,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      {t('form.cancelPassword')}
                    </Button>
                  </Stack>
                )}

                <Group justify="flex-end" mt="md">
                  <Button
                    variant="default"
                    onClick={() => {
                      form.setValues({
                        name: user.name,
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setIsChangingPassword(false);
                    }}
                  >
                    {t('form.actions.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    loading={updateProfileMutation.isPending}
                  >
                    {t('form.actions.submit')}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>

        {/* Account stats */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <Stack gap="xs">
            <Text fw={500} size="sm">
              {t('accountInfo.title')}
            </Text>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('accountInfo.id')}
              </Text>
              <Text size="sm" ff="monospace">
                {user.id}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('accountInfo.lastUpdated')}
              </Text>
              <Text size="sm">
                {formatDate(user.updatedAt, "long")}
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
    </AuthRequiredWrapper>
  );
};

export default ProfilePageClient;
