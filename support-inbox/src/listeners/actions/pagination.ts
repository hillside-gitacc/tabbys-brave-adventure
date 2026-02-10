import type { App } from '@slack/bolt';
import { PreferencesStore } from '../../store/userPreferences';
import { PublishService } from '../../services/publishService';

/**
 * Registers pagination action handlers (page_prev, page_next, page_noop).
 */
export function registerPagination(
  app: App,
  store: PreferencesStore,
  publishService: PublishService,
): void {
  app.action('page_prev', async ({ ack, body }) => {
    await ack();

    if (body.type !== 'block_actions') return;
    const userId = body.user.id;
    const prefs = store.get(userId);
    const newPage = Math.max(0, prefs.currentPage - 1);
    store.set(userId, { currentPage: newPage });

    await publishService.publishNow(userId);
  });

  app.action('page_next', async ({ ack, body }) => {
    await ack();

    if (body.type !== 'block_actions') return;
    const userId = body.user.id;
    const prefs = store.get(userId);
    store.set(userId, { currentPage: prefs.currentPage + 1 });

    await publishService.publishNow(userId);
  });

  // The "Page X of Y" button is informational only
  app.action('page_noop', async ({ ack }) => {
    await ack();
  });
}
