import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getRemainingCounts } from '@/lib/insights';

interface InsightCounts {
  insights: number;
  greaterStrategy: number;
  warmthSearches: number;
  cryptoPoints: number;
  anonymousJobClicks: number;
}

interface InsightsContextType {
  credits: InsightCounts | null;
  refreshInsights: () => Promise<void>;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export function InsightsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<InsightCounts | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth0();

  const refreshInsights = useCallback(async () => {
    if (!isAuthenticated || !user?.sub || isLoading) {
      setCredits(null);
      return;
    }

    try {
      const counts = await getRemainingCounts(user.sub);
      setCredits(counts);
    } catch (error) {
      console.error('Error refreshing insights:', error);
      setCredits(null);
    }
  }, [isAuthenticated, user?.sub, isLoading]);

  // Auto-refresh when authentication state changes
  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  return (
    <InsightsContext.Provider value={{ credits, refreshInsights }}>
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsights() {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
}