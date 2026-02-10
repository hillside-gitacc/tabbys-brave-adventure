# Slack Unified Support Inbox

A Slack App Home that aggregates messages from multiple help channels into a single inbox, with thread reply support.

## Features

- **Unified Inbox** — See messages from all your monitored help channels in one place
- **Real-time Updates** — Home tab updates automatically when new messages arrive
- **Thread Replies** — Reply to messages via a modal, posted as thread replies in the original channel
- **Pagination** — Navigate through messages with Prev/Next controls
- **Filters & Sort** — Filter by channel, sort by newest/oldest/unresponded
- **Per-user Settings** — Each user picks which channels to monitor

## Prerequisites

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Enable **Socket Mode** (Settings → Socket Mode → Enable)
3. Generate an **App-Level Token** with `connections:write` scope
4. Add **Bot Token Scopes** under OAuth & Permissions:
   - `channels:history`
   - `channels:read`
   - `channels:join`
   - `chat:write`
   - `users:read`
5. Enable **Event Subscriptions** and subscribe to:
   - `app_home_opened`
   - `message.channels`
6. Enable **Interactivity & Shortcuts**
7. Enable **App Home** → check "Home Tab"
8. Install the app to your workspace

## Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your tokens

# Run the app
npm start

# Or run in dev mode with auto-reload
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Bot User OAuth Token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Yes | App-Level Token (`xapp-...`) |
| `PREFERENCES_PATH` | No | Path to store user preferences (default: `./data/preferences.json`) |
| `LOG_LEVEL` | No | Log level: `debug`, `info`, `warn`, `error` (default: `info`) |

## Usage

1. Open the app's **Home tab** in Slack
2. Select the help channels you want to monitor
3. Messages from those channels appear in your inbox
4. Click **Reply** on any message to open a thread reply modal
5. Use **Refresh** to manually update, or wait for auto-updates
6. Use **Settings** to change monitored channels or sort order

## Project Structure

```
src/
  app.ts                    — Bolt app init + Socket Mode
  config.ts                 — Environment variable loading
  types/index.ts            — Shared TypeScript interfaces
  listeners/
    events/                 — Event handlers (app_home_opened, message)
    actions/                — Action handlers (buttons, selects)
    views/                  — View submission handlers (reply modal)
  views/
    homeInbox.ts            — Inbox Block Kit view
    homeSettings.ts         — Settings Block Kit view
    homeOnboarding.ts       — First-time setup view
    replyModalView.ts       — Reply modal structure
    components/             — Reusable Block Kit components
  services/
    messageService.ts       — Fetch + cache messages
    userService.ts          — User profile caching
    channelService.ts       — Channel info + join
    publishService.ts       — Debounced views.publish
  store/
    userPreferences.ts      — Preferences interface
    adapters/memoryStore.ts — In-memory + JSON persistence
    messageCache.ts         — Message cache with TTL
  utils/
    timeFormat.ts           — Relative time formatting
    rateLimiter.ts          — Debounce utilities
```
