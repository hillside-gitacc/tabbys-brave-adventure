import type { App } from '@slack/bolt';
import { PreferencesStore } from '../../store/userPreferences';
import { PublishService } from '../../services/publishService';

/**
 * Registers the channel_filter action handler.
 * Filters the inbox to show messages from a specific channel.
 */
export function registerChannelFilter(
  app: App,
  store: PreferencesStore,
  publishService: PublishService,
): void {
  app.action('channel_filter', async ({ ack, body }) => {
    await ack();

    if (body.type !== 'block_actions' || !body.actions[0]) return;
    const userId = body.user.id;
    const action = body.actions[0];

    if (action.type === 'static_select' && action.selected_option) {
      const value = action.selected_option.value;
      store.set(userId, {
        channelFilter: value === 'all' ? '' : value,
        currentPage: 0,
      });

      await publishService.publishNow(userId);
    }
  });
}
