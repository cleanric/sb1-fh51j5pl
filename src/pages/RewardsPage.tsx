import { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RewardsCashout } from "@/components/rewards-cashout";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Target, Coins, ExternalLink } from "lucide-react";
import { getCryptoRewardStatus } from "@/lib/insights";
import { useWeb3 } from "@/contexts/Web3Context";
import { useAuth0 } from "@auth0/auth0-react";

export default function RewardsPage() {
  const [showCashout, setShowCashout] = useState(false);
  const [rewardStatus, setRewardStatus] = useState<any>(null);
  const { isConnected, connect, disconnect, address } = useWeb3();
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    const fetchRewardStatus = async () => {
      if (isAuthenticated && user?.sub) {
        try {
          const status = await getCryptoRewardStatus(user.sub);
          setRewardStatus(status);
        } catch (error) {
          console.error('Error fetching reward status:', error);
          // Set default values if there's an error
          setRewardStatus({
            points: 0,
            timeRequirementMet: false,
            canCashOut: false,
            reviewedJobs: 0,
            isAnonymous: true,
            anonymousJobClicks: 0,
            regionRestricted: false
          });
        }
      } else {
        // Set default values for non-authenticated users
        setRewardStatus({
          points: 0,
          timeRequirementMet: false,
          canCashOut: false,
          reviewedJobs: 0,
          isAnonymous: true,
          anonymousJobClicks: 0,
          regionRestricted: false
        });
      }
    };

    fetchRewardStatus();
  }, [isAuthenticated, user?.sub]);

  const handleCashoutClick = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    setShowCashout(true);
  };

  const getButtonText = () => {
    if (!rewardStatus) return 'Loading...';
    
    if (rewardStatus.regionRestricted) {
      return 'Rewards Not Available';
    }
    if (!isConnected) {
      return 'Connect Wallet to Claim';
    }
    if (!rewardStatus.timeRequirementMet) {
      return 'Apply to Jobs to Earn More';
    }
    if (rewardStatus.points < 100) {
      return 'Apply to Jobs to Earn More';
    }
    return 'Claim Your Rewards';
  };

  const isButtonDisabled = () => {
    if (!rewardStatus) return true;
    
    if (rewardStatus.regionRestricted) {
      return true;
    }
    if (!isConnected) {
      return false; // Never disable if wallet isn't connected
    }
    return !rewardStatus.canCashOut;
  };

  const getTimeRequirementText = () => {
    if (!rewardStatus) return "Loading...";
    
    if (rewardStatus.timeRequirementMet) {
      return "Requirement met";
    }
    
    const baseTime = "10 minutes";
    if (rewardStatus.isAnonymous && rewardStatus.anonymousJobClicks > 0) {
      const additionalTime = rewardStatus.anonymousJobClicks * 45;
      return `${baseTime} + ${additionalTime} seconds`;
    }
    return baseTime;
  };

  const getStatusMessage = () => {
    if (!rewardStatus) return "Loading...";
    
    if (rewardStatus.regionRestricted) {
      return "Rewards not available in your region";
    }
    if (!isConnected) {
      return "Connect your wallet to claim rewards";
    }
    if (!rewardStatus.timeRequirementMet) {
      if (rewardStatus.isAnonymous && rewardStatus.anonymousJobClicks > 0) {
        return `Additional time required: ${rewardStatus.anonymousJobClicks * 45} seconds`;
      }
      return "Apply to more jobs to meet the time requirement";
    }
    if (rewardStatus.points < 100) {
      return "Apply to more jobs to earn at least 100 points";
    }
    return "Ready to claim your rewards!";
  };

  if (!rewardStatus) {
    return (
      <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Earn While You Search</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get rewarded in MATIC tokens for your job search activities. We share our job ad revenue with job seekers as a thank you for your valuable time.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm space-y-3">
                <div className="bg-[#E0F7FA] w-12 h-12 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-[#00838F]" />
                </div>
                <h3 className="font-semibold text-lg">Your Points</h3>
                <p className="text-3xl font-bold text-[#00BFFF]">{rewardStatus.points}</p>
                <p className="text-sm text-gray-500">Worth {(rewardStatus.points * 0.01).toFixed(2)} MATIC</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm space-y-3">
                <div className="bg-[#E8F5E9] w-12 h-12 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#2E7D32]" />
                </div>
                <h3 className="font-semibold text-lg">Jobs Reviewed</h3>
                <p className="text-3xl font-bold text-[#2E7D32]">{rewardStatus.reviewedJobs}</p>
                <p className="text-sm text-gray-500">Look for the <Coins className="h-4 w-4 inline" /> icon</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm space-y-3">
                <div className="bg-[#FFF8E1] w-12 h-12 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#FF8F00]" />
                </div>
                <h3 className="font-semibold text-lg">Time Requirement</h3>
                <p className="text-3xl font-bold text-[#FF8F00]">
                  {rewardStatus.timeRequirementMet ? "✓" : getTimeRequirementText()}
                </p>
                <p className="text-sm text-gray-500">
                  {rewardStatus.timeRequirementMet 
                    ? "Requirement met" 
                    : rewardStatus.isAnonymous 
                      ? "Base time + 45s per job click" 
                      : "Minimum search time needed"}
                </p>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-white rounded-xl p-8 space-y-8">
              <h2 className="text-2xl font-bold text-center">How to Earn Rewards</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="bg-[#E0F7FA] w-12 h-12 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-[#00838F]" />
                  </div>
                  <h3 className="font-semibold">Review Jobs</h3>
                  <p className="text-gray-600">
                    Look for jobs with the <Coins className="h-4 w-4 inline" /> icon to earn MATIC rewards.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#E8F5E9] w-12 h-12 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-[#2E7D32]" />
                  </div>
                  <h3 className="font-semibold">Stay Active</h3>
                  <p className="text-gray-600">
                    Spend at least 10 minutes searching and reviewing jobs to qualify for rewards. 
                    {rewardStatus.isAnonymous && (
                      <span className="block mt-1 text-sm">
                        Note: Anonymous users have an additional 45-second requirement per job click.
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#FFF8E1] w-12 h-12 rounded-full flex items-center justify-center">
                    <Coins className="h-6 w-6 text-[#FF8F00]" />
                  </div>
                  <h3 className="font-semibold">Claim Rewards</h3>
                  <p className="text-gray-600">
                    Convert your points to MATIC tokens once you've earned at least 100 points.
                  </p>
                </div>
              </div>
            </div>

            {/* Understanding Crypto Section */}
            <div className="bg-white rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-center">Understanding Your Rewards</h2>
              <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-gray-600">
                  MATIC is a cryptocurrency that can be easily converted to USDC or Bitcoin through exchanges. We recommend using Coinbase Wallet for beginners.
                </p>
                <div className="flex justify-center">
                  <a 
                    href="https://www.youtube.com/watch?v=CxX15URhQrE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#00BFFF] hover:underline"
                  >
                    Learn about crypto wallets <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Cashout Section */}
            <div className="text-center space-y-6">
              {isConnected && address && (
                <div className="bg-white p-4 rounded-lg shadow-sm inline-block mb-4">
                  <p className="text-sm text-gray-600">Connected Wallet</p>
                  <p className="font-mono font-medium">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
                </div>
              )}
              
              <Button
                className="rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white px-8 py-6 text-lg"
                onClick={handleCashoutClick}
                disabled={isButtonDisabled()}
              >
                {getButtonText()}
              </Button>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {getStatusMessage()}
                </p>
                {isConnected && (
                  <>
                    <button 
                      onClick={disconnect}
                      className="text-sm text-[#00BFFF] hover:underline bg-transparent"
                    >
                      Disconnect Wallet
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Remember to claim your rewards before ending your session.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      <RewardsCashout 
        open={showCashout} 
        onOpenChange={setShowCashout} 
      />
    </div>
  );
}