import { z } from 'zod';

const locationResponseSchema = z.object({
  country_code: z.string().nullable(),
  country_name: z.string().nullable()
}).partial();

interface LocationData {
  countryCode: string | null;
  countryName: string | null;
  timestamp: number;
}

const CACHE_KEY = 'earn-hire-location';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_LOCATION = { countryCode: 'US', countryName: 'United States' };

class LocationService {
  private static async fetchFromApi(url: string): Promise<LocationData | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsed = locationResponseSchema.safeParse(data);

      if (!parsed.success) {
        return null;
      }

      return {
        countryCode: parsed.data.country_code || null,
        countryName: parsed.data.country_name || null,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Failed to fetch location from ${url}:`, error);
      return null;
    }
  }

  private static getCachedLocation(): LocationData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached) as LocationData;
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cached location:', error);
      return null;
    }
  }

  private static cacheLocation(data: LocationData): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  static async getLocation(): Promise<LocationData> {
    // First, check cache
    const cached = this.getCachedLocation();
    if (cached) {
      return cached;
    }

    // Try primary API
    const primaryData = await this.fetchFromApi('https://ipapi.co/json/');
    if (primaryData?.countryCode && primaryData.countryName) {
      this.cacheLocation(primaryData);
      return primaryData;
    }

    // Try fallback API
    const fallbackData = await this.fetchFromApi('https://api.ipapi.is/');
    if (fallbackData?.countryCode && fallbackData.countryName) {
      this.cacheLocation(fallbackData);
      return fallbackData;
    }

    // Use default location if all else fails
    const defaultData = {
      ...DEFAULT_LOCATION,
      timestamp: Date.now()
    };
    this.cacheLocation(defaultData);
    return defaultData;
  }

  static isNorthAmerica(countryCode: string | null): boolean {
    return countryCode === 'US' || countryCode === 'CA';
  }
}

export default LocationService;