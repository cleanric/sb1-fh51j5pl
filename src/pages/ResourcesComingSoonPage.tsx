import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail } from "lucide-react";

export default function ResourcesComingSoonPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <main className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-10 w-10 text-[#2E7D32]" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Resources Coming Soon</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're curating a collection of valuable resources to help you succeed in your career journey. From interview tips to industry insights, we'll have everything you need.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Want to Be Featured?</h2>
              <p className="text-gray-600 mb-6">
                Are you a career expert, coach, or content creator? We'd love to feature your insights and resources on our platform.
              </p>
              <Button
                className="rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white"
                onClick={() => window.location.href = 'mailto:hello@earnhire.com'}
              >
                <Mail className="mr-2 h-5 w-5" />
                Get in Touch
              </Button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}