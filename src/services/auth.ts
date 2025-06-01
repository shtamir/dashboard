// src/services/auth.ts
import { signInWithGoogle, revokeGoogleToken } from './googleAuth';

/**
 * Always returns a *fresh* Google access-token.
 * Other service modules (calendar, sheets, photos) should import this.
 */
export async function getAccessToken(): Promise<string> {
  return signInWithGoogle();          // 1-liner proxy → keeps codebase clean
}

/**
 * Call when the user hits “Log out” in Settings.
 */
export function signOut() {
  revokeGoogleToken();
}
