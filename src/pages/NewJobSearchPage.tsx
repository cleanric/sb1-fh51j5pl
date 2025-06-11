import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { SearchBar } from "@/components/search-bar";
import { JobCard } from "@/components/job-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { analyzeJobs, generateAnalysisStatement } from "@/lib/openai";
import { Job, searchJoobleJobs, searchJobs2Careers, interleaveJobs } from "@/lib/jobs";
import { ErrorBoundary } from "react-error-boundary";
import { AlertCircle, Search, Loader2 } from "lucide-react";
import { hasWarmthSearchesRemaining, decrementWarmthSearchUsage, getWarmthCardsPerSearch } from "@/lib/insights";
import { getStoredAnalysisStatement, storeAnalysisStatement } from "@/lib/storage";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";

interface LocationState {
  query?: string;
  location?: string;
  resumeText?: string;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center p-6 bg-red-50 rounded-lg mx-4">
      <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
        <AlertCircle className="w-6 h-6" />
        <h2 className="text-lg font-semibold">Error Loading Jobs</h2>
      </div>
      <p className="text-gray-600 mb-4 text-sm sm:text-base">We encountered an error while fetching job listings.</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors touch-manipulation"
      >
        Try Again
      </button>
    </div>
  );
}

export default function NewJobSearchPage() {
  const location = useLocation();
  const state = location.state as LocationState;
  const { user, isAuthenticated } = useAuth0();
  
  const [query, setQuery] = useState(state?.query || "");
  const [jobLocation, setJobLocation] = useState(state?.location || "");
  const [resumeText, setResumeText] = useState(state?.resumeText || "");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const [analysisStatement, setAnalysisStatement] = useState<string | null>(null);
  
  const observer = useRef<IntersectionObserver>();
  const lastJobElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Handle success toast notification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseSuccess = urlParams.get('purchase_success');
    const plan = urlParams.get('plan');
    const billing = urlParams.get('billing');
    const error = urlParams.get('error');

    if (purchaseSuccess === 'true' && plan) {
      // Show success toast
      const planName = plan === 'starter' ? 'Starter' : 
                     plan === 'pro' ? 'Pro' : 
                     plan === 'insight-boost' ? 'Insight Boost' :
                     plan === 'strategy-boost' ? 'Strategy Boost' : 'Premium';
      
      const billingText = billing === 'annual' ? ' (Annual)' : 
                         billing === 'monthly' ? ' (Monthly)' : '';
      
      toast.success(`🎉 Purchase Successful!`, {
        description: `Your ${planName}${billingText} plan has been activated. Your credits have been updated!`,
        duration: 6000,
      });

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    if (error) {
      // Show error toast
      let errorMessage = 'An error occurred during purchase.';
      
      if (error === 'missing_parameters') {
        errorMessage = 'Missing purchase information. Please try again.';
      } else if (error === 'processing_failed') {
        errorMessage = 'Failed to process your purchase. Please contact support.';
      }
      
      toast.error('Purchase Error', {
        description: errorMessage,
        duration: 8000,
      });

      // Clean up error parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    const storedStatement = getStoredAnalysisStatement();
    if (storedStatement) {
      setAnalysisStatement(storedStatement);
    }
  }, []);

  const handleJobUpdate = (updatedJob: Job) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    );
  };

  const fetchJobs = async (pageNum: number) => {
    try {
      setError(null);
      setInsightError(null);

      // ALWAYS fetch jobs first - this should never be blocked
      const [joobleJobs, j2cJobs] = await Promise.all([
        searchJoobleJobs(query, jobLocation),
        searchJobs2Careers(query, jobLocation)
      ]);

      let currentBatchJobs = interleaveJobs(joobleJobs, j2cJobs);
      
      if (currentBatchJobs.length === 0) {
        setHasMore(false);
        if (pageNum === 1) {
          setError("No jobs found matching your criteria.");
        }
        return;
      }

      // Set all jobs to default state first (no insights)
      currentBatchJobs = currentBatchJobs.map(job => ({
        ...job,
        fitLevel: 'see-insights',
        fitPercentage: 0
      }));

      // Now try to generate insights separately - if this fails, jobs still show
      if (resumeText && isInitialSearch && pageNum === 1 && isAuthenticated && user?.sub) {
        setAnalyzing(true);
        try {
          // Check if user has remaining searches and generate insights
          const hasSearches = await hasWarmthSearchesRemaining(user.sub);
          
          if (hasSearches) {
            const warmthCardsLimit = await getWarmthCardsPerSearch(user.sub);
            const jobsToAnalyze = currentBatchJobs.slice(0, warmthCardsLimit);
            
            const [jobAnalyses, statement] = await Promise.all([
              analyzeJobs(resumeText, jobsToAnalyze),
              generateAnalysisStatement(resumeText, jobsToAnalyze)
            ]);
            
            // Update jobs with insights
            currentBatchJobs = currentBatchJobs.map((job, index) => {
              if (index < warmthCardsLimit && jobAnalyses[index]) {
                return {
                  ...job,
                  fitLevel: jobAnalyses[index].fitLevel,
                  fitPercentage: jobAnalyses[index].fitPercentage,
                  insights: jobAnalyses[index].insights
                };
              }
              return job; // Keep default state for jobs without insights
            });

            await decrementWarmthSearchUsage(user.sub);
            
            storeAnalysisStatement(statement);
            setAnalysisStatement(statement);
          }
        } catch (insightErr) {
          // Log insight error but don't block job display
          console.error('Error generating insights (jobs will still display):', insightErr);
          setInsightError('Unable to generate job insights. Jobs are still available to view.');
          // Jobs remain in their default state without insights
        } finally {
          setAnalyzing(false);
        }
      }

      // Always set the jobs regardless of insight generation success/failure
      setJobs(prevJobs => pageNum === 1 ? currentBatchJobs : [...prevJobs, ...currentBatchJobs]);
      
    } catch (error) {
      // This should only catch job fetching errors, not insight errors
      console.error('Error fetching jobs:', error);
      setError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
      if (isInitialSearch) {
        setIsInitialSearch(false);
      }
    }
  };

  const handleSearch = async (newResumeText?: string) => {
    setLoading(true);
    
    if (newResumeText !== undefined) {
      setResumeText(newResumeText);
      if (!newResumeText) {
        setAnalysisStatement(null);
      }
    }
    setPage(1);
    setHasMore(true);
    setJobs([]);
    setHasSearched(true);
    setIsInitialSearch(true);
    await fetchJobs(1);
  };

  useEffect(() => {
    if (state?.query || state?.location) {
      handleSearch(state?.resumeText);
    }
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchJobs(page);
    }
  }, [page]);

  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <div className="sticky top-0 z-40 bg-[#F8F8F8]/90 backdrop-blur-sm py-3 sm:py-4 px-4 sm:px-6">
          <div className="max-w-[2000px] mx-auto">
            <SearchBar 
              query={query}
              setQuery={setQuery}
              location={jobLocation}
              setLocation={setJobLocation}
              onSearch={handleSearch}
              initialResumeApplied={Boolean(state?.resumeText)}
              analysisStatement={analysisStatement}
            />
          </div>
        </div>
        
        <main className="w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-[2000px] mx-auto">
            {analyzing && (
              <div className="text-center mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-[#00BFFF]">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-base sm:text-lg">Finding your perfect job matches...</span>
              </div>
            )}

            {insightError && (
              <div className="text-center mb-6 sm:mb-8 p-4 bg-yellow-50 rounded-lg mx-4">
                <p className="text-yellow-700 text-sm sm:text-base">{insightError}</p>
              </div>
            )}
            
            {!hasSearched && !loading && jobs.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="mx-auto w-16 h-16 mb-6 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-[#00BFFF]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Start Your Career Journey?</h2>
                <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base">
                  We're here to help you find your dream job. Use the search bar above to discover opportunities 
                  that match your skills and aspirations. Add your resume to get personalized insights and 
                  recommendations.
                </p>
              </div>
            ) : (
              <section>
                <ErrorBoundary
                  FallbackComponent={ErrorFallback}
                  onReset={() => {
                    setError(null);
                    setInsightError(null);
                    handleSearch();
                  }}
                >
                  {error ? (
                    <div className="text-center p-6 bg-yellow-50 rounded-lg mx-4">
                      <p className="text-yellow-700 text-sm sm:text-base">{error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {jobs.map((job, index) => (
                        <div
                          key={job.id}
                          ref={index === jobs.length - 1 ? lastJobElementRef : undefined}
                        >
                          <JobCard 
                            job={job} 
                            onInsightsUpdate={handleJobUpdate}
                          />
                        </div>
                      ))}
                      {loading && (
                        [...Array(3)].map((_, i) => (
                          <div key={`skeleton-${i}`} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                        ))
                      )}
                    </div>
                  )}
                </ErrorBoundary>
              </section>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}