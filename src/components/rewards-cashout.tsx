import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Trophy, AlertCircle } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { claimRewards } from "@/lib/contracts";
import { getCryptoRewardStatus, resetCryptoPoints } from "@/lib/insights";
import { securityService } from "@/lib/services/security";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from 'react';

interface RewardsCashoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RewardsCashout({ open, onOpenChange }: RewardsCashoutProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewardStatus, setRewardStatus] = useState<any>(null);
  const { isConnected, connect, contract, address } = useWeb3();
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    const fetchRewardStatus = async () => {
      if (isAuthenticated && user?.sub) {
        try {
          const status = await getCryptoRewardStatus(user.sub);
          setRewardStatus(status);
        } catch (error) {
          console.error('Error fetching reward status:', error);
        }
      }
    };

    if (open) {
      fetchRewardStatus();
    }
  }, [open, isAuthenticated, user?.sub]);

  const handleClaim = async () => {
    if (!isAuthenticated || !user?.sub) {
      setError("Please sign in to claim rewards");
      return;
    }

    if (!isConnected || !address) {
      await connect();
      return;
    }

    if (!contract) {
      setError("Wallet connection error. Please try again.");
      return;
    }

    // Check for suspicious activity
    const securityCheck = securityService.checkAttempt(address);
    if (!securityCheck.allowed) {
      const minutes = Math.ceil(securityCheck.cooldownRemaining / 60000);
      setError(`Too many attempts. Please try again in ${minutes} minutes.`);
      return;
    }

    try {
      setIsClaiming(true);
      setError(null);

      // Convert points to MATIC (1 point = 0.01 MATIC)
      const maticAmount = rewardStatus.points * 0.01;
      
      // Placeholder signature - in production this would come from your backend
      const signature = "0x...";

      const success = await claimRewards(contract, maticAmount, signature);
      
      if (success) {
        await resetCryptoPoints(user.sub);
        securityService.resetViolations(address);
        onOpenChange(false);
      } else {
        setError("Failed to claim rewards. Please try again.");
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      setError("An error occurred while claiming rewards.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!rewardStatus) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white [&>button]:bg-white [&>button]:hover:bg-gray-50/90">
        <DialogHeader>
          <DialogTitle className="sr-only">Claim Rewards</DialogTitle>
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-[#00BFFF]" />
            Claim Rewards
          </h2>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#F8FDFF] rounded-lg">
              <span className="text-gray-600">Available Points</span>
              <span className="font-bold text-[#00BFFF]">{rewardStatus.points}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#F8FDFF] rounded-lg">
              <span className="text-gray-600">MATIC Value</span>
              <span className="font-bold text-[#00BFFF]">{(rewardStatus.points * 0.01).toFixed(2)} MATIC</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {rewardStatus.timeRequirementMet 
                  ? "Time requirement met" 
                  : "10 minutes of job searching required"}
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <Button
            className="w-full rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white"
            onClick={handleClaim}
            disabled={isClaiming || !rewardStatus.canCashOut}
          >
            {isClaiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !rewardStatus.canCashOut ? (
              'Not Enough Points'
            ) : (
              'Claim Rewards'
            )}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Minimum 100 points required to claim rewards
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}