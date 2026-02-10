import * as fs from 'fs';
import * as path from 'path';
import { PreferencesStore } from '../userPreferences';
import { UserPreferences, DEFAULT_PREFERENCES } from '../../types';

export class MemoryStore implements PreferencesStore {
  private data: Map<string, UserPreferences> = new Map();
  private filePath: string;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  get(userId: string): UserPreferences {
    const existing = this.data.get(userId);
    if (existing) return existing;

    const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, userId };
    this.data.set(userId, prefs);
    this.scheduleSave();
    return prefs;
  }

  set(userId: string, partial: Partial<UserPreferences>): UserPreferences {
    const current = this.get(userId);
    const updated: UserPreferences = { ...current, ...partial, userId };
    this.data.set(userId, updated);
    this.scheduleSave();
    return updated;
  }

  getAllActiveUsers(windowMs: number): string[] {
    const cutoff = Date.now() - windowMs;
    const active: string[] = [];
    for (const [userId, prefs] of this.data) {
      if (prefs.lastActiveTs >= cutoff && prefs.monitoredChannels.length > 0) {
        active.push(userId);
      }
    }
    return active;
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const entries: UserPreferences[] = JSON.parse(raw);
        for (const entry of entries) {
          this.data.set(entry.userId, entry);
        }
        console.log(`[store] Loaded ${this.data.size} user preferences from ${this.filePath}`);
      }
    } catch (err) {
      console.warn('[store] Failed to load preferences file, starting fresh:', err);
    }
  }

  private scheduleSave(): void {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.saveToDisk();
    }, 2000);
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const entries = Array.from(this.data.values());
      fs.writeFileSync(this.filePath, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (err) {
      console.error('[store] Failed to save preferences:', err);
    }
  }
}
