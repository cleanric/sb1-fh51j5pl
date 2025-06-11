import { z } from 'zod';
import { 
  listDocuments, 
  createDocument, 
  updateDocument, 
  Query,
  Permission,
  Role,
  INSIGHTS_COLLECTION_ID,
  CRYPTO_REWARDS_COLLECTION_ID,
  InsightDocument,
  CryptoRewardDocument
} from './appwrite';

const DAILY_FREE_LIMIT = 3;
const DAILY_FREE_WARMTH_SEARCH_LIMIT = 3;
const WARMTH_CARDS_PER_FREE_SEARCH = 3;
const WARMTH_CARDS_PER_PAID_SEARCH = 6;
const POINTS_PER_REVIEW = 10;
const MIN_POINTS_FOR_CASHOUT = 100;
const BASE_REVIEW_TIME_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
const ANONYMOUS_CLICK_TIME_MS = 45 * 1000; // 45 seconds in milliseconds
const ALLOWED_REGIONS = ['US', 'CA'];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to get or create insight document
async function getInsightDocument(userId: string): Promise<{ document: InsightDocument; documentId: string }> {
  try {
    const existingDocs = await listDocuments(INSIGHTS_COLLECTION_ID, [
      Query.equal('userId', userId)
    ]);

    if (existingDocs.documents.length > 0) {
      const doc = existingDocs.documents[0];
      return {
        document: doc as InsightDocument,
        documentId: doc.$id
      };
    }

    // Create new document with default values and proper permissions
    const defaultData: Partial<InsightDocument> = {
      userId,
      count: 0,
      lastDate: getToday(),
      plan: null,
      remainingInsights: DAILY_FREE_LIMIT,
      remainingGreaterStrategy: 0,
      remainingWarmthSearches: DAILY_FREE_WARMTH_SEARCH_LIMIT,
      region: null
    };

    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId))
    ];

    const newDoc = await createDocument(INSIGHTS_COLLECTION_ID, defaultData, undefined, permissions);
    return {
      document: newDoc as InsightDocument,
      documentId: newDoc.$id
    };
  } catch (error) {
    console.error('Error getting insight document:', error);
    throw error;
  }
}

// Helper function to get or create crypto reward document
async function getRewardDocument(userId: string): Promise<{ document: CryptoRewardDocument; documentId: string }> {
  try {
    const existingDocs = await listDocuments(CRYPTO_REWARDS_COLLECTION_ID, [
      Query.equal('userId', userId)
    ]);

    if (existingDocs.documents.length > 0) {
      const doc = existingDocs.documents[0];
      return {
        document: doc as CryptoRewardDocument,
        documentId: doc.$id
      };
    }

    // Create new document with default values and proper permissions
    const defaultData: Partial<CryptoRewardDocument> = {
      userId,
      points: 0,
      lastReviewTimestamp: 0,
      reviewedJobIds: [],
      anonymousJobClicks: 0
    };

    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId))
    ];

    const newDoc = await createDocument(CRYPTO_REWARDS_COLLECTION_ID, defaultData, undefined, permissions);
    return {
      document: newDoc as CryptoRewardDocument,
      documentId: newDoc.$id
    };
  } catch (error) {
    console.error('Error getting reward document:', error);
    throw error;
  }
}

export async function checkAndResetDaily(userId: string): Promise<InsightDocument> {
  const { document: limits, documentId } = await getInsightDocument(userId);
  const today = getToday();
  
  if (limits.lastDate !== today) {
    const updatedData = {
      ...limits,
      count: 0,
      lastDate: today
    };

    if (!limits.plan) {
      updatedData.remainingInsights = DAILY_FREE_LIMIT;
      updatedData.remainingWarmthSearches = DAILY_FREE_WARMTH_SEARCH_LIMIT;
    }

    const updatedDoc = await updateDocument(INSIGHTS_COLLECTION_ID, documentId, updatedData);
    return updatedDoc as InsightDocument;
  }
  
  return limits;
}

export async function hasReachedLimit(userId: string): Promise<boolean> {
  const limits = await checkAndResetDaily(userId);
  
  if (!limits.plan) {
    return limits.count >= DAILY_FREE_LIMIT;
  }
  
  return limits.remainingInsights <= 0;
}

export async function incrementInsightUsage(userId: string): Promise<boolean> {
  const limits = await checkAndResetDaily(userId);
  
  if (await hasReachedLimit(userId)) {
    return false;
  }
  
  const { documentId } = await getInsightDocument(userId);
  const updatedData = { ...limits };
  
  if (!limits.plan) {
    updatedData.count += 1;
  } else {
    updatedData.remainingInsights -= 1;
  }
  
  await updateDocument(INSIGHTS_COLLECTION_ID, documentId, updatedData);
  return true;
}

export async function incrementGreaterStrategyUsage(userId: string): Promise<boolean> {
  const limits = await checkAndResetDaily(userId);
  
  if (limits.remainingGreaterStrategy <= 0) {
    return false;
  }
  
  const { documentId } = await getInsightDocument(userId);
  const updatedData = {
    ...limits,
    remainingGreaterStrategy: limits.remainingGreaterStrategy - 1
  };
  
  await updateDocument(INSIGHTS_COLLECTION_ID, documentId, updatedData);
  return true;
}

export async function hasWarmthSearchesRemaining(userId: string): Promise<boolean> {
  const limits = await checkAndResetDaily(userId);
  return limits.remainingWarmthSearches > 0;
}

