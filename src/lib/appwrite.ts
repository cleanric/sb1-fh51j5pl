import { Client, Account, Databases, Query, Permission, Role } from 'appwrite';

// Initialize variables with let so they can be reassigned
let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

// Attempt to configure the client with environment variables
try {
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  
  console.log('Environment variables check:', {
    hasEndpoint: !!endpoint,
    hasProjectId: !!projectId,
    endpoint: endpoint || 'MISSING',
    projectId: projectId ? projectId.slice(0, 8) + '...' : 'MISSING'
  });

  if (!endpoint || !projectId) {
    throw new Error('Missing required environment variables: VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID');
  }

  // Initialize the client first
  client = new Client();
  client
    .setEndpoint(endpoint)
    .setProject(projectId);

  console.log('Appwrite client initialized successfully');

  // Only initialize services after client is properly configured
  account = new Account(client);
  databases = new Databases(client);

  console.log('Appwrite services initialized:', {
    hasAccount: !!account,
    hasDatabases: !!databases,
    databasesType: typeof databases
  });
} catch (error) {
  console.error('Failed to configure Appwrite client:', error);
  client = null;
  account = null;
  databases = null;
}

// Database and collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

console.log('Database configuration:', {
  hasDatabaseId: !!DATABASE_ID,
  databaseId: DATABASE_ID || 'MISSING'
});

export const INSIGHTS_COLLECTION_ID = 'insights';
export const CRYPTO_REWARDS_COLLECTION_ID = 'crypto_rewards';

// Helper function to generate a unique document ID with fallback
export function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch (error) {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export interface InsightDocument {
  userId: string;
  count: number;
  lastDate: string;
  plan: 'free' | 'starter' | 'pro' | null;
  remainingInsights: number;
  remainingGreaterStrategy: number;
  remainingWarmthSearches: number;
  region: string | null;
  resumeText?: string;
  analysisStatement?: string;
  searchLastDate?: string;
  searchCount?: number;
}

export interface CryptoRewardDocument {
  userId: string;
  points: number;
  lastReviewTimestamp: number;
  reviewedJobIds: string[];
  anonymousJobClicks: number;
}

// Test the Appwrite connection
async function testConnection(): Promise<boolean> {
  try {
    if (!client) {
      throw new Error('Appwrite client not initialized');
    }

    console.log('Testing Appwrite connection...');
    // Use a simple health check that works with client SDK
    const response = await client.call('get', '/health');
    console.log('Appwrite connection test successful:', response);
    return true;
  } catch (error) {
    console.error('Failed to connect to Appwrite:', error);
    return false;
  }
}

// Check if collections exist (read-only operation)
async function checkCollections(): Promise<boolean> {
  try {
    if (!databases || !DATABASE_ID) {
      console.error('Databases service or DATABASE_ID not available');
      return false;
    }

    console.log('Checking if collections exist...');
    
    try {
      // Try to list documents from each collection to verify they exist
      await databases.listDocuments(DATABASE_ID, INSIGHTS_COLLECTION_ID, []);
      console.log('Insights collection exists and is accessible');
    } catch (error: any) {
      if (error.code === 404) {
        console.error('Insights collection does not exist. Please create it in the Appwrite console.');
        return false;
      }
      console.log('Insights collection exists (access restricted, which is expected)');
    }

    try {
      await databases.listDocuments(DATABASE_ID, CRYPTO_REWARDS_COLLECTION_ID, []);
      console.log('Crypto rewards collection exists and is accessible');
    } catch (error: any) {
      if (error.code === 404) {
        console.error('Crypto rewards collection does not exist. Please create it in the Appwrite console.');
        return false;
      }
      console.log('Crypto rewards collection exists (access restricted, which is expected)');
    }

    return true;
  } catch (error) {
    console.error('Error checking collections:', error);
    return false;
  }
}

// Initialize and verify Appwrite setup
export async function initializeCollections(): Promise<boolean> {
  try {
    console.log('Starting Appwrite initialization...');
    console.log('Initial state:', {
      hasClient: !!client,
      hasAccount: !!account,
      hasDatabases: !!databases,
      databaseId: DATABASE_ID
    });
    
    // Check environment variables
    if (!DATABASE_ID) {
      console.error('Missing DATABASE_ID environment variable');
      console.log('Please set VITE_APPWRITE_DATABASE_ID in your .env file');
      return false;
    }

    if (!databases) {
      console.error('Databases service not initialized - check your environment variables');
      console.log('Please ensure VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID are set correctly');
      return false;
    }

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to Appwrite');
      return false;
    }

    // Check if collections exist
    const collectionsExist = await checkCollections();
    if (!collectionsExist) {
      console.error('Collections do not exist. Please create them in the Appwrite console.');
      console.log('Required collections:');
      console.log('1. insights - for storing user insight usage data');
      console.log('2. crypto_rewards - for storing crypto reward data');
      return false;
    }

    console.log('Appwrite initialization successful');
    return true;
  } catch (error) {
    console.error('Error initializing Appwrite:', error);
    return false;
  }
}

// Helper functions for working with documents
export async function createDocument(collectionId: string, data: any, documentId?: string, permissions?: string[]) {
  if (!databases || !DATABASE_ID) {
    throw new Error('Databases service not initialized');
  }
  
  // If no permissions provided and data has userId, set default user permissions
  if (!permissions && data.userId) {
    permissions = [
      Permission.read(Role.user(data.userId)),
      Permission.write(Role.user(data.userId))
    ];
  }
  
  return await databases.createDocument(
    DATABASE_ID,
    collectionId,
    documentId || generateId(),
    data,
    permissions
  );
}

export async function getDocument(collectionId: string, documentId: string) {
  if (!databases || !DATABASE_ID) {
    throw new Error('Databases service not initialized');
  }
  
  return await databases.getDocument(DATABASE_ID, collectionId, documentId);
}

export async function updateDocument(collectionId: string, documentId: string, data: any, permissions?: string[]) {
  if (!databases || !DATABASE_ID) {
    throw new Error('Databases service not initialized');
  }
  
  return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data, permissions);
}

export async function deleteDocument(collectionId: string, documentId: string) {
  if (!databases || !DATABASE_ID) {
    throw new Error('Databases service not initialized');
  }
  
  return await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
}

export async function listDocuments(collectionId: string, queries: string[] = []) {
  if (!databases || !DATABASE_ID) {
    throw new Error('Databases service not initialized');
  }
  
  return await databases.listDocuments(DATABASE_ID, collectionId, queries);
}

// Export Query, Permission, and Role for use in other files
export { Query, Permission, Role };

// Export initialized services
export { client, account, databases };