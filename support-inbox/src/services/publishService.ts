import { WebClient } from '@slack/web-api';
import type { View } from '@slack/types';
import { Debouncer } from '../utils/rateLimiter';
import { PUBLISH_DEBOUNCE_MS, ACTIVE_USER_WINDOW_MS } from '../types';
import { PreferencesStore } from '../store/userPreferences';

export type ViewBuilder = (userId: string) => Promise<View>;

/**
 * Manages debounced views.publish calls to respect Slack rate limits.
 * Coalesces multiple updates for the same user within a debounce window.
 */
export class PublishService {
  private client: WebClient;
  private debouncer: Debouncer;
  private store: PreferencesStore;
  private viewBuilder: ViewBuilder | null = null;

  constructor(client: WebClient, store: PreferencesStore) {
    this.client = client;
    this.store = store;
    this.debouncer = new Debouncer(PUBLISH_DEBOUNCE_MS);
  }

  /** Set the function that builds the Home tab view for a user */
  setViewBuilder(builder: ViewBuilder): void {
    this.viewBuilder = builder;
  }

  /**
   * Publish the Home tab view for a user immediately.
   */
  async publishNow(userId: string): Promise<void> {
    if (!this.viewBuilder) {
      console.warn('[publishService] No view builder set');
      return;
    }

    try {
      const view = await this.viewBuilder(userId);
      await this.client.views.publish({
        user_id: userId,
        view,
      });
    } catch (err) {
      console.error(`[publishService] Failed to publish view for ${userId}:`, err);
    }
  }

  /**
   * Schedule a debounced publish for a user.
   * Multiple calls within the debounce window are coalesced.
   */
  publishDebounced(userId: string): void {
    this.debouncer.debounce(userId, () => {
      this.publishNow(userId);
    });
  }

  /**
   * Publish updates to all active users who monitor a given channel.
   * Used when a new message arrives in a monitored channel.
   */
  publishToActiveUsersForChannel(channelId: string): void {
    const activeUsers = this.store.getAllActiveUsers(ACTIVE_USER_WINDOW_MS);

    for (const userId of activeUsers) {
      const prefs = this.store.get(userId);
      if (prefs.monitoredChannels.includes(channelId)) {
        this.publishDebounced(userId);
      }
    }
  }
}
