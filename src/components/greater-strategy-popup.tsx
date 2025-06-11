import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Target, Trophy, Loader2 } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { generateGreaterStrategy } from "@/lib/openai";
import { Job } from "@/lib/jobs";
import { getStoredResumeText } from "@/lib/storage";
import { getRemainingCounts, incrementGreaterStrategyUsage } from "@/lib/insights";
import { useInsights } from "@/contexts/InsightsContext";

interface GreaterStrategyPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
}

export function GreaterStrategyPopup({ open, onOpenChange, job }: GreaterStrategyPopupProps) {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { refreshInsights } = useInsights();

  const handleGetStarted = async () => {
    if (!isAuthenticated || !user?.sub) {
      loginWithRedirect({
        appState: {
          returnTo: window.location.pathname
        }
      });
      return;
    }

    const counts = await getRemainingCounts(user.sub);
    if (counts.greaterStrategy <= 0) {
      setError("You've used all your Greater Strategy credits. Please upgrade your plan to continue.");
      return;
    }

    const resumeText = getStoredResumeText();
    if (!resumeText) {
      setError("Please add your resume text in the search bar to generate a personalized strategy.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await generateGreaterStrategy(resumeText, job);
      await incrementGreaterStrategyUsage(user.sub);
      await refreshInsights();
      setStrategy(result);
    } catch (err) {
      setError("Failed to generate strategy. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white [&>button]:bg-white [&>button]:hover:bg-gray-50/90">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Greater Strategy</DialogTitle>
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-[#00BFFF]" />
            Greater Strategy
          </h2>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {!strategy ? (
            <>
              <p className="text-center text-gray-600">
                Unlock comprehensive career insights and personalized strategies powered by AI to maximize your chances of landing your dream job.
              </p>

              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[#F8FDFF] border border-[#E3F2FD]">
                  <Brain className="h-5 w-5 text-[#00BFFF] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#333]">AI Career Coach</h3>
                    <p className="text-sm text-gray-600">
                      Get personalized advice from an AI career expert with deep knowledge of industries, companies, and job markets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-[#F8FDFF] border border-[#E3F2FD]">
                  <Target className="h-5 w-5 text-[#00BFFF] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#333]">Strategic Insights</h3>
                    <p className="text-sm text-gray-600">
                      Deep analysis of company culture, interview patterns, and success factors specific to this role.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-[#F8FDFF] border border-[#E3F2FD]">
                  <Trophy className="h-5 w-5 text-[#00BFFF] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#333]">Competitive Edge</h3>
                    <p className="text-sm text-gray-600">
                      Stand out with tailored application materials and interview strategies based on successful candidates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                {error && (
                  <p className="text-red-600 text-sm text-center mb-4">{error}</p>
                )}
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white"
                  onClick={handleGetStarted}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Strategy...
                    </>
                  ) : isAuthenticated ? (
                    'Generate Strategy'
                  ) : (
                    'Sign in to Continue'
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Requires credits or an active subscription plan
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Overview</h3>
                <p className="text-gray-600">{strategy.overview}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Company Insights</h3>
                <p className="text-gray-600">{strategy.companyInsights}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Application Strategy</h3>
                <p className="text-gray-600">{strategy.applicationStrategy}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Interview Preparation</h3>
                <p className="text-gray-600">{strategy.interviewPrep}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Negotiation Tips</h3>
                <p className="text-gray-600">{strategy.negotiationTips}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Long-term Strategy</h3>
                <p className="text-gray-600">{strategy.longTermStrategy}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}