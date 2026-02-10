import type { App } from '@slack/bolt';
import { PreferencesStore } from '../../store/userPreferences';
import { MessageService } from '../../services/messageService';
import { PublishService } from '../../services/publishService';

/**
 * Registers the refresh_button action handler.
 * Invalidates caches and re-publishes the Home tab.
 */
export function registerRefreshButton(
  app: App,
  store: PreferencesStore,
  messageService: MessageService,
  publishService: PublishService,
): void {
  app.action('refresh_button', async ({ ack, body }) => {
    await ack();

    if (body.type !== 'block_actions') return;
    const userId = body.user.id;

    // Invalidate message caches for all monitored channels
    const prefs = store.get(userId);
    for (const channelId of prefs.monitoredChannels) {
      messageService.invalidateChannel(channelId);
    }

    // Re-publish immediately
    await publishService.publishNow(userId);
  });
}
