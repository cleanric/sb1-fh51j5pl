import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Clock,
  Percent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobInsights } from "@/components/job-insights";
import { GreaterStrategyPopup } from "@/components/greater-strategy-popup";
import { Job } from "@/lib/jobs";

interface JobCardProps {
  job: Job;
  preview?: boolean;
  onInsightsUpdate?: (updatedJob: Job) => void;
}

export function JobCard({ job, preview = false, onInsightsUpdate }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showGreaterStrategy, setShowGreaterStrategy] = useState(false);
  
  const fitColors = {
    high: {
      badge: "bg-[#4CAF50] text-white",
      border: "border-[#4CAF50]/20",
      lightBadge: "bg-[#E8F5E9] text-[#2E7D32]"
    },
    warm: {
      badge: "bg-[#FFC107] text-black",
      border: "border-[#FFC107]/20",
      lightBadge: "bg-[#FFF8E1] text-[#FF8F00]"
    },
    stretch: {
      badge: "bg-[#DC3545] text-white",
      border: "border-[#DC3545]/20",
      lightBadge: "bg-[#FFEBEE] text-[#C62828]"
    },
    'see-insights': {
      badge: "bg-gray-100 text-gray-600",
      border: "border-gray-200",
      lightBadge: "bg-gray-100 text-gray-600"
    }
  };
  
  const fitLabels = {
    high: "High Fit",
    warm: "Warm Opportunity",
    stretch: "Stretch Fit",
    'see-insights': "See Insights"
  };
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || expanded)
    ) {
      return;
    }
    
    if (job.url && job.url !== '#') {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <>
      <Card 
        className={cn(
          "rounded-2xl shadow-sm bg-white transition-all duration-300 overflow-hidden cursor-pointer touch-manipulation",
          fitColors[job.fitLevel].border,
          expanded ? "transform scale-[1.01] sm:scale-[1.02] shadow-md" : "hover:shadow-md hover:transform hover:scale-[1.005] sm:hover:scale-[1.01] active:scale-[0.98]"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <Badge className={cn(fitColors[job.fitLevel].lightBadge, "text-xs sm:text-sm")}>
              {fitLabels[job.fitLevel]}
            </Badge>
            {job.fitLevel !== 'see-insights' && (
              <span className="text-xs sm:text-sm text-gray-500 flex items-center flex-shrink-0">
                <Percent className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />{job.fitPercentage}% match
              </span>
            )}
          </div>
          
          <div>
            <p className="text-xs sm:text-sm text-gray-500">{job.company}</p>
            <h3 className="text-base sm:text-lg font-semibold mt-1 text-[#2C2C2C] leading-tight">{job.title}</h3>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge className={cn(fitColors[job.fitLevel].badge, "text-xs")}>
              {fitLabels[job.fitLevel]}
            </Badge>
            <Badge className="bg-[#E0F7FA] text-[#00838F] flex items-center text-xs">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />{job.hoursToApply}h window
            </Badge>
          </div>
          
          {job.salary && (
            <div className="text-sm font-semibold">
              ${job.salary}
            </div>
          )}
          
          {job.hasCryptoRewards && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Coins className="h-3.5 w-3.5 text-[#00BFFF] flex-shrink-0" /> 
              <span>Earn {job.rewardAmount} {job.rewardCurrency} in crypto rewards</span>
            </div>
          )}
          
          <div className="pt-2 flex flex-col gap-2">
            <Button 
              className="rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white flex items-center justify-center gap-1 text-sm py-2.5 sm:py-2 touch-manipulation"
              onClick={toggleExpand}
            >
              {expanded ? (
                <>Hide Insights <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Reveal Insights <ChevronDown className="h-4 w-4" /></>
              )}
            </Button>
            
            <Button 
              className="rounded-full border border-[#00CED1] text-[#00CED1] bg-white hover:bg-[#f1f1f1] text-sm py-2.5 sm:py-2 touch-manipulation"
              onClick={() => setShowGreaterStrategy(true)}
            >
              Open Greater Strategy
            </Button>
          </div>
          
          {expanded && (
            <JobInsights 
              job={job}
              fitLevel={job.fitLevel}
              preview={preview}
              onInsightsUpdate={onInsightsUpdate}
            />
          )}
        </CardContent>
      </Card>

      <GreaterStrategyPopup 
        open={showGreaterStrategy} 
        onOpenChange={setShowGreaterStrategy}
        job={job}
      />
    </>
  );
}