import { WebClient } from '@slack/web-api';
import NodeCache from 'node-cache';
import { ChannelInfo } from '../types';

/**
 * Caches channel info and handles joining channels.
 */
export class ChannelService {
  private cache: NodeCache;
  private client: WebClient;

  constructor(client: WebClient) {
    this.client = client;
    this.cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
  }

  async getChannel(channelId: string): Promise<ChannelInfo> {
    const cached = this.cache.get<ChannelInfo>(channelId);
    if (cached) return cached;

    try {
      const result = await this.client.conversations.info({ channel: channelId });
      const info: ChannelInfo = {
        id: channelId,
        name: result.channel?.name || channelId,
      };
      this.cache.set(channelId, info);
      return info;
    } catch (err) {
      console.warn(`[channelService] Failed to fetch channel ${channelId}:`, err);
      return { id: channelId, name: channelId };
    }
  }

  async getChannelName(channelId: string): Promise<string> {
    const info = await this.getChannel(channelId);
    return info.name;
  }

  async joinChannel(channelId: string): Promise<boolean> {
    try {
      await this.client.conversations.join({ channel: channelId });
      return true;
    } catch (err: any) {
      // "already_in_channel" is not an error
      if (err?.data?.error === 'already_in_channel') return true;
      console.warn(`[channelService] Failed to join channel ${channelId}:`, err);
      return false;
    }
  }

  async joinChannels(channelIds: string[]): Promise<void> {
    await Promise.all(channelIds.map((id) => this.joinChannel(id)));
  }
}
