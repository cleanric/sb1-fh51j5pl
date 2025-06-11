import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Scale, Wallet, AlertCircle, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#E0F7FA] rounded-full flex items-center justify-center mx-auto">
              <Scale className="h-8 w-8 text-[#00838F]" />
            </div>
            <h1 className="text-4xl font-bold">Terms and Conditions</h1>
            <p className="text-lg text-gray-600">
              Please read these terms carefully before using Earn Hire's services.
            </p>
          </div>

          <section className="space-y-8">
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">General Terms</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>By using Earn Hire, you agree to:</p>
                <ul className="space-y-2">
                  <li>• Provide accurate and truthful information</li>
                  <li>• Maintain the security of your account credentials</li>
                  <li>• Use the platform for legitimate job seeking purposes</li>
                  <li>• Comply with our community guidelines</li>
                  <li>• Not engage in any fraudulent or deceptive practices</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Platform Authentication & Rewards</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>Our platform uses two separate systems:</p>
                <ul className="space-y-2">
                  <li>• <strong>User Authentication:</strong> Determines your signed-in status and access to features</li>
                  <li>• <strong>Wallet Connection:</strong> Required only for claiming crypto rewards</li>
                </ul>
                <p className="mt-4">Important terms regarding rewards:</p>
                <ul className="space-y-2">
                  <li>• Anonymous users (not signed in) have additional time requirements for earning rewards</li>
                  <li>• Wallet connection is only required when claiming rewards</li>
                  <li>• Rewards are distributed on the Polygon network</li>
                  <li>• Users are responsible for gas fees when claiming rewards</li>
                  <li>• Rewards program may be modified or discontinued at any time</li>
                  <li>• Users must comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Refund Policy</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>
                  Refunds for insight credit plans are evaluated on a case-by-case basis. In most cases, we do not provide refunds. Considerations include:
                </p>
                <ul className="space-y-2">
                  <li>• Technical issues preventing service access</li>
                  <li>• Service availability and uptime</li>
                  <li>• Usage history and account standing</li>
                  <li>• Time elapsed since purchase</li>
                </ul>
                <p className="mt-4">
                  Contact support@earnhire.com for refund requests. All decisions are final.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">User Responsibilities</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <ul className="space-y-2">
                  <li>• Maintain accurate profile information</li>
                  <li>• Protect account credentials and wallet access</li>
                  <li>• Report any suspicious activity or security concerns</li>
                  <li>• Use platform features and services appropriately</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#F0F9FF] rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">Limitation of Liability</h2>
              <div className="space-y-3 text-gray-600">
                <p>Earn Hire is not liable for:</p>
                <ul className="space-y-2">
                  <li>• Cryptocurrency market fluctuations</li>
                  <li>• Network fees or transaction delays</li>
                  <li>• Third-party services or integrations</li>
                  <li>• User errors or negligence</li>
                  <li>• Lost or stolen crypto rewards</li>
                  <li>• Employment outcomes or hiring decisions</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-xl p-6">
            <p className="text-gray-600">
              These terms may be updated at any time. Users will be notified of significant changes. Continued use of Earn Hire constitutes acceptance of current terms.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}