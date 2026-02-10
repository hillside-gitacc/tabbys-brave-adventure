import { WebClient } from '@slack/web-api';
import NodeCache from 'node-cache';
import { UserInfo } from '../types';

/**
 * Caches Slack user profiles to avoid repeated API calls.
 */
export class UserService {
  private cache: NodeCache;
  private client: WebClient;

  constructor(client: WebClient) {
    this.client = client;
    this.cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
  }

  async getUser(userId: string): Promise<UserInfo> {
    const cached = this.cache.get<UserInfo>(userId);
    if (cached) return cached;

    try {
      const result = await this.client.users.info({ user: userId });
      const profile = result.user?.profile;
      const info: UserInfo = {
        id: userId,
        displayName: profile?.display_name || profile?.real_name || userId,
        realName: profile?.real_name || userId,
        avatar: profile?.image_48 || '',
      };
      this.cache.set(userId, info);
      return info;
    } catch (err) {
      console.warn(`[userService] Failed to fetch user ${userId}:`, err);
      return { id: userId, displayName: userId, realName: userId, avatar: '' };
    }
  }

  async getDisplayName(userId: string): Promise<string> {
    const info = await this.getUser(userId);
    return info.displayName;
  }
}
