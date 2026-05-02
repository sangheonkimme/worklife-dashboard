"use client";

import NextLink from "next/link";
import {
  Anchor,
  Box,
  Button,
  Container,
  Divider,
  List,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";

const CONTACT_EMAIL = "railit.biz@gmail.com";

export const ContactPageClient = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: isDark ? theme.colors.dark[7] : theme.white,
      }}
    >
      <Container size="md" py={60}>
        <Stack gap="xl">
          <Anchor
            component={NextLink}
            href="/"
            c="dimmed"
            underline="never"
            fz="sm"
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <IconArrowLeft size={14} />홈으로 돌아가기
            </span>
          </Anchor>

          <Stack gap="xs">
            <Title order={1}>문의하기</Title>
            <Text c="dimmed">
              버그 제보, 기능 제안, 기타 문의는 아래 이메일로 보내주세요.
            </Text>
          </Stack>

          <Divider />

          <Box
            p="xl"
            style={{
              background: isDark
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
              borderRadius: theme.radius.md,
            }}
          >
            <Stack gap="md" align="flex-start">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: theme.radius.md,
                  background: theme.colors["worklife-navy"][7],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconMail size={24} color="white" />
              </Box>
              <Stack gap={4}>
                <Text fz="sm" c="dimmed">
                  이메일
                </Text>
                <Text fw={600} fz="lg">
                  {CONTACT_EMAIL}
                </Text>
              </Stack>
              <Button
                component="a"
                href={`mailto:${CONTACT_EMAIL}`}
                color="worklife-navy"
              >
                메일 보내기
              </Button>
            </Stack>
          </Box>

          <Stack gap="md" mt="md">
            <Title order={3} fz="md">
              메일에 함께 보내주시면 좋아요
            </Title>
            <List spacing={6}>
              <List.Item>가입하신 이메일 주소 (계정 관련 문의의 경우)</List.Item>
              <List.Item>문의 유형 (버그 제보 / 기능 제안 / 계정 / 기타)</List.Item>
              <List.Item>버그라면 발생 화면, 사용 환경(브라우저/OS), 재현 단계</List.Item>
              <List.Item>가능하다면 스크린샷 또는 화면 녹화</List.Item>
            </List>
          </Stack>

          <Stack gap="xs" mt="md">
            <Text fz="sm" c="dimmed">
              개인정보 처리 관련 문의는{" "}
              <Anchor component={NextLink} href="/privacy">
                개인정보 처리방침
              </Anchor>
              에서 안내한 보호책임자 연락처도 동일합니다.
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default ContactPageClient;
