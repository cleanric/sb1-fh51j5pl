import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/search-bar";
import { JobCardPreview } from "@/components/job-card-preview";
import { JobCardGrid } from "@/components/job-card-grid";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Job } from "@/lib/jobs";
import { Sparkles, Target, Coins, Users } from "lucide-react";

export default function EarnHireLandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  
  const handleSearch = async (resumeText?: string) => {
    navigate("/search", {
      state: {
        query,
        location,
        resumeText
      }
    });
  };

  const handleJobUpdate = (updatedJob: Job) => {
    console.log('Job updated:', updatedJob);
  };
  
  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] font-sans text-[#2C2C2C] flex flex-col">
      <Header />
      
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="w-full px-4 sm:px-6 pt-8 sm:pt-12 pb-24 sm:pb-32 text-center space-y-6 sm:space-y-8 relative bg-gradient-to-b from-[#F8F8F8] to-[#F0F9FF]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Smarter Job Search. Expert Insights.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#444] max-w-2xl mx-auto mt-4 sm:mt-6 px-4 sm:px-0">
              Earn Hire makes job searching smarter. Add your resume to reveal exclusive career insights and LinkedIn strategies.
            </p>
          </div>
          
          <SearchBar 
            query={query}
            setQuery={setQuery}
            location={location}
            setLocation={setLocation}
            onSearch={handleSearch}
          />
        </section>

        {/* Job Cards Preview */}
        <section className="-mt-16 sm:-mt-24 px-4 sm:px-6 w-full relative bg-gradient-to-b from-[#F0F9FF] to-white">
          <div className="max-w-[2000px] mx-auto">
            <JobCardPreview />
          </div>
        </section>
        
        {/* Features Grid */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-[2000px] mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-8 sm:mb-12 text-center">Why Job Seekers Choose Us</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#E0F7FA] to-white">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-[#00BFFF]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">AI-Powered Matches</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our advanced AI analyzes your skills and experience to find the perfect opportunities that match your career goals.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#E8F5E9] to-white">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-[#2E7D32]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Smart Insights</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Get personalized tips for your resume, LinkedIn profile, and interview preparation tailored to each opportunity.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#FFF8E1] to-white sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-[#FF8F00]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Earn Rewards</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Turn your job search into rewards. Earn crypto tokens for engaging with opportunities and improving your profile.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recently Posted Jobs */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 bg-[#F0F9FF]">
          <div className="max-w-[2000px] mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Recently Posted Jobs</h2>
            <JobCardGrid onInsightsUpdate={handleJobUpdate} />
          </div>
        </section>
        
        {/* Success Stories */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 bg-[#F8F8F8]">
          <div className="max-w-[2000px] mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-8 sm:mb-12 text-center">Success Stories</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#E0F7FA] rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#00838F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah M.</h3>
                    <p className="text-sm text-gray-500">Software Engineer</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  "The AI insights helped me tailor my resume perfectly. Landed my dream role at a top tech company within 2 weeks!"
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#2E7D32]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">James R.</h3>
                    <p className="text-sm text-gray-500">Product Manager</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  "The personalized LinkedIn strategies were game-changing. Made valuable connections that led to multiple offers."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#FFF8E1] rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#FF8F00]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Elena K.</h3>
                    <p className="text-sm text-gray-500">Data Scientist</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  "Earned rewards while job hunting was a brilliant bonus. The platform's insights helped me negotiate a 25% higher salary!"
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#E3F2FD] rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#1565C0]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Zain O.</h3>
                    <p className="text-sm text-gray-500">IT Support</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  "Earn Hire is the most fun job board I've ever used. Thanks for revolutionizing the job search space!"
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white">
          <div className="max-w-[2000px] mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Transform Your Career Journey Today</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've found their perfect career match while earning rewards.
            </p>
            <button 
              onClick={() => handleSearch()}
              className="px-6 sm:px-8 py-3 bg-white text-[#00BFFF] rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow duration-300 touch-manipulation"
            >
              Start Your Journey
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}