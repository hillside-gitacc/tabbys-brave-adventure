import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  slackBotToken: requireEnv('SLACK_BOT_TOKEN'),
  slackAppToken: requireEnv('SLACK_APP_TOKEN'),
  preferencesPath: process.env.PREFERENCES_PATH || './data/preferences.json',
  logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
};
