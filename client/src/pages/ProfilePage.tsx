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
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../services/api/authApi";

interface ProfileFormValues {
  name: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
          return "이름은 최소 2자 이상이어야 합니다";
        }
        return null;
      },
      currentPassword: (value) => {
        if (isChangingPassword && !value) {
          return "현재 비밀번호를 입력해주세요";
        }
        return null;
      },
      newPassword: (value) => {
        if (isChangingPassword) {
          if (!value) return "새 비밀번호를 입력해주세요";
          if (value.length < 8) {
            return "비밀번호는 최소 8자 이상이어야 합니다";
          }
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다";
          }
        }
        return null;
      },
      confirmPassword: (value, values) => {
        if (isChangingPassword && value !== values.newPassword) {
          return "비밀번호가 일치하지 않습니다";
        }
        return null;
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const updateData: any = {};

      // 이름이 변경된 경우
      if (values.name !== user?.name) {
        updateData.name = values.name;
      }

      // 비밀번호 변경
      if (isChangingPassword && values.newPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      return authApi.updateProfile(updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      notifications.show({
        title: "성공",
        message: "프로필이 업데이트되었습니다",
        color: "green",
        icon: <IconCheck size={18} />,
      });

      // 비밀번호 필드 초기화
      form.setValues({
        ...form.values,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      notifications.show({
        title: "오류",
        message:
          error.response?.data?.message || "프로필 업데이트에 실패했습니다",
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
          사용자 정보를 불러오는 중...
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={2}>프로필 설정</Title>
          <Text c="dimmed" size="sm">
            개인 정보 및 계정 설정을 관리하세요
          </Text>
        </div>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            {/* 프로필 헤더 */}
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
                    활성
                  </Badge>
                  {user.createdAt && (
                    <Text size="xs" c="dimmed">
                      가입일:{" "}
                      {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                    </Text>
                  )}
                </Group>
              </div>
            </Group>

            <Divider />

            {/* 프로필 수정 폼 */}
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="이메일"
                  value={user.email}
                  leftSection={<IconMail size={16} />}
                  disabled
                  // description="이메일은 로그인 ID로 사용되므로 변경할 수 없습니다"
                />

                <TextInput
                  label="이름"
                  placeholder="이름을 입력하세요"
                  leftSection={<IconUser size={16} />}
                  {...form.getInputProps("name")}
                  required
                />

                <Divider label="비밀번호 변경" labelPosition="center" />

                {!isChangingPassword ? (
                  <Button
                    variant="light"
                    leftSection={<IconLock size={16} />}
                    onClick={() => setIsChangingPassword(true)}
                  >
                    비밀번호 변경하기
                  </Button>
                ) : (
                  <Stack gap="md">
                    <Alert color="blue" icon={<IconAlertCircle size={18} />}>
                      비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자를
                      포함해야 합니다.
                    </Alert>

                    <PasswordInput
                      label="현재 비밀번호"
                      placeholder="현재 비밀번호를 입력하세요"
                      leftSection={<IconLock size={16} />}
                      {...form.getInputProps("currentPassword")}
                      required={isChangingPassword}
                    />

                    <PasswordInput
                      label="새 비밀번호"
                      placeholder="새 비밀번호를 입력하세요"
                      leftSection={<IconLock size={16} />}
                      {...form.getInputProps("newPassword")}
                      required={isChangingPassword}
                    />

                    <PasswordInput
                      label="비밀번호 확인"
                      placeholder="새 비밀번호를 다시 입력하세요"
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
                      비밀번호 변경 취소
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
                    취소
                  </Button>
                  <Button
                    type="submit"
                    loading={updateProfileMutation.isPending}
                  >
                    변경사항 저장
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>

        {/* 계정 통계 */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <Stack gap="xs">
            <Text fw={500} size="sm">
              계정 정보
            </Text>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                계정 ID
              </Text>
              <Text size="sm" ff="monospace">
                {user.id}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                마지막 업데이트
              </Text>
              <Text size="sm">
                {new Date(user.updatedAt).toLocaleDateString("ko-KR")}
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ProfilePage;
