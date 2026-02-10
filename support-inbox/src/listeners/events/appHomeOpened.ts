import type { App } from '@slack/bolt';
import { PreferencesStore } from '../../store/userPreferences';
import { PublishService } from '../../services/publishService';

/**
 * Registers the app_home_opened event listener.
 * When a user opens the Home tab, render the appropriate view
 * (onboarding or inbox) based on their preferences.
 */
export function registerAppHomeOpened(
  app: App,
  store: PreferencesStore,
  publishService: PublishService,
): void {
  app.event('app_home_opened', async ({ event }) => {
    if (event.tab !== 'home') return;

    const userId = event.user;

    // Mark user as active
    store.set(userId, { lastActiveTs: Date.now() });

    // Publish the Home tab
    await publishService.publishNow(userId);
  });
}
