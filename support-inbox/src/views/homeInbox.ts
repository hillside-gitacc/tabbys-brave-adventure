import type { View, KnownBlock } from '@slack/types';
import { InboxMessage, UserPreferences, MESSAGES_PER_PAGE, MAX_BLOCKS } from '../types';
import { buildMessageBlock } from './components/messageBlock';
import { buildPaginationBlock } from './components/paginationBlock';

/**
 * Builds the main inbox Home tab view with messages, filters, and pagination.
 */
export function buildInboxView(
  prefs: UserPreferences,
  allMessages: InboxMessage[],
): View {
  // Apply channel filter
  let filtered = allMessages;
  if (prefs.channelFilter) {
    filtered = allMessages.filter((m) => m.channelId === prefs.channelFilter);
  }

  // Apply sort order
  switch (prefs.sortOrder) {
    case 'oldest':
      filtered = [...filtered].sort((a, b) => a.unixTs - b.unixTs);
      break;
    case 'unresponded':
      filtered = [...filtered].sort((a, b) => {
        if (!a.hasTeamReply && b.hasTeamReply) return -1;
        if (a.hasTeamReply && !b.hasTeamReply) return 1;
        return b.unixTs - a.unixTs;
      });
      break;
    case 'newest':
    default:
      // Already sorted newest first from the service
      break;
  }

  // Pagination
  const totalMessages = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalMessages / MESSAGES_PER_PAGE));
  const page = Math.min(prefs.currentPage, totalPages - 1);
  const startIdx = page * MESSAGES_PER_PAGE;
  const pageMessages = filtered.slice(startIdx, startIdx + MESSAGES_PER_PAGE);

  const newCount = filtered.filter((m) => !m.hasTeamReply).length;

  // Build unique channels for filter
  const channelSet = new Map<string, string>();
  for (const m of allMessages) {
    channelSet.set(m.channelId, m.channelName);
  }

  // Header
  const blocks: KnownBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Support Inbox${newCount > 0 ? ` (${newCount} new)` : ''}`,
        emoji: true,
      },
    },
  ];

  // Controls row
  const controlElements: any[] = [];

  // Channel filter dropdown
  const filterOptions: any[] = [
    {
      text: { type: 'plain_text', text: 'All Channels' },
      value: 'all',
    },
  ];
  for (const [id, name] of channelSet) {
    filterOptions.push({
      text: { type: 'plain_text', text: `#${name}` },
      value: id,
    });
  }
  controlElements.push({
    type: 'static_select',
    placeholder: { type: 'plain_text', text: 'Filter by channel' },
    action_id: 'channel_filter',
    initial_option: prefs.channelFilter
      ? filterOptions.find((o) => o.value === prefs.channelFilter) || filterOptions[0]
      : filterOptions[0],
    options: filterOptions,
  });

  controlElements.push({
    type: 'button',
    text: { type: 'plain_text', text: 'Refresh', emoji: true },
    action_id: 'refresh_button',
  });

  controlElements.push({
    type: 'button',
    text: { type: 'plain_text', text: 'Settings', emoji: true },
    action_id: 'settings_button',
  });

  blocks.push({
    type: 'actions',
    elements: controlElements,
  });

  // Info line
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Monitoring ${prefs.monitoredChannels.length} channel${prefs.monitoredChannels.length !== 1 ? 's' : ''} | ${totalMessages} messages`,
      },
    ],
  });

  // Messages
  if (pageMessages.length === 0) {
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No messages found. Messages from your monitored channels will appear here._',
      },
    });
  } else {
    // Each message generates ~4 blocks. Cap at MAX_BLOCKS safety margin.
    const maxMessages = Math.floor((MAX_BLOCKS - 10) / 4);
    const displayMessages = pageMessages.slice(0, maxMessages);

    for (const msg of displayMessages) {
      blocks.push(...buildMessageBlock(msg));
    }
  }

  // Pagination
  blocks.push(...buildPaginationBlock(page, totalPages));

  return {
    type: 'home',
    blocks,
  };
}
