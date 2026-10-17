// Owner authentication and password storage utilities for Firey Treat Restaurant
export const OWNER_PASSWORD_KEY = 'firey_treat_owner_password_v1';
export const DEFAULT_OWNER_PASSWORD = '8143';

/**
 * Retrieves the active owner password from localStorage, defaulting to '8143'.
 */
export function getOwnerPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_OWNER_PASSWORD;
  try {
    const saved = localStorage.getItem(OWNER_PASSWORD_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {
    console.error('Error reading owner password:', e);
  }
  return DEFAULT_OWNER_PASSWORD;
}

/**
 * Updates the owner password in localStorage.
 */
export function setOwnerPassword(newPassword: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(OWNER_PASSWORD_KEY, newPassword.trim());
    return true;
  } catch (e) {
    console.error('Error saving owner password:', e);
    return false;
  }
}

/**
 * Checks whether the given password matches the active owner password.
 */
export function verifyOwnerPassword(password: string): boolean {
  const current = getOwnerPassword();
  return password.trim() === current;
}

/**
 * Resets the owner password back to the default '8143'.
 */
export function resetOwnerPasswordToDefault(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(OWNER_PASSWORD_KEY);
    return true;
  } catch (e) {
    console.error('Error resetting owner password:', e);
    return false;
  }
}

/**
 * Checks if the owner is currently using a custom password or the default '8143'.
 */
export function isUsingCustomPassword(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(OWNER_PASSWORD_KEY);
    return Boolean(saved && saved.trim() && saved.trim() !== DEFAULT_OWNER_PASSWORD);
  } catch {
    return false;
  }
}
