// src/services/googleAuth.ts
/* eslint-disable @typescript-eslint/consistent-type-imports */
type TokenClient = google.accounts.oauth2.TokenClient;

// ─────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'google_token';
const EXP_KEY   = 'google_token_exp';          // millis-since-epoch

function saveToken(token: string, expiresAt: number) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXP_KEY,  expiresAt.toString());
}

function loadToken(): { token: string; expiresAt: number } | null {
  const t = sessionStorage.getItem(TOKEN_KEY);
  const e = sessionStorage.getItem(EXP_KEY);
  return t && e ? { token: t, expiresAt: Number(e) } : null;
}

// ─────────────────────────────────────────────────────────────────────────
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/photoslibrary.readonly'
].join(' ');

let tokenClient: TokenClient | null = null;
let cachedAccessToken = '';
let tokenExpiresAt = 0;                         // millis

// On page reload, revive prior token if still fresh
const cached = loadToken();
if (cached && cached.expiresAt > Date.now()) {
  cachedAccessToken = cached.token;
  tokenExpiresAt    = cached.expiresAt;
}

/**
 * Core entry point for the whole app.
 * Always returns a *valid* access-token, refreshing if needed.
 */
export async function signInWithGoogle(): Promise<string> {
  // return current token if still >60 s left
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  await ensureGisLoaded();

  if (!tokenClient) {
    // @ts-ignore
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      prompt: 'consent',
      callback: () => {}           // replaced each request
    });
  }
  


  // ---- exchange / refresh
  return new Promise<string>((resolve, reject) => {
    tokenClient!.callback = (resp) => {
      if (resp.error || !resp.access_token) {
        reject(resp);
      } else {
        cachedAccessToken = resp.access_token;
        tokenExpiresAt    = Date.now() + resp.expires_in * 1_000;
        saveToken(cachedAccessToken, tokenExpiresAt);        // ← persist
        resolve(cachedAccessToken);
      }
    };
    tokenClient!.requestAccessToken();
  });
}

/**
 * Optional sign-out helper – clears storage & revokes
 */
export function revokeGoogleToken() {
  if (!cachedAccessToken) return;
  // @ts-ignore
  window.google.accounts.oauth2.revoke(cachedAccessToken, () => {});
  cachedAccessToken = '';
  tokenExpiresAt = 0;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXP_KEY);
}

// ––– helper –––
function ensureGisLoaded(): Promise<void> {
    // TODO: remove
    console.log('GIS token ok', cachedAccessToken.slice(0, 10));
  
    // @ts-ignore
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((res, rej) => {
    const check = () =>
      // @ts-ignore
      window.google?.accounts?.oauth2 ? res() : setTimeout(check, 50);
    check();
    setTimeout(() => rej(new Error('GIS failed to load')), 5_000);
  });
}
