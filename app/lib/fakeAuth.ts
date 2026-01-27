export const FAKE_AUTH_KEY = "lu_logged_in_email";

export function getFakeUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FAKE_AUTH_KEY);
}

export function fakeLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FAKE_AUTH_KEY);
}
