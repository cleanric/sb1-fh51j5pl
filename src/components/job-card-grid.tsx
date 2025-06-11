import { useEffect, useState } from "react";
import { JobCard } from "@/components/job-card";
import { Job, getRecommendedJobs } from "@/lib/jobs";
import { ErrorBoundary } from "react-error-boundary";
import { AlertCircle } from "lucide-react";

interface JobCardGridProps {
  onInsightsUpdate?: (updatedJob: Job) => void;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center p-6 bg-red-50 rounded-lg">
      <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
        <AlertCircle className="w-6 h-6" />
        <h2 className="text-lg font-semibold">Error Loading Jobs</h2>
      </div>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function JobGrid({ onInsightsUpdate }: JobCardGridProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setError(null);
        setLoading(true);

        const recommendedJobs = await getRecommendedJobs();
        setJobs(recommendedJobs);
      } catch (err) {
        setError("Failed to fetch jobs. Please try again later.");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const handleJobUpdate = (updatedJob: Job) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    );
    if (onInsightsUpdate) {
      onInsightsUpdate(updatedJob);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map(job => (
        <JobCard 
          key={job.id} 
          job={job} 
          onInsightsUpdate={handleJobUpdate}
        />
      ))}
    </div>
  );
}

export function JobCardGrid({ onInsightsUpdate }: JobCardGridProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <JobGrid onInsightsUpdate={onInsightsUpdate} />
    </ErrorBoundary>
  );
}