import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface SignInPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
}

export function SignInPopup({ open, onOpenChange, onSwitchToSignUp }: SignInPopupProps) {
  const { loginWithRedirect } = useAuth0();

  const handleSignIn = async () => {
    onOpenChange(false);
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      },
      appState: {
        returnTo: window.location.pathname
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white [&>button]:bg-white [&>button]:hover:bg-gray-50/90">
        <DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Welcome Back</DialogTitle>
          </VisuallyHidden.Root>
          <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-center text-gray-600">
            Sign in to unlock job insights, track your applications, and earn rewards.
          </p>
          
          <Button 
            onClick={handleSignIn}
            className="w-full rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white"
          >
            Continue to Sign In
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }}
              className="text-[#00BFFF] hover:underline"
            >
              Sign Up
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}