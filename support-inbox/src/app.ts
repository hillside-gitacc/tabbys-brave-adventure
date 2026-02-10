import { App } from '@slack/bolt';
import type { View } from '@slack/types';
import { config } from './config';

// Store
import { MemoryStore } from './store/adapters/memoryStore';
import { MessageCache } from './store/messageCache';

// Services
import { UserService } from './services/userService';
import { ChannelService } from './services/channelService';
import { MessageService } from './services/messageService';
import { PublishService } from './services/publishService';

// Views
import { buildOnboardingView } from './views/homeOnboarding';
import { buildInboxView } from './views/homeInbox';

// Listeners — Events
import { registerAppHomeOpened } from './listeners/events/appHomeOpened';
import { registerMessagePosted } from './listeners/events/messagePosted';

// Listeners — Actions
import { registerReplyButton } from './listeners/actions/replyButton';
import { registerRefreshButton } from './listeners/actions/refreshButton';
import { registerSettingsButton } from './listeners/actions/settingsButton';
import { registerChannelSelect } from './listeners/actions/channelSelect';
import { registerPagination } from './listeners/actions/pagination';
import { registerChannelFilter } from './listeners/actions/channelFilter';

// Listeners — Views
import { registerReplyModal } from './listeners/views/replyModal';

// ─── Initialize Bolt App with Socket Mode ───────────────────────────

const app = new App({
  token: config.slackBotToken,
  appToken: config.slackAppToken,
  socketMode: true,
  logLevel: config.logLevel as any,
});

// ─── Initialize Stores & Services ───────────────────────────────────

const prefsStore = new MemoryStore(config.preferencesPath);
const messageCache = new MessageCache();

const userService = new UserService(app.client);
const channelService = new ChannelService(app.client);
const messageService = new MessageService(
  app.client,
  messageCache,
  userService,
  channelService,
);
const publishService = new PublishService(app.client, prefsStore);

// ─── View Builder ───────────────────────────────────────────────────

/**
 * Builds the appropriate Home tab view for a user:
 * - Onboarding if they haven't selected channels yet
 * - Inbox view with their messages otherwise
 */
async function buildHomeView(userId: string): Promise<View> {
  const prefs = prefsStore.get(userId);

  if (!prefs.onboarded || prefs.monitoredChannels.length === 0) {
    return buildOnboardingView();
  }

  const messages = await messageService.getMessages(prefs.monitoredChannels);
  return buildInboxView(prefs, messages);
}

publishService.setViewBuilder(buildHomeView);

// ─── Register Listeners ─────────────────────────────────────────────

// Events
registerAppHomeOpened(app, prefsStore, publishService);
registerMessagePosted(app, messageService, publishService);

// Actions
registerReplyButton(app, messageService);
registerRefreshButton(app, prefsStore, messageService, publishService);
registerSettingsButton(app, prefsStore, publishService);
registerChannelSelect(app, prefsStore, channelService, publishService);
registerPagination(app, prefsStore, publishService);
registerChannelFilter(app, prefsStore, publishService);

// View submissions
registerReplyModal(app, messageService, publishService);

// ─── Start ──────────────────────────────────────────────────────────

(async () => {
  await app.start();
  console.log('⚡ Support Inbox app is running (Socket Mode)');
})();
