import { WebClient } from '@slack/web-api';
import { InboxMessage, HISTORY_FETCH_LIMIT } from '../types';
import { MessageCache } from '../store/messageCache';
import { UserService } from './userService';
import { ChannelService } from './channelService';

/**
 * Fetches and caches messages from monitored Slack channels.
 */
export class MessageService {
  private client: WebClient;
  private cache: MessageCache;
  private userService: UserService;
  private channelService: ChannelService;

  constructor(
    client: WebClient,
    cache: MessageCache,
    userService: UserService,
    channelService: ChannelService,
  ) {
    this.client = client;
    this.cache = cache;
    this.userService = userService;
    this.channelService = channelService;
  }

  /**
   * Get messages for multiple channels, using cache when available.
   * Returns messages sorted by timestamp (newest first).
   */
  async getMessages(channelIds: string[]): Promise<InboxMessage[]> {
    const allMessages: InboxMessage[] = [];

    await Promise.all(
      channelIds.map(async (channelId) => {
        const msgs = await this.getChannelMessages(channelId);
        allMessages.push(...msgs);
      }),
    );

    allMessages.sort((a, b) => b.unixTs - a.unixTs);
    return allMessages;
  }

  /**
   * Get messages for a single channel. Uses cache if available,
   * otherwise fetches from Slack API.
   */
  async getChannelMessages(channelId: string): Promise<InboxMessage[]> {
    const cached = this.cache.getChannel(channelId);
    if (cached) return cached;

    return this.fetchChannelMessages(channelId);
  }

  /**
   * Fetch fresh messages from a channel via conversations.history.
   */
  async fetchChannelMessages(channelId: string): Promise<InboxMessage[]> {
    try {
      const result = await this.client.conversations.history({
        channel: channelId,
        limit: HISTORY_FETCH_LIMIT,
      });

      const channelName = await this.channelService.getChannelName(channelId);
      const messages: InboxMessage[] = [];

      for (const msg of result.messages || []) {
        // Skip bot messages, join/leave events, etc.
        if (msg.subtype && msg.subtype !== 'file_share') continue;
        if (!msg.ts || !msg.user) continue;

        const displayName = await this.userService.getDisplayName(msg.user);

        messages.push({
          channelId,
          channelName,
          ts: msg.ts,
          userId: msg.user,
          displayName,
          text: msg.text || '',
          unixTs: parseFloat(msg.ts),
          replyCount: msg.reply_count || 0,
          hasTeamReply: (msg.reply_count || 0) > 0,
          permalink: undefined,
        });
      }

      this.cache.setChannel(channelId, messages);
      return messages;
    } catch (err) {
      console.error(`[messageService] Failed to fetch messages for ${channelId}:`, err);
      return [];
    }
  }

  /**
   * Process a newly received message event and add it to the cache.
   */
  async processNewMessage(
    channelId: string,
    ts: string,
    userId: string,
    text: string,
    threadTs?: string,
  ): Promise<InboxMessage | null> {
    // If this is a thread reply (not a top-level message), update the parent's reply count
    if (threadTs && threadTs !== ts) {
      const parent = this.cache.getMessage(channelId, threadTs);
      if (parent) {
        this.cache.updateReplyCount(channelId, threadTs, parent.replyCount + 1, true);
      }
      return null; // Don't add thread replies as inbox items
    }

    const [channelName, displayName] = await Promise.all([
      this.channelService.getChannelName(channelId),
      this.userService.getDisplayName(userId),
    ]);

    const message: InboxMessage = {
      channelId,
      channelName,
      ts,
      userId,
      displayName,
      text: text || '',
      unixTs: parseFloat(ts),
      replyCount: 0,
      hasTeamReply: false,
    };

    this.cache.addMessage(channelId, message);
    return message;
  }

  /**
   * Fetch thread replies for a message (used in the reply modal).
   */
  async getThreadReplies(
    channelId: string,
    threadTs: string,
  ): Promise<Array<{ userId: string; displayName: string; text: string; ts: string }>> {
    try {
      const result = await this.client.conversations.replies({
        channel: channelId,
        ts: threadTs,
        limit: 20,
      });

      const replies: Array<{ userId: string; displayName: string; text: string; ts: string }> = [];
      for (const msg of result.messages || []) {
        if (!msg.user || !msg.ts) continue;
        const displayName = await this.userService.getDisplayName(msg.user);
        replies.push({
          userId: msg.user,
          displayName,
          text: msg.text || '',
          ts: msg.ts,
        });
      }
      return replies;
    } catch (err) {
      console.error(`[messageService] Failed to fetch thread for ${channelId}/${threadTs}:`, err);
      return [];
    }
  }

  /** Invalidate cache for a channel to force fresh fetch */
  invalidateChannel(channelId: string): void {
    this.cache.invalidateChannel(channelId);
  }
}
