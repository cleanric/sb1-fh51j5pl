import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Building2, Mail } from "lucide-react";

export default function CompaniesComingSoonPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <main className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-[#E0F7FA] rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-10 w-10 text-[#00838F]" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Coming Soon</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're building something special for employers. Soon you'll be able to post jobs and connect with talented candidates through our AI-powered platform.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Interested in Posting Jobs?</h2>
              <p className="text-gray-600 mb-6">
                Get early access and special launch pricing. Contact us to learn more about posting opportunities on Earn Hire.
              </p>
              <Button
                className="rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white"
                onClick={() => window.location.href = 'mailto:employer@earnhire.com'}
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}