import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      let session = null;

      if (typeof window !== "undefined") {
        const { getSession } = await import("next-auth/react");
        session = await getSession();
      }
      const token = session?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error attaching token:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const shouldSkipAuthRedirect = (error) => {
  const url = error?.config?.url || "";
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/reset-password") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/pages/public")
  );
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !shouldSkipAuthRedirect(error)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("persist:auth");
        localStorage.removeItem("authUser");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

