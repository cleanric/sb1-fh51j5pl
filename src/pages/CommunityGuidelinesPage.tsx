import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Shield, Users, Building2, AlertCircle, Star } from "lucide-react";

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#E0F7FA] rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-[#00838F]" />
            </div>
            <h1 className="text-4xl font-bold">Community Guidelines</h1>
            <p className="text-lg text-gray-600">
              Our guidelines ensure a professional, respectful, and productive environment for all members of the Earn Hire community.
            </p>
          </div>

          <section className="bg-gradient-to-r from-[#E0F7FA] to-[#F0F9FF] rounded-xl p-8 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-[#00BFFF]" />
              </div>
              <h2 className="text-2xl font-semibold">Our Commitment</h2>
              <p className="text-gray-700">
                We take pride in building the job platform of the future that improves results for both job seekers and employers. As dedicated hosts of an empowering job search experience, we don't take our role lightly. Our valued members drive us to continuously grow and improve our services.
              </p>
            </div>
          </section>

          <div className="space-y-8">
            <section className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Job Seeker Guidelines</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li>• Maintain accurate and up-to-date profile information</li>
                <li>• Use professional language in all communications</li>
                <li>• Only apply to positions you're genuinely interested in</li>
                <li>• Report suspicious job postings or inappropriate behavior</li>
                <li>• Respect employers' time and application processes</li>
              </ul>
            </section>

            <section className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Employer Guidelines</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li>• Post accurate job descriptions with clear requirements</li>
                <li>• Provide transparent salary information when possible</li>
                <li>• Respond to applicants in a timely manner</li>
                <li>• Maintain confidentiality of applicant information</li>
                <li>• Ensure equal opportunity in hiring practices</li>
              </ul>
            </section>

            <section className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-[#00BFFF]" />
                <h2 className="text-xl font-semibold">Prohibited Conduct</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li>• Discrimination based on protected characteristics</li>
                <li>• Harassment or hostile behavior</li>
                <li>• False or misleading information</li>
                <li>• Spam or excessive duplicate content</li>
                <li>• Fraudulent job postings or scams</li>
                <li>• Sharing or selling user data</li>
              </ul>
            </section>

            <div className="bg-[#F0F9FF] rounded-xl p-6">
              <p className="text-gray-600">
                <strong>Note:</strong> Earn Hire reserves the right to remove any job seeking member, employer, or job posting that violates these guidelines. We are committed to maintaining a safe and professional environment for all users.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}