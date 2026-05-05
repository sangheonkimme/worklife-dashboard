"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import "@/lib/i18n";
import { applyStoredLanguage } from "@/lib/i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { SessionProvider } from "next-auth/react";
import { createQueryClient } from "@/lib/queryClient";
import { worklifeCssVariablesResolver, worklifeTheme } from "@/theme";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const locale = "ko-KR";
  const [client] = useState(() => createQueryClient());

  // 마운트 후 저장된 사용자 언어 적용. 서버/첫 클라 렌더는 항상 ko 로 일치.
  useEffect(() => {
    applyStoredLanguage();
  }, []);

  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        <MantineProvider
          theme={worklifeTheme}
          defaultColorScheme="light"
          cssVariablesResolver={worklifeCssVariablesResolver}
        >
          <DatesProvider settings={{ locale }}>
            <ModalsProvider>
              <Notifications position="top-right" />
              <Suspense fallback={null}>{children}</Suspense>
            </ModalsProvider>
          </DatesProvider>
        </MantineProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
};
