import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const internalHeaders = () => ({
  "content-type": "application/json",
  "x-internal-key": process.env.INTERNAL_API_KEY ?? "",
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 14 * 24 * 60 * 60, // 14 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const response = await fetch(
          `${API_BASE_URL}/api/auth/credentials/verify`,
          {
            method: "POST",
            headers: internalHeaders(),
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        if (!response.ok) return null;

        const payload = await response.json();
        const user = payload?.data?.user ?? payload?.user;
        if (!user?.id) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.picture ?? null,
        };
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (account?.provider !== "google") return true;
      if (!profile?.email) return false;

      const response = await fetch(
        `${API_BASE_URL}/api/auth/oauth/sync`,
        {
          method: "POST",
          headers: internalHeaders(),
          body: JSON.stringify({
            email: profile.email,
            name: profile.name ?? user.name ?? "",
            googleId: account.providerAccountId,
            picture: (profile as { picture?: string }).picture ?? user.image,
          }),
        }
      );

      if (!response.ok) return false;

      const payload = await response.json();
      const syncedUser = payload?.data?.user ?? payload?.user;
      if (!syncedUser?.id) return false;

      // jwt 콜백에서 user.id 사용 가능하도록 주입
      user.id = syncedUser.id;
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
});
