import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlignJustify, ChevronDown, Target, User, LogOut, Zap, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { jobCategories } from "@/lib/job-categories";
import { useInsights } from "@/contexts/InsightsContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { PricingPopup } from "@/components/pricing-popup";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MobileNavProps {
  isAuthenticated: boolean;
  handleSignIn: () => void;
  handleLogout: () => void;
  userName?: string;
}

export function MobileNav({ isAuthenticated, handleSignIn, handleLogout, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const navigate = useNavigate();
  const { credits } = useInsights();
  const { isConnected, connect, disconnect, address } = useWeb3();

  const handleCategoryClick = (searchQuery: string) => {
    navigate("/search", { state: { query: searchQuery } });
    setOpen(false);
  };

  const handleWalletAction = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full lg:hidden w-10 h-10 p-0 touch-manipulation"
          >
            <AlignJustify className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-[280px] sm:w-[320px] bg-white [&>button]:bg-white [&>button]:hover:bg-gray-50/90 overflow-y-auto"
        >
          <nav className="flex flex-col gap-1 pt-6">
            {/* User Section */}
            {isAuthenticated && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#E0F7FA] rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-[#00838F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>
                </div>
                
                {/* Credits Display */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Fit Analyses</span>
                    <span className="font-medium">{credits?.warmthSearches || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insights</span>
                    <span className="font-medium">{credits?.insights || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Greater Strategy</span>
                    <span className="font-medium">{credits?.greaterStrategy || 0}</span>
                  </div>
                </div>

                {/* Wallet Status */}
                {isConnected && address && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Wallet</span>
                      <span className="text-xs font-mono">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setShowPricing(true);
                      setOpen(false);
                    }}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Upgrade Plan
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      handleWalletAction();
                      setOpen(false);
                    }}
                  >
                    <Wallet className="h-3 w-3 mr-1" />
                    {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex flex-col gap-1">
              <Collapsible open={jobsOpen} onOpenChange={setJobsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="font-medium">Jobs</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${jobsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-3">
                  <Link 
                    to="/search" 
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-[#00BFFF]"
                    onClick={() => setOpen(false)}
                  >
                    <Target className="h-4 w-4" />
                    Search All Jobs
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <div className="text-xs font-medium text-gray-500 px-3 py-1">Job Categories</div>
                  {jobCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.searchQuery)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-[#00BFFF]"
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              
              <Link 
                to="/companies" 
                className="px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                Companies
              </Link>
              <Link 
                to="/resources" 
                className="px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/rewards" 
                className="px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                Rewards
              </Link>
            </div>

            {/* Auth Section */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white touch-manipulation"
                  onClick={() => {
                    handleSignIn();
                    setOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <PricingPopup 
        open={showPricing} 
        onOpenChange={setShowPricing}
      />
    </>
  );
}