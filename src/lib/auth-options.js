import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            // Extract error message from various possible response formats
            let errorMessage = "Invalid email or password";
            
            if (data?.message) {
              errorMessage = Array.isArray(data.message) 
                ? data.message.join(", ") 
                : data.message;
            } else if (data?.error) {
              errorMessage = Array.isArray(data.error) 
                ? data.error.join(", ") 
                : data.error;
            } else if (data?.errors) {
              // Handle validation errors object
              const errorKeys = Object.keys(data.errors);
              if (errorKeys.length > 0) {
                const firstError = data.errors[errorKeys[0]];
                errorMessage = Array.isArray(firstError) 
                  ? firstError[0] 
                  : firstError;
              }
            }
            
            throw new Error(JSON.stringify({ message: errorMessage }));
          }

          const payload = data?.data ?? data ?? {};
          const accessToken = payload?.access_token ?? payload?.accessToken;
          const user = payload?.user;

          if (!accessToken || !user) {
            throw new Error("Invalid credentials");
          }

          return { ...user, accessToken };
        } catch (error) {
          // Handle network errors
          if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw new Error(JSON.stringify({ 
              message: "Unable to connect to server. Please check your connection." 
            }));
          }
          
          // Handle other errors
          const friendlyMessage = error?.message || "Unable to sign in right now.";
          throw new Error(JSON.stringify({ message: friendlyMessage }));
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.user = user;
        token.provider = "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token?.provider) {
        session.provider = token.provider;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

