"use client";

import { ReactNode, Suspense, useState } from "react";
import "@/lib/i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createQueryClient } from "@/lib/queryClient";
import { worklifeCssVariablesResolver, worklifeTheme } from "@/theme";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const locale = "ko-KR";
  const [client] = useState(() => createQueryClient());
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "missing-google-client-id";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
    </GoogleOAuthProvider>
  );
};
