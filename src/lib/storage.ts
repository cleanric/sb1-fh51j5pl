// Local storage keys
export const STORAGE_KEYS = {
  RESUME_TEXT: 'earn-hire-resume-text',
  SEARCH_ANALYSIS: 'earn-hire-search-analysis',
  INSIGHTS: 'earn-hire-insights',
  ANALYSIS_STATEMENT: 'earn-hire-analysis-statement',
  CRYPTO_REWARDS: 'earn-hire-crypto-rewards'
} as const;

// Resume text storage
export function getStoredResumeText(): string {
  return localStorage.getItem(STORAGE_KEYS.RESUME_TEXT) || '';
}

export function storeResumeText(text: string): void {
  localStorage.setItem(STORAGE_KEYS.RESUME_TEXT, text);
  if (!text) {
    clearAnalysisStatement();
  }
}

export function clearResumeText(): void {
  localStorage.removeItem(STORAGE_KEYS.RESUME_TEXT);
  clearAnalysisStatement();
}

// Analysis statement storage
export function getStoredAnalysisStatement(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ANALYSIS_STATEMENT);
}

export function storeAnalysisStatement(statement: string): void {
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_STATEMENT, statement);
}

export function clearAnalysisStatement(): void {
  localStorage.removeItem(STORAGE_KEYS.ANALYSIS_STATEMENT);
}

// Search analysis tracking
interface SearchAnalysis {
  lastDate: string;
  count: number;
}

export function getSearchAnalysis(): SearchAnalysis {
  const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_ANALYSIS);
  if (!stored) {
    return {
      lastDate: new Date().toISOString().split('T')[0],
      count: 0
    };
  }
  return JSON.parse(stored);
}

export function updateSearchAnalysis(): void {
  const today = new Date().toISOString().split('T')[0];
  const analysis = getSearchAnalysis();
  
  if (analysis.lastDate !== today) {
    analysis.lastDate = today;
    analysis.count = 1;
  } else {
    analysis.count += 1;
  }
  
  localStorage.setItem(STORAGE_KEYS.SEARCH_ANALYSIS, JSON.stringify(analysis));
}

export function hasUsedFreeSearchAnalysisToday(): boolean {
  const analysis = getSearchAnalysis();
  const today = new Date().toISOString().split('T')[0];
  
  if (analysis.lastDate !== today) {
    return false;
  }
  
  return analysis.count > 0;
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  sessionStorage.removeItem(STORAGE_KEYS.CRYPTO_REWARDS);
}