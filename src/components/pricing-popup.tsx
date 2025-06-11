import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Coins } from "lucide-react";

interface PricingPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

interface PricingTier {
  name: string;
  price: { monthly: number; annual: number };
  features: string[];
  highlight?: boolean;
  stripeLinks: {
    monthly: string;
    annual: string;
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: { monthly: 19.99, annual: 199.99 },
    features: [
      "120 Job Fit Analyses",
      "10 Greater Strategy unlocks",
      "Unlimited job searches",
      "Personalized job recommendations",
      "Email support",
      "🪙 Earn 0.25 MATIC per job click",
      "🪙 Earn 0.125 MATIC per insight reveal"
    ],
    highlight: true,
    stripeLinks: {
      monthly: "https://buy.stripe.com/6oUaEYahl0lZ8N39X88ww0c",
      annual: "https://buy.stripe.com/aFaeVe3SX2u7e7nc5g8ww0d"
    }
  },
  {
    name: "Pro",
    price: { monthly: 39.99, annual: 399.99 },
    features: [
      "400 Job Fit Analyses",
      "20 Greater Strategy unlocks",
      "Unlimited job searches",
      "Priority job recommendations",
      "Priority support",
      "Custom job alerts",
      "Resume review tools",
      "Interview preparation guides",
      "🪙 Earn 0.25 MATIC per job click",
      "🪙 Earn 0.125 MATIC per insight reveal"
    ],
    highlight: true,
    stripeLinks: {
      monthly: "https://buy.stripe.com/3cI5kEexB1q3bZf7P08ww0e",
      annual: "https://buy.stripe.com/dRm5kEfBF6Kn4wNd9k8ww0f"
    }
  }
];

const boostOptions = [
  {
    name: "Additional Insight Reveal",
    price: 1.99,
    description: "Unlock one additional insight reveal + earn 0.125 MATIC",
    stripeLink: "https://buy.stripe.com/7sY14o6158Svd3j0my8ww0g"
  },
  {
    name: "Greater Strategy Unlock",
    price: 4.99,
    description: "Unlock one greater strategy option",
    stripeLink: "https://buy.stripe.com/6oUeVe4X1ecP0gx6KW8ww0h"
  }
];

export function PricingPopup({ open, onOpenChange, currentUserId }: PricingPopupProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const handlePlanPurchase = (tier: PricingTier) => {
    const link = isAnnual ? tier.stripeLinks.annual : tier.stripeLinks.monthly;
    const urlWithUserId = currentUserId ? `${link}?client_reference_id=${currentUserId}` : link;
    window.open(urlWithUserId, '_blank', 'noopener,noreferrer');
  };

  const handleBoostPurchase = (boostLink: string) => {
    const urlWithUserId = currentUserId ? `${boostLink}?client_reference_id=${currentUserId}` : boostLink;
    window.open(urlWithUserId, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden flex flex-col bg-white [&>button]:bg-white [&>button]:hover:bg-gray-50/90 mx-4 sm:mx-auto">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
          <DialogTitle className="sr-only">Choose Your Plan</DialogTitle>
          <h2 className="text-xl sm:text-2xl font-bold text-center">Choose Your Plan</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-sm ${!isAnnual ? 'text-[#00BFFF]' : 'text-gray-500'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-[#00BFFF]"
            />
            <span className={`text-sm ${isAnnual ? 'text-[#00BFFF]' : 'text-gray-500'}`}>
              Annual (Save 16%)
            </span>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Crypto Rewards Highlight */}
          <div className="bg-gradient-to-r from-[#E0F7FA] to-[#F0F9FF] rounded-xl p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Coins className="h-5 sm:h-6 w-5 sm:w-6 text-[#00BFFF]" />
              <h3 className="text-base sm:text-lg font-bold">New: Crypto Rewards</h3>
            </div>
            <p className="text-gray-700 text-sm sm:text-base">
              Paid plan members now earn MATIC tokens for every job click and insight reveal! 
              Turn your job search into crypto rewards while finding your perfect career match.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-4 sm:p-6 space-y-4 ${
                  tier.highlight
                    ? 'border-2 border-[#00BFFF] bg-[#F8FDFF]'
                    : 'border border-gray-200'
                }`}
              >
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold">{tier.name}</h3>
                  <div className="text-2xl sm:text-3xl font-bold">
                    ${isAnnual ? tier.price.annual : tier.price.monthly}
                    <span className="text-sm sm:text-base font-normal text-gray-500">
                      {isAnnual ? '/year' : '/month'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      {feature.includes('🪙') ? (
                        <Coins className="h-4 w-4 text-[#00BFFF] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="h-4 w-4 text-[#00BFFF] flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs sm:text-sm ${feature.includes('🪙') ? 'font-medium text-[#00BFFF]' : ''}`}>
                        {feature.replace('🪙 ', '')}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-full text-sm sm:text-base py-2.5 sm:py-3 touch-manipulation ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white'
                      : 'bg-white border border-[#00BFFF] text-[#00BFFF] hover:bg-[#F8FDFF]'
                  }`}
                  onClick={() => handlePlanPurchase(tier)}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00BFFF]" />
              Boost Options
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {boostOptions.map((boost) => (
                <div
                  key={boost.name}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="font-semibold text-sm sm:text-base">{boost.name}</div>
                  <p className="text-xs sm:text-sm text-gray-500">{boost.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-base">${boost.price}</span>
                    <Button
                      className="rounded-full bg-white border border-[#00BFFF] text-[#00BFFF] hover:bg-[#F8FDFF] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 touch-manipulation"
                      onClick={() => handleBoostPurchase(boost.stripeLink)}
                    >
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}