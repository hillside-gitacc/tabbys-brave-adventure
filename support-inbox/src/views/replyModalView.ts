import type { View } from '@slack/types';
import { timeAgo } from '../utils/timeFormat';

interface ThreadMessage {
  userId: string;
  displayName: string;
  text: string;
  ts: string;
}

/**
 * Builds the reply modal view showing thread context and a text input.
 */
export function buildReplyModal(
  channelId: string,
  channelName: string,
  threadTs: string,
  threadMessages: ThreadMessage[],
): View {
  const blocks: any[] = [];

  // Channel info
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Replying in *#${channelName}*`,
      },
    ],
  });

  blocks.push({ type: 'divider' });

  // Show thread messages (original + replies)
  if (threadMessages.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Thread Context:*',
      },
    });

    // Show up to 10 most recent messages to stay within block limits
    const recentMessages = threadMessages.slice(-10);
    for (const msg of recentMessages) {
      const ago = timeAgo(parseFloat(msg.ts));
      const truncated =
        msg.text.length > 300 ? msg.text.substring(0, 300) + '...' : msg.text;
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*${msg.displayName}* (${ago}):\n${truncated}`,
          },
        ],
      });
    }
  }

  blocks.push({ type: 'divider' });

  // Reply text input
  blocks.push({
    type: 'input',
    block_id: 'reply_input_block',
    element: {
      type: 'plain_text_input',
      action_id: 'reply_text',
      multiline: true,
      placeholder: {
        type: 'plain_text',
        text: 'Type your reply...',
      },
    },
    label: {
      type: 'plain_text',
      text: 'Your Reply',
    },
  });

  // Deep link
  const tsFormatted = threadTs.replace('.', '');
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `<slack://channel?team=&id=${channelId}&message=${tsFormatted}|View in Channel>`,
      },
    ],
  });

  return {
    type: 'modal',
    callback_id: 'reply_modal_submit',
    title: {
      type: 'plain_text',
      text: 'Reply to Thread',
    },
    submit: {
      type: 'plain_text',
      text: 'Send Reply',
    },
    close: {
      type: 'plain_text',
      text: 'Cancel',
    },
    private_metadata: JSON.stringify({ channelId, threadTs, channelName }),
    blocks,
  };
}
