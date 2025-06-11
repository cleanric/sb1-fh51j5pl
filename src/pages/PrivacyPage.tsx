import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Lock, Shield, Eye, Wallet } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#E0F7FA] rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-[#00838F]" />
            </div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Your privacy is our top priority. We're committed to protecting your personal information and being transparent about how we use it.
            </p>
          </div>

          <section className="bg-gradient-to-r from-[#E0F7FA] to-[#F0F9FF] rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-[#00BFFF]" />
              <h2 className="text-xl font-semibold">Our Privacy Commitment</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                At Earn Hire, we believe in absolute transparency about data privacy. We want to be crystal clear: <strong>we never sell your personal data</strong>. Your information is used solely to provide you with the best job search experience possible.
              </p>
              <p>
                We understand that your resume and career information are highly sensitive and personal. We treat this data with the utmost respect and implement strict security measures to protect it.
              </p>
            </div>
          </section>

          <section className="space-y-8">
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Data Collection & Usage</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <h3 className="font-semibold text-[#2C2C2C]">Information We Collect:</h3>
                <ul className="space-y-2">
                  <li>• Resume content and career preferences</li>
                  <li>• Profile information (name, email, professional background)</li>
                  <li>• Job search activity and preferences</li>
                  <li>• Authentication data for account security</li>
                </ul>

                <h3 className="font-semibold text-[#2C2C2C] mt-4">How We Use Your Data:</h3>
                <ul className="space-y-2">
                  <li>• Matching you with relevant job opportunities</li>
                  <li>• Generating personalized career insights</li>
                  <li>• Providing customized job search recommendations</li>
                  <li>• Ensuring platform security and preventing fraud</li>
                  <li>• Improving our services and user experience</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Authentication & Wallet Privacy</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>Our platform uses two separate systems for user identity and rewards:</p>
                <ul className="space-y-2">
                  <li>• <strong>User Authentication (Auth0):</strong> Manages your user identity (email, name) and determines if you're a signed-in user</li>
                  <li>• <strong>Wallet Connection (Web3Modal):</strong> Handles cryptocurrency transactions and reward claims</li>
                </ul>
                <p className="mt-4">
                  <strong>Important:</strong> We do not persistently link your user account to your wallet address. Your wallet address is only used for:
                </p>
                <ul className="space-y-2">
                  <li>• Processing reward transactions</li>
                  <li>• Temporary rate-limiting during your session</li>
                  <li>• Security checks during reward claims</li>
                </ul>
                <p className="mt-4">
                  This separation ensures your privacy while maintaining platform security.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Data Protection</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <ul className="space-y-2">
                  <li>• All data is encrypted in transit and at rest</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• Strict access controls and authentication measures</li>
                  <li>• Automated threat detection and prevention</li>
                  <li>• Regular data backup and disaster recovery procedures</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#F0F9FF] rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">Your Rights</h2>
              <div className="space-y-3 text-gray-600">
                <p>You have the right to:</p>
                <ul className="space-y-2">
                  <li>• Access your personal data</li>
                  <li>• Request data correction or deletion</li>
                  <li>• Export your data</li>
                  <li>• Opt-out of certain data processing activities</li>
                  <li>• Withdraw consent for data processing</li>
                </ul>
                <p className="mt-4">
                  Contact us at privacy@earnhire.com to exercise these rights or ask any privacy-related questions.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}