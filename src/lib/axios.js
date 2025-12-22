// import axios from "axios";
// import { getSession } from "next-auth/react";

// const baseUrl =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   process.env.NEXT_PUBLIC_BACKEND_URL ||
//   process.env.NEXT_PUBLIC_API_URL ||
//   "";

// const axiosInstance = axios.create({
//   baseURL: baseUrl,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// axiosInstance.interceptors.request.use(async (config) => {
//   try {
//     // Use NextAuth session to get token
//     const session = await getSession();
//     const token = session?.accessToken || session?.access_token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   } catch (error) {
//     console.error("Error attaching token:", error);
//   }
//   return config;
// }, (error) => Promise.reject(error));

// const shouldSkipAuthRedirect = (error) => {
//   const url = error?.config?.url || "";
//   return (
//     url.includes("/auth/login") ||
//     url.includes("/auth/register") ||
//     url.includes("/auth/reset-password") ||
//     url.includes("/auth/forgot-password") ||
//     url.includes("/pages/public")
//   );
// };

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // For 401 responses, don't mutate local auth state here.
//     // Keep a debug log so we can trace which request returned 401.
//     if (error.response?.status === 401 && !shouldSkipAuthRedirect(error)) {
//       if (typeof window !== "undefined") {
//         try {
//           // eslint-disable-next-line no-console
//           console.debug("Axios 401 — received for url:", error?.config?.url, "status:", error?.response?.status);
//         } catch (e) {}
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

