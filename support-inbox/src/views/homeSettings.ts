import type { View } from '@slack/types';
import { UserPreferences } from '../types';

/**
 * Builds the Settings view for the Home tab.
 */
export function buildSettingsView(prefs: UserPreferences): View {
  return {
    type: 'home',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Settings',
          emoji: true,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Back to Inbox', emoji: true },
            action_id: 'back_to_inbox',
          },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Monitored Channels*\nSelect the public channels you want to monitor for support messages.',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'multi_conversations_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select channels...',
            },
            action_id: 'channel_select',
            ...(prefs.monitoredChannels.length > 0
              ? { initial_conversations: prefs.monitoredChannels }
              : {}),
            filter: {
              include: ['public'],
              exclude_bot_users: true,
            },
          },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Sort Order*\nHow should messages be sorted in your inbox?',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Sort order',
            },
            action_id: 'sort_select',
            initial_option: {
              text: {
                type: 'plain_text',
                text: sortOrderLabel(prefs.sortOrder),
              },
              value: prefs.sortOrder,
            },
            options: [
              {
                text: { type: 'plain_text', text: 'Newest First' },
                value: 'newest',
              },
              {
                text: { type: 'plain_text', text: 'Oldest First' },
                value: 'oldest',
              },
              {
                text: { type: 'plain_text', text: 'Unresponded First' },
                value: 'unresponded',
              },
            ],
          },
        ],
      },
    ],
  };
}

function sortOrderLabel(order: string): string {
  switch (order) {
    case 'newest':
      return 'Newest First';
    case 'oldest':
      return 'Oldest First';
    case 'unresponded':
      return 'Unresponded First';
    default:
      return 'Newest First';
  }
}
