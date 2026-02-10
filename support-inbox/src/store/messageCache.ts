import NodeCache from 'node-cache';
import { InboxMessage, MESSAGE_CACHE_TTL_S } from '../types';

/**
 * In-memory cache for messages from monitored channels.
 * Keyed by channelId, stores an array of InboxMessage sorted newest-first.
 * Also stores individual messages keyed by `channelId:ts` for quick lookup.
 */
export class MessageCache {
  private channelMessages: NodeCache;
  private individualMessages: NodeCache;

  constructor(ttlSeconds: number = MESSAGE_CACHE_TTL_S) {
    this.channelMessages = new NodeCache({ stdTTL: ttlSeconds, checkperiod: 60 });
    this.individualMessages = new NodeCache({ stdTTL: ttlSeconds * 2, checkperiod: 60 });
  }

  /** Get all cached messages for a channel */
  getChannel(channelId: string): InboxMessage[] | undefined {
    return this.channelMessages.get<InboxMessage[]>(channelId);
  }

  /** Set all messages for a channel (from conversations.history) */
  setChannel(channelId: string, messages: InboxMessage[]): void {
    this.channelMessages.set(channelId, messages);
    for (const msg of messages) {
      this.individualMessages.set(`${channelId}:${msg.ts}`, msg);
    }
  }

  /** Prepend a new message to a channel's cached list */
  addMessage(channelId: string, message: InboxMessage): void {
    const existing = this.getChannel(channelId) || [];
    // Avoid duplicates
    const filtered = existing.filter((m) => m.ts !== message.ts);
    filtered.unshift(message);
    this.channelMessages.set(channelId, filtered);
    this.individualMessages.set(`${channelId}:${message.ts}`, message);
  }

  /** Get a specific message */
  getMessage(channelId: string, ts: string): InboxMessage | undefined {
    return this.individualMessages.get<InboxMessage>(`${channelId}:${ts}`);
  }

  /** Update reply count for a message */
  updateReplyCount(channelId: string, threadTs: string, replyCount: number, hasTeamReply: boolean): void {
    const msg = this.getMessage(channelId, threadTs);
    if (msg) {
      msg.replyCount = replyCount;
      msg.hasTeamReply = hasTeamReply;
      this.individualMessages.set(`${channelId}:${threadTs}`, msg);

      // Also update in channel list
      const channelMsgs = this.getChannel(channelId);
      if (channelMsgs) {
        const idx = channelMsgs.findIndex((m) => m.ts === threadTs);
        if (idx >= 0) {
          channelMsgs[idx] = msg;
          this.channelMessages.set(channelId, channelMsgs);
        }
      }
    }
  }

  /** Invalidate cache for a channel */
  invalidateChannel(channelId: string): void {
    this.channelMessages.del(channelId);
  }

  /** Invalidate all caches */
  flush(): void {
    this.channelMessages.flushAll();
    this.individualMessages.flushAll();
  }
}
