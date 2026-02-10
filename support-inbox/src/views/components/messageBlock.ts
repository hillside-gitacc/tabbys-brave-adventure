import type { KnownBlock } from '@slack/types';
import { InboxMessage } from '../../types';
import { timeAgo } from '../../utils/timeFormat';

/**
 * Builds the Block Kit blocks for a single inbox message.
 * Returns 3-4 blocks per message: divider, context, section, actions.
 */
export function buildMessageBlock(message: InboxMessage): KnownBlock[] {
  const statusEmoji = message.hasTeamReply ? ':white_check_mark:' : ':warning:';
  const statusText = message.hasTeamReply ? 'Responded' : 'Needs attention';
  const urgencyDot = !message.hasTeamReply && message.replyCount === 0 ? ':red_circle: ' : '';
  const ago = timeAgo(message.unixTs);

  // Truncate long messages
  const displayText =
    message.text.length > 200 ? message.text.substring(0, 200) + '...' : message.text;

  const blocks: KnownBlock[] = [
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `${urgencyDot}*#${message.channelName}* | <@${message.userId}> | ${ago}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `"${displayText}"`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Reply',
          emoji: true,
        },
        action_id: 'reply_button',
        value: JSON.stringify({
          channelId: message.channelId,
          threadTs: message.ts,
          channelName: message.channelName,
        }),
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `${message.replyCount} replies | ${statusEmoji} ${statusText}`,
        },
      ],
    },
  ];

  return blocks;
}