export async function decrementWarmthSearchUsage(userId: string): Promise<boolean> {
  const limits = await checkAndResetDaily(userId);
  
  if (limits.remainingWarmthSearches <= 0) {
    return false;
  }
  
  const { documentId } = await getInsightDocument(userId);
  const updatedData = {
    ...limits,
    remainingWarmthSearches: limits.remainingWarmthSearches - 1
  };
  
  await updateDocument(INSIGHTS_COLLECTION_ID, documentId, updatedData);
  return true;
}

export async function getWarmthCardsPerSearch(userId: string): Promise<number> {
  const limits = await checkAndResetDaily(userId);
  return limits.plan ? WARMTH_CARDS_PER_PAID_SEARCH : WARMTH_CARDS_PER_FREE_SEARCH;
}

export async function getRemainingCounts(userId: string): Promise<{ 
  insights: number; 
  greaterStrategy: number; 
  warmthSearches: number; 
  cryptoPoints: number;
  anonymousJobClicks: number;
}> {
  const limits = await checkAndResetDaily(userId);
  const { document: cryptoState } = await getRewardDocument(userId);
  
  if (!limits.plan) {
    return {
      insights: DAILY_FREE_LIMIT - limits.count,
      greaterStrategy: 0,
      warmthSearches: limits.remainingWarmthSearches,
      cryptoPoints: cryptoState.points,
      anonymousJobClicks: cryptoState.anonymousJobClicks
    };
  }
  
  return {
    insights: limits.remainingInsights,
    greaterStrategy: limits.remainingGreaterStrategy,
    warmthSearches: limits.remainingWarmthSearches,
    cryptoPoints: cryptoState.points,
    anonymousJobClicks: cryptoState.anonymousJobClicks
  };
}

export async function setPlan(plan: 'starter' | 'pro', userId: string): Promise<void> {
  const { document: limits, documentId } = await getInsightDocument(userId);
  
  const updatedData = {
    ...limits,
    plan
  };

  if (plan === 'starter') {
    updatedData.remainingInsights = 120;
    updatedData.remainingGreaterStrategy = 10;
    updatedData.remainingWarmthSearches = 120;
  } else {
    updatedData.remainingInsights = 400;
    updatedData.remainingGreaterStrategy = 20;
    updatedData.remainingWarmthSearches = 400;
  }
  
  await updateDocument(INSIGHTS_COLLECTION_ID, documentId, updatedData);
}

export async function addCryptoPoints(jobId: string, userId: string, isAuthenticated: boolean = true): Promise<boolean> {
  const { document: limits } = await getInsightDocument(userId);
  const { document: cryptoState, documentId: cryptoDocId } = await getRewardDocument(userId);
  
  // Check region restriction
  if (limits.region && !ALLOWED_REGIONS.includes(limits.region)) {
    return false;
  }

  // Check if job has already been reviewed
  if (cryptoState.reviewedJobIds.includes(jobId)) {
    return false;
  }

  // Add points and update review data
  const updatedCryptoData = {
    ...cryptoState,
    points: cryptoState.points + POINTS_PER_REVIEW,
    reviewedJobIds: [...cryptoState.reviewedJobIds, jobId]
  };
  
  // Update timestamp if it's the first review
  if (cryptoState.lastReviewTimestamp === 0) {
    updatedCryptoData.lastReviewTimestamp = Date.now();
  }

  // Increment anonymous job clicks if not authenticated
  if (!isAuthenticated) {
    updatedCryptoData.anonymousJobClicks += 1;
  }

  await updateDocument(CRYPTO_REWARDS_COLLECTION_ID, cryptoDocId, updatedCryptoData);
  return true;
}

export async function getCryptoRewardStatus(userId: string): Promise<{
  points: number;
  timeRequirementMet: boolean;
  canCashOut: boolean;
  reviewedJobs: number;
  isAnonymous: boolean;
  anonymousJobClicks: number;
  regionRestricted: boolean;
}> {
  const { document: limits } = await getInsightDocument(userId);
  const { document: cryptoState } = await getRewardDocument(userId);
  
  const timeSpentReviewing = Date.now() - cryptoState.lastReviewTimestamp;
  const requiredTime = BASE_REVIEW_TIME_MS + (cryptoState.anonymousJobClicks * ANONYMOUS_CLICK_TIME_MS);
  const timeRequirementMet = timeSpentReviewing >= requiredTime;
  const regionRestricted = limits.region && !ALLOWED_REGIONS.includes(limits.region);
  
  return {
    points: cryptoState.points,
    timeRequirementMet,
    canCashOut: cryptoState.points >= MIN_POINTS_FOR_CASHOUT && timeRequirementMet && !regionRestricted,
    reviewedJobs: cryptoState.reviewedJobIds.length,
    isAnonymous: !limits.plan,
    anonymousJobClicks: cryptoState.anonymousJobClicks,
    regionRestricted: !!regionRestricted
  };
}

export async function resetCryptoPoints(userId: string): Promise<void> {
  const { documentId } = await getRewardDocument(userId);
  
  const emptyState: Partial<CryptoRewardDocument> = {
    points: 0,
    lastReviewTimestamp: 0,
    reviewedJobIds: [],
    anonymousJobClicks: 0
  };
  
  await updateDocument(CRYPTO_REWARDS_COLLECTION_ID, documentId, emptyState);
}

export async function setRegion(region: string, userId: string): Promise<void> {
  const { document: limits, documentId } = await getInsightDocument(userId);
  
  const updatedData = {
    ...limits,
    region
  };
  
  await updateDocument(INSIGHTS_COLLECTION_ID, documentId, updatedData);
}