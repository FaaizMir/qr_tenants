// Authentication utilities (persist user + token in localStorage)

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export function setAuth(user, token) {
  setCurrentUser(user);
  if (token) {
    setToken(token);
    // also set cookies so middleware can read role/token on server-side
    try {
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      document.cookie = `authToken=${token}; path=/; max-age=${maxAge}`;
      const role = (user?.role || "").toLowerCase();
      document.cookie = `userRole=${role}; path=/; max-age=${maxAge}`;
    } catch (e) {
      // ignore in non-browser environments
    }
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  localStorage.removeItem('subscriptionType');
  try {
    // clear cookies
    document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  } catch (e) {}
}

export function getSubscriptionType() {
  if (typeof window === 'undefined') return 'temporary';
  return localStorage.getItem('subscriptionType') || 'temporary';
}

export function setSubscriptionType(type) {
  if (typeof window === 'undefined') return;
  if (type !== 'annual' && type !== 'temporary') {
    throw new Error('Invalid subscription type. Must be "annual" or "temporary"');
  }
  localStorage.setItem('subscriptionType', type);
}
