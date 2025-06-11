import { useState, useEffect } from "react";
import { Puzzle as PuzzlePiece, FileText, Linkedin, FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingPopup } from "@/components/pricing-popup";
import { InsightLimitPopup } from "@/components/insight-limit-popup";
import { hasReachedLimit, incrementInsightUsage, checkAndResetDaily, addCryptoPoints } from "@/lib/insights";
import { useAuth0 } from "@auth0/auth0-react";
import { getStoredResumeText } from "@/lib/storage";
import { analyzeJobs } from "@/lib/openai";
import { Job } from "@/lib/jobs";
import { useInsights } from "@/contexts/InsightsContext";

interface JobInsightsProps {
  job: Job;
  fitLevel: "high" | "warm" | "stretch" | "see-insights";
  preview?: boolean;
  onInsightsUpdate?: (updatedJob: Job) => void;
}

interface Insights {
  fitAnalysis: string;
  resumeTip: string;
  linkedinStrategy: string;
  coverLetterHook: string;
}

export function JobInsights({ job, fitLevel, preview = false, onInsightsUpdate }: JobInsightsProps) {
  const [showPricing, setShowPricing] = useState(false);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [revealedInsights, setRevealedInsights] = useState<Insights | null>(null);
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const { refreshInsights } = useInsights();
  
  useEffect(() => {
    if (!preview && isAuthenticated && user?.sub) {
      checkAndResetDaily(user.sub).catch(console.error);
    }
    
    if (job.insights) {
      setRevealedInsights(job.insights);
    }
  }, [preview, isAuthenticated, user?.sub, job.insights]);

  const handleInsightReveal = async () => {
    if (!preview) {
      if (!isAuthenticated || !user?.sub) {
        loginWithRedirect({
          appState: {
            returnTo: window.location.pathname
          }
        });
        return;
      }

      if (await hasReachedLimit(user.sub)) {
        setShowLimitPopup(true);
        return;
      }

      const resumeText = getStoredResumeText();
      if (!resumeText) {
        throw new Error("Resume text is required to generate insights");
      }

      try {
        setIsLoadingInsights(true);
        
        if (await incrementInsightUsage(user.sub)) {
          const analysis = await analyzeJobs(resumeText, [job]);
          if (analysis && analysis.length > 0) {
            setRevealedInsights(analysis[0].insights);
            if (onInsightsUpdate) {
              onInsightsUpdate({
                ...job,
                fitLevel: analysis[0].fitLevel,
                fitPercentage: analysis[0].fitPercentage,
                insights: analysis[0].insights
              });
            }
            await refreshInsights();

            // Add crypto points when insights are successfully revealed
            if (job.hasCryptoRewards) {
              await addCryptoPoints(job.id, user.sub, isAuthenticated);
              await refreshInsights(); // Refresh to update points display
            }
          }
        }
      } catch (error) {
        console.error('Error generating insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    }
  };
  
  const previewInsights = {
    high: {
      fitAnalysis: "You match 95% of the required skills and experience. Your background in software development and cloud infrastructure is perfectly aligned with this position.",
      resumeTip: "Highlight your experience with distributed systems and microservices architecture. Quantify your impact with metrics from previous projects.",
      linkedinStrategy: "Connect with 2-3 current employees in similar roles. Mention your interest in cloud technologies in your connection request.",
      coverLetterHook: "As someone who has successfully deployed large-scale cloud solutions that improved system reliability by 35%, I'm excited about bringing this expertise to your team."
    },
    warm: {
      fitAnalysis: "You match 82% of the job requirements. Your product experience is strong, but you may need to emphasize your analytical skills more.",
      resumeTip: "Emphasize your experience with product analytics and user research. Include specific examples of data-driven decisions that led to product improvements.",
      linkedinStrategy: "Follow the company and engage with their recent posts. Reach out to the product team lead with specific questions about their roadmap.",
      coverLetterHook: "Having led product initiatives that increased user engagement by 40%, I'm eager to apply my user-centric approach to drive similar results for your products."
    },
    stretch: {
      fitAnalysis: "This role requires more specialized experience than your current profile shows. Consider it a growth opportunity that would require additional effort.",
      resumeTip: "Focus on transferable skills and relevant projects. Consider creating a portfolio piece that demonstrates your capability in this area.",
      linkedinStrategy: "Connect with people who have made similar career transitions. Ask about courses or certifications that helped them bridge the gap.",
      coverLetterHook: "While my background differs from the traditional path, my unique perspective from [relevant industry] gives me insights that could bring fresh solutions to your challenges."
    },
    "see-insights": {
      fitAnalysis: "Click to analyze your fit for this position and get personalized insights.",
      resumeTip: "Get tailored resume advice based on your experience and the job requirements.",
      linkedinStrategy: "Learn effective networking strategies specific to this company and role.",
      coverLetterHook: "Discover how to craft a compelling cover letter that highlights your unique value."
    }
  };

  const placeholderInsights = {
    high: {
      fitAnalysis: "Unlock personalized insights into your job compatibility.",
      resumeTip: "Get tailored resume advice to highlight your strengths.",
      linkedinStrategy: "Discover effective networking strategies to connect with key people at this company.",
      coverLetterHook: "Craft a compelling cover letter that grabs the hiring manager's attention."
    },
    warm: {
      fitAnalysis: "Unlock personalized insights into your job compatibility.",
      resumeTip: "Get tailored resume advice to highlight your strengths.",
      linkedinStrategy: "Discover effective networking strategies to connect with key people at this company.",
      coverLetterHook: "Craft a compelling cover letter that grabs the hiring manager's attention."
    },
    stretch: {
      fitAnalysis: "Unlock personalized insights into your job compatibility.",
      resumeTip: "Get tailored resume advice to highlight your strengths.",
      linkedinStrategy: "Discover effective networking strategies to connect with key people at this company.",
      coverLetterHook: "Craft a compelling cover letter that grabs the hiring manager's attention."
    },
    "see-insights": {
      fitAnalysis: "Unlock personalized insights into your job compatibility.",
      resumeTip: "Get tailored resume advice to highlight your strengths.",
      linkedinStrategy: "Discover effective networking strategies to connect with key people at this company.",
      coverLetterHook: "Craft a compelling cover letter that grabs the hiring manager's attention."
    }
  };
  
  const insights = preview ? previewInsights[fitLevel] : 
                  revealedInsights ? revealedInsights : 
                  placeholderInsights[fitLevel];
  
  return (
    <>
      <div className="mt-5 pt-5 border-t border-gray-100 space-y-4 text-sm">
        <div className="flex items-start gap-3">
          <div className="bg-[#E0F7FA] p-2 rounded-full">
            <PuzzlePiece className="h-4 w-4 text-[#00838F]" />
          </div>
          <div>
            <h4 className="font-semibold text-[#333]">Fit Analysis</h4>
            <p className="text-gray-600 mt-1">{insights.fitAnalysis}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="bg-[#E8F5E9] p-2 rounded-full">
            <FileText className="h-4 w-4 text-[#2E7D32]" />
          </div>
          <div>
            <h4 className="font-semibold text-[#333]">Resume Tip</h4>
            <p className="text-gray-600 mt-1">{insights.resumeTip}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="bg-[#E3F2FD] p-2 rounded-full">
            <Linkedin className="h-4 w-4 text-[#1565C0]" />
          </div>
          <div>
            <h4 className="font-semibold text-[#333]">LinkedIn Strategy</h4>
            <p className="text-gray-600 mt-1">{insights.linkedinStrategy}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="bg-[#FFF8E1] p-2 rounded-full">
            <FileSignature className="h-4 w-4 text-[#FF8F00]" />
          </div>
          <div>
            <h4 className="font-semibold text-[#333]">Cover Letter Hook</h4>
            <p className="text-gray-600 mt-1">{insights.coverLetterHook}</p>
          </div>
        </div>

        {!preview && !revealedInsights && (
          <Button 
            className="w-full mt-4 rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white hover:shadow-md transition-shadow"
            onClick={handleInsightReveal}
            disabled={isLoadingInsights}
          >
            {isLoadingInsights ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Insights...
              </div>
            ) : isAuthenticated ? (
              'Unlock All Insights'
            ) : (
              'Sign in to Unlock Insights'
            )}
          </Button>
        )}
      </div>
      
      <PricingPopup open={showPricing} onOpenChange={setShowPricing} />
      <InsightLimitPopup open={showLimitPopup} onOpenChange={setShowLimitPopup} />
    </>
  );
}