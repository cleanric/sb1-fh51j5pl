import { z } from 'zod';

const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  description: z.string(),
  url: z.string(),
  salary: z.string().optional(),
  currency: z.enum(['USD', 'MATIC']),
  fitLevel: z.enum(['high', 'warm', 'stretch', 'see-insights']),
  fitPercentage: z.number(),
  hoursToApply: z.number(),
  hasCryptoRewards: z.boolean(),
  rewardAmount: z.string(),
  rewardCurrency: z.enum(['MATIC']),
  insights: z.object({
    fitAnalysis: z.string(),
    resumeTip: z.string(),
    linkedinStrategy: z.string(),
    coverLetterHook: z.string()
  }).optional()
});

export type Job = z.infer<typeof jobSchema>;

interface CacheEntry {
  jobs: Job[];
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const jobCache = new Map<string, Job>();
const recommendedJobsCache: CacheEntry = {
  jobs: [],
  timestamp: 0
};

const J2C_CITIES = [
  { city: 'Washington', state: 'DC' },
  { city: 'New York', state: 'NY' },
  { city: 'Atlanta', state: 'GA' }
];

const safeTrim = (value: any): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
};

const sanitizeJobData = async (job: any, source: string): Promise<Job> => {
  if (source === 'jooble') {
    return {
      id: `${source}-${safeTrim(job.id) || Math.random().toString(36).slice(2)}`,
      title: safeTrim(job.title) || 'Unknown Position',
      company: safeTrim(job.company) || 'Unknown Company',
      location: safeTrim(job.location) || 'Remote',
      description: safeTrim(job.snippet) || '',
      url: job.link || '#',
      salary: job.salary ? safeTrim(job.salary) : undefined,
      currency: 'USD',
      fitLevel: 'see-insights',
      fitPercentage: 0,
      hoursToApply: 24,
      hasCryptoRewards: false,
      rewardAmount: '0',
      rewardCurrency: 'MATIC'
    };
  }

  if (source === 'jobs2careers') {
    const location = Array.isArray(job.city) ? job.city[0] : (job.city || job.location || 'Remote');
    const jobId = job.jobkey || job.id || Math.random().toString(36).slice(2);
    
    return {
      id: `${source}-${jobId}`,
      title: safeTrim(job.jobtitle || job.title) || 'Unknown Position',
      company: safeTrim(job.company || job.employer) || 'Unknown Company',
      location: safeTrim(location),
      description: safeTrim(job.description || job.snippet) || '',
      url: `https://www.jobs2careers.com/click.php?id=${jobId}&job_loc=${encodeURIComponent(location)}&source=earnhire`,
      salary: job.salary ? safeTrim(job.salary) : undefined,
      currency: 'USD',
      fitLevel: 'see-insights',
      fitPercentage: 0,
      hoursToApply: 30,
      hasCryptoRewards: true,
      rewardAmount: '0.25',
      rewardCurrency: 'MATIC'
    };
  }

  return {
    id: `unknown-${Math.random().toString(36).slice(2)}`,
    title: safeTrim(job.title) || 'Unknown Position',
    company: safeTrim(job.company) || 'Unknown Company',
    location: safeTrim(job.location) || 'Remote',
    description: safeTrim(job.description) || '',
    url: '#',
    salary: undefined,
    currency: 'USD',
    fitLevel: 'see-insights',
    fitPercentage: 0,
    hoursToApply: 48,
    hasCryptoRewards: false,
    rewardAmount: '0',
    rewardCurrency: 'MATIC'
  };
};

export async function searchJoobleJobs(query: string, location: string): Promise<Job[]> {
  if (!query && !location) return [];
  
  try {
    const response = await fetch('https://jooble.org/api/67bd556a-dc25-432b-b425-30b88fffde91', {
      method: 'POST',
      body: JSON.stringify({
        keywords: query,
        location: location
      })
    });

    if (!response.ok) {
      throw new Error(`Jooble API error: ${response.status}`);
    }

    const data = await response.json();
    const jobs = await Promise.all((data.jobs || []).map((job: any) => sanitizeJobData(job, 'jooble')));
    jobs.forEach(job => jobCache.set(job.id, job));
    return jobs;
  } catch (error) {
    console.error('Jooble search failed:', error);
    return [];
  }
}

async function searchJ2CForCity(query: string, city: string, state: string): Promise<Job[]> {
  try {
    const params = new URLSearchParams({
      id: '7564',
      pass: '8DpRpdybyI5TcmEL',
      ip: '127.0.0.1',
      q: query,
      l: `${city}, ${state}`,
      format: 'json',
      direct: '1'
    });

    const response = await fetch(`https://api.jobs2careers.com/api/search.php?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Jobs2Careers API error for ${city}: ${response.status}`);
    }

    const data = await response.json();
    const jobs = await Promise.all((data.results || data.jobs || []).slice(0, 1).map((job: any) => sanitizeJobData(job, 'jobs2careers')));
    jobs.forEach(job => jobCache.set(job.id, job));
    return jobs;
  } catch (error) {
    console.error(`Jobs2Careers search failed for ${city}:`, error);
    return [];
  }
}

export async function searchJobs2Careers(query: string, location: string): Promise<Job[]> {
  if (!query && !location) return [];

  try {
    const allJobs: Job[] = [];
    const citySearches = J2C_CITIES.map(({ city, state }) => 
      searchJ2CForCity(query, city, state)
    );
    
    const results = await Promise.all(citySearches);
    results.forEach(cityJobs => {
      allJobs.push(...cityJobs);
    });

    return allJobs;
  } catch (error) {
    console.error('Jobs2Careers search failed:', error);
    return [];
  }
}

export function interleaveJobs(jobs1: Job[], jobs2: Job[]): Job[] {
  const result: Job[] = [];
  const maxLength = Math.max(jobs1.length, jobs2.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (i < jobs1.length) result.push(jobs1[i]);
    if (i < jobs2.length) result.push(jobs2[i]);
  }
  
  return result;
}

export async function getRecommendedJobs(): Promise<Job[]> {
  const now = Date.now();
  if (recommendedJobsCache.jobs.length > 0 && 
      now - recommendedJobsCache.timestamp < CACHE_DURATION) {
    return recommendedJobsCache.jobs;
  }

  try {
    const [joobleJobs, j2cJobs] = await Promise.all([
      searchJoobleJobs("senior OR executive OR director", "United States"),
      searchJobs2Careers("senior OR executive OR director", "")
    ]);

    const combinedJobs = [...j2cJobs.slice(0, 3), ...joobleJobs.slice(0, 3)].map(job => ({
      ...job,
      fitLevel: 'see-insights' as const,
      fitPercentage: 0
    }));

    recommendedJobsCache.jobs = combinedJobs;
    recommendedJobsCache.timestamp = now;

    return combinedJobs;
  } catch (error) {
    console.error('Failed to fetch recommended jobs:', error);
    return recommendedJobsCache.jobs;
  }
}

export function getCachedJob(id: string): Job | undefined {
  return jobCache.get(id);
}