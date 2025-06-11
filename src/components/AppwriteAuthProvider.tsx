import { createContext, useContext, ReactNode } from 'react';
import { useAppwriteAuth } from '@/lib/appwrite-auth';

interface AppwriteAuthContextType {
  isAppwriteAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AppwriteAuthContext = createContext<AppwriteAuthContextType | undefined>(undefined);

interface AppwriteAuthProviderProps {
  children: ReactNode;
}

export function AppwriteAuthProvider({ children }: AppwriteAuthProviderProps) {
  const appwriteAuth = useAppwriteAuth();

  return (
    <AppwriteAuthContext.Provider value={appwriteAuth}>
      {children}
    </AppwriteAuthContext.Provider>
  );
}

export function useAppwriteAuthContext() {
  const context = useContext(AppwriteAuthContext);
  if (context === undefined) {
    throw new Error('useAppwriteAuthContext must be used within an AppwriteAuthProvider');
  }
  return context;
}