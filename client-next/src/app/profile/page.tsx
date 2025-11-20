import type { Metadata } from "next";
import { dehydrate } from "@tanstack/react-query";
import Hydrate from "@/components/providers/Hydrate";
import ProfilePageClient from "./ProfilePageClient";
import { createQueryClient } from "@/lib/queryClient";
import { requireAuthenticatedUser } from "@/lib/server/auth";

const PROFILE_QUERY_KEY = ["auth", "me"] as const;

export const generateMetadata = async (): Promise<Metadata> => {
  await requireAuthenticatedUser();
  return {
    title: "프로필",
    description: "계정 정보와 최근 활동을 확인하고 업데이트할 수 있습니다.",
  };
};

const ProfilePage = async () => {
  const queryClient = createQueryClient();
  const currentUser = await requireAuthenticatedUser();
  queryClient.setQueryData(PROFILE_QUERY_KEY, currentUser);

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <ProfilePageClient />
    </Hydrate>
  );
};

export default ProfilePage;
