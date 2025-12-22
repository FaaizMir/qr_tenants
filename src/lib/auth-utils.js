import { getSession } from "next-auth/react";

// Authentication utilities using NextAuth session

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export function setCurrentUser(user) {
  // No-op: NextAuth manages user in session
}

export function setToken(token) {
  // No-op: NextAuth manages token in session
}

export async function getToken() {
  const session = await getSession();
  return session?.accessToken || session?.access_token || null;
}

export function setAuth(user, token) {
  // No-op: NextAuth handles auth state
}

export function logout() {
  // Use NextAuth signOut instead (call from components)
}

export async function getSubscriptionType() {
  // Assuming subscriptionType is in user or session; adjust based on your API
  const session = await getSession();
  return session?.user?.subscriptionType || "temporary";
}

export function setSubscriptionType(type) {
  // No-op: Manage via NextAuth or API
}
