import { useAuth0 } from '@auth0/auth0-react';
import { 
  createDocument, 
  updateDocument, 
  listDocuments, 
  INSIGHTS_COLLECTION_ID, 
  CRYPTO_REWARDS_COLLECTION_ID,
  InsightDocument,
  CryptoRewardDocument,
  Permission,
  Role
} from './appwrite';
import { STORAGE_KEYS } from './storage';
import { Query } from 'appwrite';

interface LocalInsightData {
  count: number;
  lastDate: string;
  plan: 'free' | 'starter' | 'pro' | null;
  remainingInsights: number;
  remainingGreaterStrategy: number;
  remainingWarmthSearches: number;
  region: string | null;
}

interface LocalCryptoRewardData {
  points: number;
  lastReviewTimestamp: number;
  reviewedJobIds: string[];
  anonymousJobClicks: number;
}

interface LocalSearchAnalysis {
  lastDate: string;
  count: number;
}

const MIGRATION_FLAG_KEY = 'earn-hire-migration-completed';

// Check if migration has already been completed for this user
function hasMigrationCompleted(userId: string): boolean {
  const migrationFlag = localStorage.getItem(MIGRATION_FLAG_KEY);
  return migrationFlag === userId;
}

// Mark migration as completed for this user
function markMigrationCompleted(userId: string): void {
  localStorage.setItem(MIGRATION_FLAG_KEY, userId);
}

// Get local insight data from localStorage
function getLocalInsightData(): LocalInsightData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading local insight data:', error);
    return null;
  }
}

// Get local crypto reward data from sessionStorage
function getLocalCryptoRewardData(): LocalCryptoRewardData | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.CRYPTO_REWARDS);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading local crypto reward data:', error);
    return null;
  }
}

// Get local search analysis data
function getLocalSearchAnalysis(): LocalSearchAnalysis | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_ANALYSIS);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading local search analysis data:', error);
    return null;
  }
}

// Get resume text from localStorage
function getLocalResumeText(): string | null {
  return localStorage.getItem(STORAGE_KEYS.RESUME_TEXT) || null;
}

// Get analysis statement from localStorage
function getLocalAnalysisStatement(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ANALYSIS_STATEMENT) || null;
}

// Migrate insights data to Appwrite
async function migrateInsightsData(userId: string): Promise<boolean> {
  try {
    console.log('Migrating insights data for user:', userId);

    // Check if user already has insights document in Appwrite
    const existingDocs = await listDocuments(INSIGHTS_COLLECTION_ID, [
      Query.equal('userId', userId)
    ]);

    const localInsightData = getLocalInsightData();
    const localSearchAnalysis = getLocalSearchAnalysis();
    const resumeText = getLocalResumeText();
    const analysisStatement = getLocalAnalysisStatement();

    // Prepare the document data
    const documentData: Partial<InsightDocument> & {
      resumeText?: string;
      analysisStatement?: string;
      searchLastDate?: string;
      searchCount?: number;
    } = {
      userId,
      count: localInsightData?.count || 0,
      lastDate: localInsightData?.lastDate || new Date().toISOString().split('T')[0],
      plan: localInsightData?.plan || null,
      remainingInsights: localInsightData?.remainingInsights || 3,
      remainingGreaterStrategy: localInsightData?.remainingGreaterStrategy || 0,
      remainingWarmthSearches: localInsightData?.remainingWarmthSearches || 3,
      region: localInsightData?.region || null,
      resumeText: resumeText || '',
      analysisStatement: analysisStatement || '',
      searchLastDate: localSearchAnalysis?.lastDate || new Date().toISOString().split('T')[0],
      searchCount: localSearchAnalysis?.count || 0
    };

    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId))
    ];

    if (existingDocs.documents.length > 0) {
      // Update existing document
      const existingDoc = existingDocs.documents[0];
      await updateDocument(INSIGHTS_COLLECTION_ID, existingDoc.$id, documentData);
      console.log('Updated existing insights document');
    } else {
      // Create new document
      await createDocument(INSIGHTS_COLLECTION_ID, documentData, undefined, permissions);
      console.log('Created new insights document');
    }

    return true;
  } catch (error) {
    console.error('Error migrating insights data:', error);
    return false;
  }
}

