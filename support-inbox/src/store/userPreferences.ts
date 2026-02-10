import { UserPreferences, DEFAULT_PREFERENCES } from '../types';

export interface PreferencesStore {
  get(userId: string): UserPreferences;
  set(userId: string, prefs: Partial<UserPreferences>): UserPreferences;
  getAllActiveUsers(windowMs: number): string[];
}
