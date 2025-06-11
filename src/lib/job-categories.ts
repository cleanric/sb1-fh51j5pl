import { Code, Database, Headphones as HeadphonesMic, DollarSign, Calculator, Users, Building2, Cloud, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface JobCategory {
  name: string;
  icon: LucideIcon;
  searchQuery: string;
}

export const jobCategories: JobCategory[] = [
  {
    name: "Software & AI Engineering",
    icon: Code,
    searchQuery: '"Software Engineer" OR "AI Engineer" OR "Machine Learning Engineer" OR "ML Engineer" OR "Frontend Developer" OR "Backend Developer" OR "Fullstack Developer" OR "Software Developer"'
  },
  {
    name: "Data Science & Analytics",
    icon: Database,
    searchQuery: '"Data Scientist" OR "Data Analyst" OR "Business Intelligence" OR "BI Developer" OR "Statistician"'
  },
  {
    name: "Customer Service & Support",
    icon: HeadphonesMic,
    searchQuery: '"Customer Service" OR "Customer Support" OR "Help Desk" OR "Technical Support" OR "Client Relations" OR "Support Specialist"'
  },
  {
    name: "Sales & Marketing",
    icon: DollarSign,
    searchQuery: '"Sales Representative" OR "Account Manager" OR "Business Development" OR "Marketing Specialist" OR "Digital Marketing" OR "Content Marketing" OR "Sales Manager"'
  },
  {
    name: "Finance & Accounting",
    icon: Calculator,
    searchQuery: '"Financial Analyst" OR "Accountant" OR "Auditor" OR "Finance Manager" OR "Controller"'
  },
  {
    name: "Human Resources",
    icon: Users,
    searchQuery: '"Human Resources Manager" OR "HR Generalist" OR "Recruiter" OR "Talent Acquisition" OR "HR Business Partner"'
  },
  {
    name: "Architecture & Construction",
    icon: Building2,
    searchQuery: '"Architect" OR "Civil Engineer" OR "Construction Manager" OR "Structural Engineer" OR "Urban Planner"'
  },
  {
    name: "IT & Cloud Operations",
    icon: Cloud,
    searchQuery: '"IT Support" OR "DevOps" OR "Cloud Engineer" OR "Cloud Computing" OR "System Administrator" OR "Network Engineer"'
  },
  {
    name: "Retail & Hospitality",
    icon: Store,
    searchQuery: '"Retail Manager" OR "Retail Worker" OR "Sales Associate" OR "Store Manager" OR "Hospitality" OR "Hotel Staff" OR "Restaurant Manager" OR "Barista"'
  }
];