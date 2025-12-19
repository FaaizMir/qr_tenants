import axiosInstance from "../axios";
import { setAuth } from "../auth-utils";

const looksLikeEmail = (input) => /\S+@\S+\.\S+/.test(input);

function buildPayload(username, password) {
  if (looksLikeEmail(username)) return { email: username, password };
  return { username, password };
}

/**
 * Call /auth/login using configured axiosInstance (baseURL from env)
 * On success persist JWT + user via setAuth and return { user, token, data }
 * Sends a single request determined from the input (email vs username) to avoid duplicate calls.
 */
export async function login(username, password) {
  const payload = buildPayload(username, password);

  const resp = await axiosInstance.post("/auth/login", payload);
  const data = resp.data || {};

  const token = data?.token || data?.accessToken || data?.access_token || null;
  let user = data?.user || data?.data || null;

  if (!user) {
    const { role, email, name, username: uname } = data || {};
    if (role) user = { role, email, name, username: uname };
  }

  if (!token || !user) {
    throw new Error("Invalid login response");
  }

  // persist token + user
  setAuth(user, token);

  return { user, token, data };
}

export default { login };
