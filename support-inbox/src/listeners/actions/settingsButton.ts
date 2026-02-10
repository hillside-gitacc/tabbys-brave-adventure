import type { App } from '@slack/bolt';
import { PreferencesStore } from '../../store/userPreferences';
import { buildSettingsView } from '../../views/homeSettings';

/**
 * Registers the settings_button and back_to_inbox action handlers.
 */
export function registerSettingsButton(
  app: App,
  store: PreferencesStore,
  publishService: import('../../services/publishService').PublishService,
): void {
  app.action('settings_button', async ({ ack, body, client }) => {
    await ack();

    if (body.type !== 'block_actions') return;
    const userId = body.user.id;
    const prefs = store.get(userId);

    await client.views.publish({
      user_id: userId,
      view: buildSettingsView(prefs),
    });
  });

  app.action('back_to_inbox', async ({ ack, body }) => {
    await ack();

    if (body.type !== 'block_actions') return;
    const userId = body.user.id;

    await publishService.publishNow(userId);
  });

  // Handle sort order changes
  app.action('sort_select', async ({ ack, body }) => {
    await ack();

    if (body.type !== 'block_actions' || !body.actions[0]) return;
    const userId = body.user.id;
    const action = body.actions[0];

    if (action.type === 'static_select' && action.selected_option) {
      store.set(userId, {
        sortOrder: action.selected_option.value as 'newest' | 'oldest' | 'unresponded',
      });
    }
  });
}
