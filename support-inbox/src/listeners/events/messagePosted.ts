import type { App } from '@slack/bolt';
import { MessageService } from '../../services/messageService';
import { PublishService } from '../../services/publishService';

/**
 * Registers the message.channels event listener.
 * When a message is posted in any channel the bot is in,
 * check if it's a monitored channel and update relevant users' Home tabs.
 */
export function registerMessagePosted(
  app: App,
  messageService: MessageService,
  publishService: PublishService,
): void {
  app.event('message', async ({ event }) => {
    // Only handle channel messages (not DMs, etc.)
    if (event.channel_type !== 'channel') return;

    // Skip message subtypes we don't care about (edits, deletions, bot messages)
    const subtype = (event as any).subtype;
    if (subtype === 'message_changed' || subtype === 'message_deleted') return;
    if ((event as any).bot_id) return;

    const channelId = event.channel;
    const ts = (event as any).ts as string;
    const userId = (event as any).user as string;
    const text = (event as any).text as string;
    const threadTs = (event as any).thread_ts as string | undefined;

    if (!userId || !ts) return;

    // Process the message (adds to cache, updates reply counts)
    await messageService.processNewMessage(channelId, ts, userId, text, threadTs);

    // Proactively update Home tabs for all active users monitoring this channel
    publishService.publishToActiveUsersForChannel(channelId);
  });
}
