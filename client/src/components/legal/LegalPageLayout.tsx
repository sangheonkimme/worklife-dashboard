"use client";

import NextLink from "next/link";
import { ReactNode } from "react";
import {
  Anchor,
  Box,
  Container,
  Divider,
  Stack,
  Text,
  Title,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

interface LegalPageLayoutProps {
  title: string;
  effectiveDate: string;
  toc: { id: string; label: string }[];
  children: ReactNode;
}

export const LegalPageLayout = ({
  title,
  effectiveDate,
  toc,
  children,
}: LegalPageLayoutProps) => {
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
            <Title order={1}>{title}</Title>
            <Text fz="sm" c="dimmed">
              시행일: {effectiveDate}
            </Text>
          </Stack>

          <Divider />

          {/* Table of Contents */}
          <Box
            p="md"
            style={{
              background: isDark
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
              borderRadius: theme.radius.md,
            }}
          >
            <Text fw={600} fz="sm" mb="xs">
              목차
            </Text>
            <Stack gap={4}>
              {toc.map((item, idx) => (
                <Anchor
                  key={item.id}
                  href={`#${item.id}`}
                  fz="sm"
                  c={isDark ? "gray.3" : "dark.6"}
                >
                  {idx + 1}. {item.label}
                </Anchor>
              ))}
            </Stack>
          </Box>

          <Box
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: isDark ? theme.colors.gray[2] : theme.colors.dark[7],
            }}
          >
            {children}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
