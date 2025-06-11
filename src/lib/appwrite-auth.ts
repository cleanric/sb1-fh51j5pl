import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { account } from './appwrite';

interface AppwriteAuthState {
  isAppwriteAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Utility to determine base URL for Netlify functions
const getFunctionBaseURL = () => {
  const { hostname, origin } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development with Netlify CLI
    return 'http://localhost:8888';
  }

  if (hostname === 'earnhire.com' || hostname === 'www.earnhire.com') {
    // Production domain
    return 'https://earnhire.com';
  }

  if (hostname.includes('netlify.app')) {
    // Netlify Preview or staging
    return origin;
  }

  // Default fallback
  return origin;
};

// Function to establish Appwrite session using Auth0 token
export async function establishAppwriteSession(auth0Token: string, userId: string): Promise<boolean> {
  try {
    const baseURL = getFunctionBaseURL();
    console.log('Using function base URL:', baseURL);
    
    const response = await fetch(`${baseURL}/.netlify/functions/appwrite-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth0Token,
        userId
      })
    });

    if (!response.ok) {
      console.error('Failed to establish Appwrite session - HTTP status:', response.status);
      
      // Handle different error cases
      if (response.status === 404) {
        console.error('Appwrite auth function not found. Ensure Netlify functions are properly deployed.');
        return false;
      }
      
      let errorData;
      try {
        const responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        } else {
          errorData = { error: 'Empty response from server' };
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorData = { error: 'Invalid response from server' };
      }
      
      console.error('Appwrite auth error:', errorData);
      return false;
    }

    let result;
    try {
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!responseText) {
        console.error('Empty response from Appwrite auth function');
        return false;
      }
      
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse successful response:', parseError);
      return false;
    }
    
    if (!result.token) {
      console.error('No JWT token received from server');
      return false;
    }

    // Check if account is available
    if (!account) {
      console.error('Appwrite account service not initialized');
      return false;
    }

    try {
      // Use the correct method to create session with JWT
      await account.createSession('jwt', result.token);
      console.log('Appwrite session created using JWT');
      return true;
    } catch (sessionError) {
      console.error('Failed to create Appwrite session with JWT:', sessionError);
      return false;
    }

  } catch (error) {
    console.error('Error establishing Appwrite session:', error);
    return false;
  }
}

// Hook to automatically manage Appwrite authentication
export function useAppwriteAuth(): AppwriteAuthState {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading: auth0Loading } = useAuth0();
  const [isAppwriteAuthenticated, setIsAppwriteAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupAppwriteAuth() {
      if (!isAuthenticated || !user?.sub || auth0Loading) {
        setIsAppwriteAuthenticated(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get Auth0 access token
        const token = await getAccessTokenSilently();
        
        // Establish Appwrite session
        const success = await establishAppwriteSession(token, user.sub);
        
        if (success) {
          setIsAppwriteAuthenticated(true);
          console.log('Appwrite authentication successful for user:', user.sub);
        } else {
          setError('Failed to authenticate with Appwrite');
          setIsAppwriteAuthenticated(false);
        }
      } catch (error) {
        console.error('Error setting up Appwrite auth:', error);
        setError('Authentication error');
        setIsAppwriteAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    setupAppwriteAuth();
  }, [isAuthenticated, user?.sub, auth0Loading, getAccessTokenSilently]);

  return {
    isAppwriteAuthenticated,
    isLoading,
    error
  };
}