// Migrate crypto rewards data to Appwrite
async function migrateCryptoRewardsData(userId: string): Promise<boolean> {
  try {
    console.log('Migrating crypto rewards data for user:', userId);

    // Check if user already has crypto rewards document in Appwrite
    const existingDocs = await listDocuments(CRYPTO_REWARDS_COLLECTION_ID, [
      Query.equal('userId', userId)
    ]);

    const localCryptoData = getLocalCryptoRewardData();

    // Only migrate if there's local data
    if (!localCryptoData) {
      console.log('No local crypto rewards data to migrate');
      return true;
    }

    const documentData: Partial<CryptoRewardDocument> = {
      userId,
      points: localCryptoData.points || 0,
      lastReviewTimestamp: localCryptoData.lastReviewTimestamp || 0,
      reviewedJobIds: localCryptoData.reviewedJobIds || [],
      anonymousJobClicks: localCryptoData.anonymousJobClicks || 0
    };

    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId))
    ];

    if (existingDocs.documents.length > 0) {
      // Update existing document
      const existingDoc = existingDocs.documents[0];
      await updateDocument(CRYPTO_REWARDS_COLLECTION_ID, existingDoc.$id, documentData);
      console.log('Updated existing crypto rewards document');
    } else {
      // Create new document
      await createDocument(CRYPTO_REWARDS_COLLECTION_ID, documentData, undefined, permissions);
      console.log('Created new crypto rewards document');
    }

    return true;
  } catch (error) {
    console.error('Error migrating crypto rewards data:', error);
    return false;
  }
}

// Clear local storage after successful migration
function clearLocalDataAfterMigration(): void {
  try {
    // Clear all local storage data that was migrated
    localStorage.removeItem(STORAGE_KEYS.INSIGHTS);
    localStorage.removeItem(STORAGE_KEYS.RESUME_TEXT);
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS_STATEMENT);
    localStorage.removeItem(STORAGE_KEYS.SEARCH_ANALYSIS);
    
    // Clear session storage crypto rewards data
    sessionStorage.removeItem(STORAGE_KEYS.CRYPTO_REWARDS);
    
    console.log('Local data cleared after successful migration');
  } catch (error) {
    console.error('Error clearing local data after migration:', error);
  }
}

// Main migration function
export async function migrateLocalDataToAppwrite(userId: string): Promise<boolean> {
  try {
    console.log('Starting data migration for user:', userId);

    // Check if migration has already been completed
    if (hasMigrationCompleted(userId)) {
      console.log('Migration already completed for this user');
      return true;
    }

    // Check if there's any local data to migrate
    const hasLocalInsightData = !!getLocalInsightData();
    const hasLocalCryptoData = !!getLocalCryptoRewardData();
    const hasLocalResumeText = !!getLocalResumeText();
    const hasLocalAnalysisStatement = !!getLocalAnalysisStatement();
    const hasLocalSearchAnalysis = !!getLocalSearchAnalysis();

    if (!hasLocalInsightData && !hasLocalCryptoData && !hasLocalResumeText && 
        !hasLocalAnalysisStatement && !hasLocalSearchAnalysis) {
      console.log('No local data found to migrate');
      markMigrationCompleted(userId);
      return true;
    }

    console.log('Local data found:', {
      hasInsightData: hasLocalInsightData,
      hasCryptoData: hasLocalCryptoData,
      hasResumeText: hasLocalResumeText,
      hasAnalysisStatement: hasLocalAnalysisStatement,
      hasSearchAnalysis: hasLocalSearchAnalysis
    });

    // Migrate insights data (includes resume text, analysis statement, and search analysis)
    const insightsSuccess = await migrateInsightsData(userId);
    if (!insightsSuccess) {
      console.error('Failed to migrate insights data');
      return false;
    }

    // Migrate crypto rewards data
    const cryptoSuccess = await migrateCryptoRewardsData(userId);
    if (!cryptoSuccess) {
      console.error('Failed to migrate crypto rewards data');
      return false;
    }

    // Mark migration as completed
    markMigrationCompleted(userId);
    
    // Clear local data after successful migration
    clearLocalDataAfterMigration();

    console.log('Data migration completed successfully');
    return true;
  } catch (error) {
    console.error('Error during data migration:', error);
    return false;
  }
}

// Hook to automatically trigger migration when user authenticates
export function useMigration() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const triggerMigration = async () => {
    if (!isAuthenticated || !user?.sub || isLoading) {
      return;
    }

    try {
      await migrateLocalDataToAppwrite(user.sub);
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  return { triggerMigration };
}