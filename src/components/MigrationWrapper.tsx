import { useEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useMigration } from '@/lib/migrateData';

interface MigrationWrapperProps {
  children: ReactNode;
}

export function MigrationWrapper({ children }: MigrationWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const { triggerMigration } = useMigration();

  useEffect(() => {
    // Only trigger migration when user is authenticated and not loading
    if (isAuthenticated && !isLoading && user?.sub) {
      console.log('User authenticated, triggering data migration...');
      triggerMigration();
    }
  }, [isAuthenticated, isLoading, user?.sub, triggerMigration]);

  return <>{children}</>;
}