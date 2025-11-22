import type { Metadata } from "next";
import { dehydrate } from "@tanstack/react-query";
import Hydrate from "@/components/providers/Hydrate";
import SettingsPageClient from "./SettingsPageClient";
import { createQueryClient } from "@/lib/queryClient";
import { fetchWithAuth, FetchWithAuthError } from "@/lib/server/fetchWithAuth";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import type { UserSettings } from "@/types/userSettings";
import { redirect } from "next/navigation";

const getUserSettings = async (): Promise<UserSettings> => {
  const response = await fetchWithAuth("/api/user-settings", {
    target: "proxy",
  });
  const payload = await response.json();
  if (payload?.data) {
    return payload.data;
  }
  return payload;
};

export const generateMetadata = async (): Promise<Metadata> => {
  await requireAuthenticatedUser();
  return {
    title: "환경 설정",
    description: "알림, 통화 단위, 타이머 등 워크플로우 설정을 관리합니다.",
  };
};

const SettingsPage = async () => {
  const queryClient = createQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: ["user-settings"],
      queryFn: getUserSettings,
    });
  } catch (error) {
    if (
      error instanceof FetchWithAuthError &&
      error.message === "UNAUTHORIZED"
    ) {
      redirect("/login");
    }
    throw error;
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <SettingsPageClient />
    </Hydrate>
  );
};

export default SettingsPage;
