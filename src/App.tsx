import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { InsightsProvider } from "./contexts/InsightsContext";
import { Web3Provider } from "./contexts/Web3Context";
import { AppwriteAuthProvider } from "./components/AppwriteAuthProvider";
import { useEffect } from "react";
import { initializeCollections } from "./lib/appwrite";
import EarnHireLandingPage from "./pages/EarnHireLandingPage";
import NewJobSearchPage from "./pages/NewJobSearchPage";
import RewardsPage from "./pages/RewardsPage";
import CompaniesComingSoonPage from "./pages/CompaniesComingSoonPage";
import ResourcesComingSoonPage from "./pages/ResourcesComingSoonPage";
import CommunityGuidelinesPage from "./pages/CommunityGuidelinesPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import { MigrationWrapper } from "./components/MigrationWrapper";
import { Toaster } from "sonner";

function App() {
  useEffect(() => {
    initializeCollections().catch(error => {
      console.error('Failed to initialize Appwrite collections:', error);
    });
  }, []);

  const onRedirectCallback = (appState: any) => {
    console.log('[Auth0] Redirect callback triggered:', appState);
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  // Get Auth0 configuration from environment variables
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  // Debug current URL and environment
  console.log('Current URL:', window.location.origin);
  console.log('Auth0 Domain:', auth0Domain);
  console.log('Auth0 Client ID:', auth0ClientId ? 'Set' : 'Missing');

  // Validate that required environment variables are present
  if (!auth0Domain || !auth0ClientId) {
    console.error('Missing Auth0 environment variables:', {
      hasDomain: !!auth0Domain,
      hasClientId: !!auth0ClientId
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600 mb-4">
            Missing Auth0 configuration. Please ensure the following environment variables are set:
          </p>
          <ul className="text-left text-sm text-gray-500 space-y-1">
            <li>• VITE_AUTH0_DOMAIN</li>
            <li>• VITE_AUTH0_CLIENT_ID</li>
          </ul>
        </div>
      </div>
    );
  }

  // Determine the correct redirect URI based on environment
  const getRedirectUri = () => {
    const currentOrigin = window.location.origin;
    console.log('Setting redirect URI to:', currentOrigin);
    return currentOrigin;
  };

  return (
    <Web3Provider>
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: getRedirectUri(),
          audience: `https://${auth0Domain}/api/v2/`,
          scope: "openid profile email offline_access"
        }}
        onRedirectCallback={onRedirectCallback}
        useRefreshTokens={true}
        cacheLocation="localstorage"
      >
        <AppwriteAuthProvider>
          <InsightsProvider>
            <MigrationWrapper>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<EarnHireLandingPage />} />
                  <Route path="/search" element={<NewJobSearchPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/companies" element={<CompaniesComingSoonPage />} />
                  <Route path="/resources" element={<ResourcesComingSoonPage />} />
                  <Route path="/guidelines" element={<CommunityGuidelinesPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                </Routes>
              </BrowserRouter>
            </MigrationWrapper>
          </InsightsProvider>
        </AppwriteAuthProvider>
        <Toaster position="top-center" richColors />
      </Auth0Provider>
    </Web3Provider>
  );
}

export default App;