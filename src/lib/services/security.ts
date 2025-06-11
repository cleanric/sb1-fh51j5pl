import { z } from 'zod';

const rateDataSchema = z.object({
  attempts: z.number(),
  lastAttempt: z.number(),
  violations: z.number(),
  cooldownUntil: z.number().optional(),
  needsCaptcha: z.boolean()
});

type RateData = z.infer<typeof rateDataSchema>;

const STORAGE_KEY = 'earn-hire-security';
const MAX_ATTEMPTS = 5; // Maximum attempts within time window
const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_DURATION = 30 * 60 * 1000; // 30 minutes

class SecurityService {
  private static instance: SecurityService;
  private storage: Map<string, RateData>;

  private constructor() {
    this.storage = new Map();
    this.loadFromStorage();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.storage.set(key, value as RateData);
        });
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.storage.entries());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving security data:', error);
    }
  }

  private getRateData(identifier: string): RateData {
    const now = Date.now();
    let data = this.storage.get(identifier);

    if (!data || now - data.lastAttempt > TIME_WINDOW) {
      data = {
        attempts: 0,
        lastAttempt: now,
        violations: data?.violations || 0,
        needsCaptcha: data?.needsCaptcha || false
      };
    }

    return data;
  }

  public checkAttempt(identifier: string): {
    allowed: boolean;
    needsCaptcha: boolean;
    cooldownRemaining: number;
  } {
    const now = Date.now();
    const data = this.getRateData(identifier);

    // Check cooldown
    if (data.cooldownUntil && now < data.cooldownUntil) {
      return {
        allowed: false,
        needsCaptcha: data.needsCaptcha,
        cooldownRemaining: data.cooldownUntil - now
      };
    }

    // Increment attempts
    data.attempts++;
    data.lastAttempt = now;

    // Check for suspicious activity
    if (data.attempts > MAX_ATTEMPTS) {
      data.violations++;
      data.needsCaptcha = true;
      data.cooldownUntil = now + COOLDOWN_DURATION;
      data.attempts = 0;
    }

    this.storage.set(identifier, data);
    this.saveToStorage();

    return {
      allowed: data.attempts <= MAX_ATTEMPTS,
      needsCaptcha: data.needsCaptcha,
      cooldownRemaining: data.cooldownUntil ? Math.max(0, data.cooldownUntil - now) : 0
    };
  }

  public resetViolations(identifier: string): void {
    const data = this.getRateData(identifier);
    data.violations = 0;
    data.needsCaptcha = false;
    data.cooldownUntil = undefined;
    data.attempts = 0;
    this.storage.set(identifier, data);
    this.saveToStorage();
  }

  public clearAllData(): void {
    this.storage.clear();
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const securityService = SecurityService.getInstance();