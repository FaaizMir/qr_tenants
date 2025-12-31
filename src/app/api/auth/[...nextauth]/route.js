import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60,
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const payload = credentials?.email
            ? {
                email: credentials.email,
                password: credentials.password,
              }
            : {
                username: credentials.username,
                password: credentials.password,
              };

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            payload
          );

          const data = res?.data;
          console.log("API response:", data);

          if (!data?.access_token || !data?.user) {
            console.error("Invalid login response");
            return null;
          }

          const subscriptionType = data?.merchant?.merchant_type || "temporary";

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            avatar: data.user.avatar,
            access_token: data.access_token,
            role: data.user.role?.toLowerCase?.() || data.user.role,
            subscriptionType,
            merchant_id: data.merchant?.id || null,
            admin_id: data.admin?.id || null,
          };
        } catch (error) {
          console.error(
            "Login failed:",
            error?.response?.data || error.message
          );
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.email = user.email ?? token.email;
        token.accessToken =
          user.access_token ?? user.accessToken ?? token.accessToken;
        token.role = user.role ?? token.role;
        token.merchantId =
          user.merchant_id ?? user.merchantId ?? token.merchantId;
        token.adminId = user.admin_id ?? user.adminId ?? token.adminId;
        token.subscriptionType =
          user.subscriptionType ||
          user.subscription_type ||
          user.merchantType ||
          user.merchant_type ||
          token.subscriptionType ||
          "temporary";
      }
      return token;
    },

    async session({ session, token }) {
      session.user = session.user || {};

      if (token?.id) session.user.id = token.id;
      if (token?.email) session.user.email = token.email;
      if (token?.role) session.user.role = token.role;
      if (token?.subscriptionType)
        session.user.subscriptionType = token.subscriptionType;
      if (token?.merchantId) session.user.merchantId = token.merchantId;
      if (token?.adminId) session.user.adminId = token.adminId;
      if (token?.accessToken) session.accessToken = token.accessToken;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
