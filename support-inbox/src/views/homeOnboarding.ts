import type { View } from '@slack/types';

/**
 * Builds the onboarding Home tab view for first-time users.
 */
export function buildOnboardingView(): View {
  return {
    type: 'home',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Welcome to Support Inbox',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Monitor all your help channels in one place. Get started by selecting the channels you want to monitor.',
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Step 1:* Select the help channels you want to monitor',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'multi_conversations_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select channels to monitor...',
            },
            action_id: 'channel_select',
            filter: {
              include: ['public'],
              exclude_bot_users: true,
            },
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Tip: Select channels like `#help-technicalsupport`, `#help-devpods`, etc.',
          },
        ],
      },
    ],
  };
}
