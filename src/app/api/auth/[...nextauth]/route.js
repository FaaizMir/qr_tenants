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
          const payload = {
            email: credentials.username, // Using 'username' field from login form
            password: credentials.password,
          };

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            payload
          );

          const data = res?.data;

          // 1. Extract Token
          const token = data?.access_token || data?.token || data?.accessToken;

          // 2. Extract User Profile
          const userObj = data?.user || data?.data || data;

          if (!token) return null;

          // 3. Determine Role
          let role = userObj?.role || data?.role;
          if (!role && (userObj?.merchant_id || userObj?.merchant))
            role = "merchant";
          const normalizedRole = role?.toLowerCase() || "";

          // 4. Activity Check
          const isActive =
            userObj?.is_active ??
            userObj?.active ??
            data?.merchant?.is_active ??
            true;

          if (isActive === false) {
            console.warn(
              `Access denied: Account is inactive for role: ${normalizedRole}`
            );
            throw new Error("ACCOUNT_INACTIVE");
          }

          // 5. Return success object
          return {
            id: userObj?.id || "unknown",
            email: userObj?.email || "unknown",
            name: userObj?.name || userObj?.business_name || "User",
            access_token: token,
            role: normalizedRole,
            subscriptionType: data?.merchant?.merchant_type || "temporary",
            merchant_id: data?.merchant?.id || userObj?.merchant_id || null,
            merchant_active: isActive,
            admin_id: data?.user?.adminId || null,
            is_subscription_expired: data.user.is_subscription_expired,
            subscription_expires_at: data.user.subscription_expires_at,

          };
        } catch (error) {
          const apiError =
            error?.response?.data?.message || error?.response?.data;

          if (
            error.message === "ACCOUNT_INACTIVE" ||
            (typeof apiError === "string" &&
              apiError.toUpperCase().includes("INACTIVE"))
          ) {
            throw new Error(
              "Your account is inactive. Please contact your agent."
            );
          }

          console.error("Login authorize failed:", error.message);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Handle session update
        if (session.is_subscription_expired !== undefined) {
          token.isSubscriptionExpired = session.is_subscription_expired;
        }
        if (session.subscription_expires_at !== undefined) {
          token.subscriptionExpiresAt = session.subscription_expires_at;
        }
      }

      if (user) {
        token.id = user.id ?? token.id;
        token.email = user.email ?? token.email;
        token.accessToken =
          user.access_token ?? user.accessToken ?? token.accessToken;
        token.role = user.role ?? token.role;
        token.merchantId =
          user.merchant_id ?? user.merchantId ?? token.merchantId;
        token.merchantActive = user.merchant_active ?? token.merchantActive;
        token.adminId = user.admin_id ?? user.adminId ?? token.adminId;
        token.subscriptionType =
          user.subscriptionType ||
          user.subscription_type ||
          user.merchantType ||
          user.merchant_type ||
          token.subscriptionType ||
          "temporary";
        token.adminId = user.admin_id ?? user.adminId ?? token.adminId;
        token.isSubscriptionExpired = user.is_subscription_expired;
        token.subscriptionExpiresAt = user.subscription_expires_at;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = session.user || {};

      if (token?.id) session.user.id = token.id;
      if (token?.email) session.user.email = token.email;
      session.user.merchantActive = token.merchantActive ?? true;
      if (token?.role) session.user.role = token.role;
      if (token?.subscriptionType)
        session.user.subscriptionType = token.subscriptionType;
      if (token?.merchantId) session.user.merchantId = token.merchantId;
      if (token?.adminId) session.user.adminId = token.adminId;
      if (token?.accessToken) session.accessToken = token.accessToken;
      if (token?.adminId) session.adminId = token.adminId;

      session.user.is_subscription_expired = token.isSubscriptionExpired;
      session.user.subscription_expires_at = token.subscriptionExpiresAt;

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
