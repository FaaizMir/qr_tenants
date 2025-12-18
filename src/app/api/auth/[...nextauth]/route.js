import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  jwt: { secret: process.env.NEXTAUTH_SECRET, maxAge: 24 * 60 * 60 },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(process.env.NEXT_PUBLIC_API_URL + "/auth/login");
        try {
          const res = await axios.post(
            process.env.NEXT_PUBLIC_API_URL + "/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          const data = res?.data;


          console.log(data);

          if (data?.access_token && data?.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              avatar: data.user.avatar,
              access_token: data.access_token,
              role: data.user.role,
            };
          }
          return null;
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = user.access_token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: "/login" },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
