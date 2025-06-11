import { 
  User,
  LogOut,
  ChevronDown,
  CreditCard,
  Sparkles,
  Zap,
  Target,
  Wallet,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { clearAllStorage } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { PricingPopup } from "@/components/pricing-popup";
import { useState } from "react";
import { useInsights } from "@/contexts/InsightsContext";
import { MobileNav } from "@/components/mobile-nav";
import { useWeb3 } from "@/contexts/Web3Context";
import { jobCategories } from "@/lib/job-categories";

export function Header() {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout } = useAuth0();
  const [showPricing, setShowPricing] = useState(false);
  const { credits } = useInsights();
  const { isConnected, connect, disconnect, address } = useWeb3();
  const navigate = useNavigate();

  const handleSignIn = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      },
      appState: {
        returnTo: window.location.pathname
      }
    });
  };

  const handleLogout = () => {
    clearAllStorage();
    disconnect();
    
    // Use a more robust logout approach
    try {
      logout({ 
        logoutParams: { 
          returnTo: window.location.origin 
        } 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear local state and redirect manually
      window.location.href = window.location.origin;
    }
  };

  const handleCategoryClick = (searchQuery: string) => {
    navigate("/search", { state: { query: searchQuery } });
  };
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#F8F8F8]/95 backdrop-blur-sm border-b border-[#E0E0E0] py-3 sm:py-4 px-4 sm:px-6">
        <div className="max-w-[2000px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://ik.imagekit.io/7u552ne2m/ChatGPT%20Image%20May%2022,%202025,%2005_56_04%20AM.png?updatedAt=1748430449931" 
                alt="Earn Hire Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <span className="font-bold text-lg sm:text-xl text-[#2C2C2C] hidden sm:inline-block">Earn Hire</span>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-[#2C2C2C] hover:text-[#00BFFF] transition-colors outline-none bg-[#F8F8F8] text-sm xl:text-base">
                Jobs <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 bg-[#F8F8F8]">
                <DropdownMenuItem asChild className="text-[#00BFFF] hover:text-[#00CED1] hover:bg-[#F0F0F0]">
                  <Link to="/search" className="cursor-pointer">
                    <Target className="h-4 w-4 mr-2" />
                    Search All Jobs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[#2C2C2C]">Job Categories</DropdownMenuLabel>
                {jobCategories.map((category) => (
                  <DropdownMenuItem 
                    key={category.name}
                    onClick={() => handleCategoryClick(category.searchQuery)}
                    className="cursor-pointer text-[#00BFFF] hover:text-[#00CED1] hover:bg-[#F0F0F0]"
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/companies" className="text-[#2C2C2C] hover:text-[#00BFFF] transition-colors text-sm xl:text-base">Companies</Link>
            <Link to="/resources" className="text-[#2C2C2C] hover:text-[#00BFFF] transition-colors text-sm xl:text-base">Resources</Link>
            <Link to="/rewards" className="text-[#2C2C2C] hover:text-[#00BFFF] transition-colors text-sm xl:text-base">Rewards</Link>
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isLoading ? (
              <Button 
                variant="outline" 
                className="rounded-full hidden md:flex items-center gap-2 bg-[#F8F8F8] text-sm px-3 py-2"
                disabled
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden lg:inline">Loading...</span>
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-full hidden md:flex items-center gap-2 bg-[#F8F8F8] text-sm px-3 py-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[80px] lg:max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#F8F8F8]">
                  <DropdownMenuLabel className="text-[#2C2C2C]">Credits Available</DropdownMenuLabel>
                  <DropdownMenuItem className="flex items-center justify-between cursor-default text-[#2C2C2C]">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">Job Fit Analyses</span>
                    </div>
                    <span className="font-medium">{credits?.warmthSearches || 0}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between cursor-default text-[#2C2C2C]">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Insights</span>
                    </div>
                    <span className="font-medium">{credits?.insights || 0}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between cursor-default text-[#2C2C2C]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm">Greater Strategy</span>
                    </div>
                    <span className="font-medium">{credits?.greaterStrategy || 0}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowPricing(true)} className="text-[#00BFFF] hover:text-[#00CED1] hover:bg-[#F0F0F0]">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Upgrade Plan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isConnected ? (
                    <DropdownMenuItem className="flex items-center justify-between cursor-default text-[#2C2C2C]">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span className="truncate text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={connect} className="text-[#00BFFF] hover:text-[#00CED1] hover:bg-[#F0F0F0]">
                      <Wallet className="h-4 w-4 mr-2" />
                      <span>Connect Wallet</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-[#F0F0F0]">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="rounded-full hidden md:flex bg-[#F8F8F8] hover:bg-[#00BFFF] hover:text-white text-sm px-3 py-2"
                onClick={handleSignIn}
              >
                <User className="h-4 w-4 mr-2" /> 
                <span className="hidden lg:inline">Sign in</span>
              </Button>
            )}

            <MobileNav 
              isAuthenticated={isAuthenticated}
              handleSignIn={handleSignIn}
              handleLogout={handleLogout}
              userName={user?.name}
            />
          </div>
        </div>
      </header>

      <PricingPopup 
        open={showPricing} 
        onOpenChange={setShowPricing}
        currentUserId={user?.sub}
      />
    </>
  );
}