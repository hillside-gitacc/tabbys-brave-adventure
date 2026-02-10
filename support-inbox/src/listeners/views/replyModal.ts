import type { App } from '@slack/bolt';
import { PublishService } from '../../services/publishService';
import { MessageService } from '../../services/messageService';

/**
 * Registers the reply_modal_submit view handler.
 * Posts the reply to the original thread and refreshes the Home tab.
 */
export function registerReplyModal(
  app: App,
  messageService: MessageService,
  publishService: PublishService,
): void {
  app.view('reply_modal_submit', async ({ ack, body, view, client }) => {
    await ack();

    const userId = body.user.id;
    const { channelId, threadTs } = JSON.parse(view.private_metadata);

    // Extract the reply text
    const replyText =
      view.state.values.reply_input_block?.reply_text?.value;

    if (!replyText) return;

    try {
      // Post the reply as a thread message
      await client.chat.postMessage({
        channel: channelId,
        text: replyText,
        thread_ts: threadTs,
      });

      // Update the cached message to reflect the new reply
      const cached = messageService['cache'].getMessage(channelId, threadTs);
      if (cached) {
        messageService['cache'].updateReplyCount(
          channelId,
          threadTs,
          cached.replyCount + 1,
          true,
        );
      }

      // Refresh the user's Home tab
      await publishService.publishNow(userId);
    } catch (err) {
      console.error(`[replyModal] Failed to post reply:`, err);
    }
  });
}
