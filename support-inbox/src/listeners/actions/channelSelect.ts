import type { App } from '@slack/bolt';
import { PreferencesStore } from '../../store/userPreferences';
import { ChannelService } from '../../services/channelService';
import { PublishService } from '../../services/publishService';

/**
 * Registers the channel_select action handler.
 * Saves the user's channel selection, joins the channels, and refreshes the inbox.
 */
export function registerChannelSelect(
  app: App,
  store: PreferencesStore,
  channelService: ChannelService,
  publishService: PublishService,
): void {
  app.action('channel_select', async ({ ack, body }) => {
    await ack();

    if (body.type !== 'block_actions' || !body.actions[0]) return;
    const userId = body.user.id;
    const action = body.actions[0];

    if (action.type !== 'multi_conversations_select') return;

    const selectedChannels = action.selected_conversations || [];

    // Join all selected channels so the bot can read messages
    await channelService.joinChannels(selectedChannels);

    // Save preferences
    store.set(userId, {
      monitoredChannels: selectedChannels,
      onboarded: true,
      currentPage: 0,
    });

    // Refresh the Home tab with the inbox view
    await publishService.publishNow(userId);
  });
}
