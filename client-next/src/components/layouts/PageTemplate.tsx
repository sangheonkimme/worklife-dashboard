"use client";

import { ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";
import NextLink from "next/link";

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  description: string;
  highlights?: string[];
  badge?: string;
  cta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  children?: ReactNode;
}

const isExternal = (href: string) =>
  href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

export const PageTemplate = ({
  title,
  subtitle,
  description,
  highlights,
  badge,
  cta,
  secondaryCta,
  children,
}: PageTemplateProps) => {
  return (
    <Container size="lg" py={80}>
      <Card padding="xl" radius="lg" withBorder>
        <Stack gap="md">
          {badge ? (
            <Badge w="fit-content" variant="light" color="worklife-mint.6">
              {badge}
            </Badge>
          ) : null}
          <Stack gap={8}>
            {subtitle ? (
              <Text c="dimmed" fz="sm" fw={500}>
                {subtitle}
              </Text>
            ) : null}
            <Title order={2}>{title}</Title>
            <Text c="dimmed">{description}</Text>
          </Stack>
          {highlights && highlights.length > 0 ? (
            <List
              spacing="sm"
              size="sm"
              icon={
                <ThemeIcon size={22} radius="xl" variant="light" color="worklife-mint.6">
                  <IconCircleCheck size={14} />
                </ThemeIcon>
              }
            >
              {highlights.map((item) => (
                <List.Item key={item}>{item}</List.Item>
              ))}
            </List>
          ) : null}
          <Stack gap="sm" w="100%" maw={360}>
            {cta ? (
              isExternal(cta.href) ? (
                <Button
                  component="a"
                  href={cta.href}
                  target={cta.href.startsWith("http") ? "_blank" : undefined}
                  rel={cta.href.startsWith("http") ? "noreferrer" : undefined}
                  rightSection={<IconArrowRight size={18} />}
                >
                  {cta.label}
                </Button>
              ) : (
                <NextLink href={cta.href} passHref legacyBehavior>
                  <Button
                    component="a"
                    rightSection={<IconArrowRight size={18} />}
                  >
                    {cta.label}
                  </Button>
                </NextLink>
              )
            ) : null}
            {secondaryCta ? (
              isExternal(secondaryCta.href) ? (
                <Button
                  component="a"
                  href={secondaryCta.href}
                  target={
                    secondaryCta.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    secondaryCta.href.startsWith("http")
                      ? "noreferrer"
                      : undefined
                  }
                  variant="light"
                  color="worklife-navy.7"
                >
                  {secondaryCta.label}
                </Button>
              ) : (
                <NextLink href={secondaryCta.href} passHref legacyBehavior>
                  <Button component="a" variant="light" color="worklife-navy.7">
                    {secondaryCta.label}
                  </Button>
                </NextLink>
              )
            ) : null}
          </Stack>
        </Stack>
      </Card>
      {children}
    </Container>
  );
};
