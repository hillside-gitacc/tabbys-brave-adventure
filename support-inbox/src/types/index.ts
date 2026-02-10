/** A message from a monitored Slack channel */
export interface InboxMessage {
  /** Channel ID where the message was posted */
  channelId: string;
  /** Channel name (e.g., "help-devpods") */
  channelName: string;
  /** Message timestamp — also serves as unique ID */
  ts: string;
  /** User ID of the message author */
  userId: string;
  /** Display name of the message author */
  displayName: string;
  /** Message text content */
  text: string;
  /** Unix timestamp (seconds) */
  unixTs: number;
  /** Number of thread replies */
  replyCount: number;
  /** Whether the support team has replied */
  hasTeamReply: boolean;
  /** Permalink to message */
  permalink?: string;
}

/** User preferences stored per Slack user */
export interface UserPreferences {
  /** Slack user ID */
  userId: string;
  /** Channel IDs the user is monitoring */
  monitoredChannels: string[];
  /** Sort order for inbox messages */
  sortOrder: 'newest' | 'oldest' | 'unresponded';
  /** Currently selected channel filter (empty = all) */
  channelFilter: string;
  /** Current page number (0-indexed) */
  currentPage: number;
  /** Whether the user has completed onboarding */
  onboarded: boolean;
  /** Last time the user opened the Home tab (unix ms) */
  lastActiveTs: number;
}

/** Default preferences for new users */
export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  monitoredChannels: [],
  sortOrder: 'newest',
  channelFilter: '',
  currentPage: 0,
  onboarded: false,
  lastActiveTs: 0,
};

/** Channel info cache entry */
export interface ChannelInfo {
  id: string;
  name: string;
}

/** User info cache entry */
export interface UserInfo {
  id: string;
  displayName: string;
  realName: string;
  avatar: string;
}

/** Publish job for the debounced publisher */
export interface PublishJob {
  userId: string;
  scheduledAt: number;
}

/** Messages per page in the inbox view */
export const MESSAGES_PER_PAGE = 20;

/** Maximum Block Kit blocks per view */
export const MAX_BLOCKS = 100;

/** Debounce window for views.publish (ms) */
export const PUBLISH_DEBOUNCE_MS = 3000;

/** How long to consider a user "active" for proactive updates (ms) — 10 minutes */
export const ACTIVE_USER_WINDOW_MS = 10 * 60 * 1000;

/** TTL for message cache entries (seconds) */
export const MESSAGE_CACHE_TTL_S = 300;

/** How many messages to fetch per channel via conversations.history */
export const HISTORY_FETCH_LIMIT = 50;
