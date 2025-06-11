import { JobCard } from './job-card';
import { Job } from '@/lib/jobs';

const previewJobs: Job[] = [
  {
    id: "1",
    company: "TechVision Labs",
    title: "Senior Full Stack Developer",
    location: "Remote (Worldwide)",
    salary: "150,000",
    currency: "USD",
    fitLevel: "high" as const,
    fitPercentage: 95,
    hoursToApply: 48,
    hasCryptoRewards: true,
    rewardAmount: "0.25",
    rewardCurrency: "MATIC",
    description: "Join our innovative team building next-generation AI-powered development tools. Looking for an experienced developer with strong React and Node.js expertise.",
    url: "#"
  },
  {
    id: "2",
    company: "GreenEarth Solutions",
    title: "Sustainability Consultant",
    location: "Hybrid (Major Cities)",
    salary: "120,000",
    currency: "USD",
    fitLevel: "warm" as const,
    fitPercentage: 85,
    hoursToApply: 72,
    hasCryptoRewards: true,
    rewardAmount: "0.25",
    rewardCurrency: "MATIC",
    description: "Help organizations implement sustainable practices and reduce their environmental impact. Seeking professionals with environmental science background.",
    url: "#"
  },
  {
    id: "3",
    company: "HealthTech Innovations",
    title: "Machine Learning Engineer",
    location: "Remote (US/EU)",
    salary: "180,000",
    currency: "USD",
    fitLevel: "stretch" as const,
    fitPercentage: 70,
    hoursToApply: 24,
    hasCryptoRewards: true,
    rewardAmount: "0.25",
    rewardCurrency: "MATIC",
    description: "Develop cutting-edge ML models for healthcare applications. Experience with PyTorch and healthcare data analysis required.",
    url: "#"
  }
];

export function JobCardPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
      {previewJobs.map(job => (
        <JobCard key={job.id} job={job} preview={true} />
      ))}
    </div>
  );
}