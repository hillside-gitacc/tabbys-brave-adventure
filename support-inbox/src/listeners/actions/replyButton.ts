import type { App } from '@slack/bolt';
import { MessageService } from '../../services/messageService';
import { buildReplyModal } from '../../views/replyModalView';

/**
 * Registers the reply_button action handler.
 * Opens a modal with thread context and a text input.
 */
export function registerReplyButton(app: App, messageService: MessageService): void {
  app.action('reply_button', async ({ ack, body, client }) => {
    await ack();

    if (body.type !== 'block_actions' || !body.actions[0]) return;

    const action = body.actions[0];
    if (action.type !== 'button' || !action.value) return;

    const { channelId, threadTs, channelName } = JSON.parse(action.value);

    // Fetch thread context
    const threadMessages = await messageService.getThreadReplies(channelId, threadTs);

    const modal = buildReplyModal(channelId, channelName, threadTs, threadMessages);

    await client.views.open({
      trigger_id: body.trigger_id,
      view: modal,
    });
  });
}
