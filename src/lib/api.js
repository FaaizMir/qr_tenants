import axiosInstance from "./axios";

const payloadVariants = (username, password) => [
  { username, password },
  { email: username, password },
  { identifier: username, password },
];

export async function login(username, password) {
  let lastError = null;

  for (const payload of payloadVariants(username, password)) {
    try {
      const resp = await axiosInstance.post("/auth/login", payload);
      return resp.data;
    } catch (err) {
      lastError = err;
      // If validation error (422) try next payload, otherwise rethrow immediately
      const status = err?.response?.status;
      if (status && Number(status) !== 422) {
        throw err;
      }
      // else continue to next variant
    }
  }

  // All variants failed; throw last error
  throw lastError;
}

export default {
  login,
};
