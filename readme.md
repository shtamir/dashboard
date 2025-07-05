# Family TV Dashboard

```bash
# 1. Clone the repo (or copy these files)
# 2. Install dependencies
npm install

# 3. Create a .env file from the example
cp .env.example .env
#    → Paste your API keys

# 4. Run the development server
npm run dev
#    → open http://localhost:5173

```

## Persistent Google sign-in

The dashboard now stores your Google access token in `localStorage` so you
stay signed in even after restarting the TV or browser. To clear the token,
use the "Log out" option in the settings menu.

## Preventing screen sleep

The dashboard requests a screen wake lock so the TV doesn't dim or show a
screen saver while it's running. If the browser releases the lock or the page
regains focus after being hidden, the dashboard automatically re-acquires the
lock to keep the screen awake.
