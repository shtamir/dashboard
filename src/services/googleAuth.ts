// src/services/googleAuth.ts
/* eslint-disable @typescript-eslint/consistent-type-imports */

// Add type definitions for Google Sign-In
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string }) => void;
            privacy_policy_url?: string;
            terms_of_service_url?: string;
            popup_type?: string;
            state?: string;
          }) => TokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

type TokenClient = {
  callback: (response: TokenResponse) => void;
  requestAccessToken: (config?: { prompt: string; hint?: string; popup_type?: string }) => void;
};

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
      callback: () => {},           // replaced each request
      error_callback: (error) => {
        console.error('Google Sign-In error:', error);
        if (error.type === 'popup_closed_by_user') {
          alert('Please allow popups for this site to sign in with Google');
        } else if (error.type === 'host_not_supported') {
          alert('This domain is not authorized for Google Sign-In. Please contact support.');
        }
      },
      // Add privacy policy and terms of service URLs
      privacy_policy_url: `${window.location.origin}/privacy`,
      terms_of_service_url: `${window.location.origin}/terms`,
      // Add COOP handling
      popup_type: 'redirect',
      state: window.location.origin
    });
  }

  // ---- exchange / refresh
  return new Promise<string>((resolve, reject) => {
    tokenClient!.callback = (resp) => {
      if (resp.error) {
        console.error('Token error:', resp.error);
        if (resp.error === 'popup_closed_by_user') {
          alert('Please allow popups for this site to sign in with Google');
        } else if (resp.error === 'host_not_supported') {
          alert('This domain is not authorized for Google Sign-In. Please contact support.');
        }
        reject(resp);
      } else if (!resp.access_token) {
        reject(new Error('No access token received'));
      } else {
        cachedAccessToken = resp.access_token;
        tokenExpiresAt = Date.now() + (resp.expires_in || 3600) * 1_000;
        saveToken(cachedAccessToken, tokenExpiresAt);        // ← persist
        resolve(cachedAccessToken);
      }
    };
    
    try {
      // Use redirect flow instead of popup
      tokenClient!.requestAccessToken({ 
        prompt: 'consent',
        hint: window.location.origin,
        popup_type: 'redirect'
      });
    } catch (err) {
      console.error('Failed to request access token:', err);
      alert('Please allow popups for this site to sign in with Google');
      reject(err);
    }
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
