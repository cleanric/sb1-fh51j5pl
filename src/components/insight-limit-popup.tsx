import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingPopup } from "@/components/pricing-popup";
import { useState } from "react";
import { Sparkles } from "lucide-react";

interface InsightLimitPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InsightLimitPopup({ open, onOpenChange }: InsightLimitPopupProps) {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-white [&>button]:bg-white [&>button]:hover:bg-gray-50/90">
          <DialogHeader>
            <DialogTitle className="sr-only">Daily Limit Reached</DialogTitle>
            <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-[#00BFFF]" />
              Daily Limit Reached
            </h2>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <p className="text-center text-gray-600">
              You've used all 3 of your free daily insights. Upgrade to a paid plan to unlock unlimited insights and exclusive features.
            </p>

            <div className="space-y-4">
              <Button
                className="w-full rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white"
                onClick={() => {
                  onOpenChange(false);
                  setShowPricing(true);
                }}
              >
                View Plans
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Maybe Later
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Your insights will reset in 24 hours
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <PricingPopup
        open={showPricing}
        onOpenChange={setShowPricing}
      />
    </>
  );
}