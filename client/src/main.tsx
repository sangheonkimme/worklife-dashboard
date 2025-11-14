import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { I18nextProvider } from "react-i18next";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient";
import { worklifeTheme, worklifeCssVariablesResolver } from "./theme";
import i18n from "./lib/i18n.ts";
import { useUserSettingsStore } from "./store/useUserSettingsStore.ts";

export const AppProviders = () => {
  const locale = useUserSettingsStore((state) => state.settings?.locale ?? "ko-KR");

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <MantineProvider
          theme={worklifeTheme}
          defaultColorScheme="light"
          cssVariablesResolver={worklifeCssVariablesResolver}
        >
          <DatesProvider settings={{ locale }}>
            <ModalsProvider>
              <Notifications position="top-right" />
              <Suspense fallback={null}>
                <App />
              </Suspense>
            </ModalsProvider>
          </DatesProvider>
        </MantineProvider>
      </I18nextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
