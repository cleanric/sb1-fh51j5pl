import OpenAI from 'openai';
import { Job } from './jobs';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface JobAnalysis {
  fitLevel: 'high' | 'warm' | 'stretch';
  fitPercentage: number;
  insights: {
    fitAnalysis: string;
    resumeTip: string;
    linkedinStrategy: string;
    coverLetterHook: string;
  };
}

interface GreaterStrategy {
  overview: string;
  companyInsights: string;
  applicationStrategy: string;
  interviewPrep: string;
  negotiationTips: string;
  longTermStrategy: string;
}

export async function analyzeJobs(resumeText: string, jobs: Job[]): Promise<JobAnalysis[]> {
  const compactResume = resumeText.slice(0, 1000);
  const jobSummaries = jobs.map((job, i) => 
    `${i + 1}. ${job.title} at ${job.company}: ${job.description.slice(0, 300).replace(/\n/g, ' ')}`
  ).join('\n');

  const prompt = `Analyze the fit between this resume and each job. For each job, provide insights using second-person pronouns (you, your) to directly address the candidate:

1. Fit level (exactly one of: "high", "warm", or "stretch")
2. Fit percentage (number between 0-100)
3. Brief fit analysis that explains how your background aligns with the role
4. One specific resume tip focused on your relevant experience
5. A comprehensive LinkedIn networking strategy that describes who to connect with, key initiatives to mention, how to engage with content, and which departments to focus on - all in a single, flowing paragraph. If the role would benefit from a pitch deck or visual aid, include specific advice on when and how to use it effectively.
6. One cover letter opening hook highlighting your relevant achievements

Resume:
"""
${compactResume}
"""

Jobs:
${jobSummaries}

Respond in JSON format like this for each job:
{
  "analyses": [
    {
      "fitLevel": "high",
      "fitPercentage": 95,
      "insights": {
        "fitAnalysis": "Your background strongly aligns with...",
        "resumeTip": "Highlight your experience with...",
        "linkedinStrategy": "Connect with the Head of Engineering and Senior Product Managers in the AI team. Reference their recent announcement about expanding the machine learning division in your connection requests. Engage regularly with their posts about technical architecture and AI ethics, adding thoughtful comments to build visibility. Focus your networking efforts on the Engineering and AI Research departments. Consider creating a brief pitch deck showcasing your key projects and sharing it after establishing initial contact.",
        "coverLetterHook": "With your track record of..."
      }
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.analyses;
  } catch (error) {
    console.error('Error analyzing jobs:', error);
    throw error;
  }
}

export async function generateAnalysisStatement(resumeText: string, jobs: Job[]): Promise<string> {
  const compactResume = resumeText.slice(0, 1000);
  const jobSummaries = jobs.map((job, i) => 
    `${i + 1}. ${job.title} at ${job.company}: ${job.description.slice(0, 300).replace(/\n/g, ' ')}`
  ).join('\n');

  const prompt = `As an AI career coach, create a concise, encouraging statement (max 30 words) about the best job fit opportunity for this candidate. Use second-person pronouns (you, your).

Resume:
"""
${compactResume}
"""

Top Jobs:
${jobSummaries}

Respond with ONLY the statement, no additional text or formatting.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 60
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error generating analysis statement:', error);
    throw error;
  }
}

export async function generateGreaterStrategy(resumeText: string, job: Job): Promise<GreaterStrategy> {
  const compactResume = resumeText.slice(0, 1000);
  
  const prompt = `Create a personalized career strategy for this job application. Use second-person pronouns (you, your) throughout to directly address the candidate. Include:

1. Overview of your fit and potential for this role
2. Insights about the company culture and how you can align with their values
3. Strategy to optimize your application materials, including when and how to use visual aids or pitch decks:
   - For creative/design roles: Portfolio presentation strategies
   - For business/sales roles: When to use solution pitch decks
   - For technical roles: Project showcase formats
   - Guidelines on timing (initial application vs. follow-up)
   - Best practices for delivery and format
4. Approach to prepare for your interviews, including visual presentation tips if relevant
5. Tips for your salary negotiation
6. Plan for your long-term career growth in this direction

Resume:
"""
${compactResume}
"""

Job:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Respond in JSON format:
{
  "overview": "Based on your background...",
  "companyInsights": "The company values... You can demonstrate alignment by...",
  "applicationStrategy": "To optimize your application... [Include specific guidance about visual materials if appropriate for this role]",
  "interviewPrep": "To prepare for your interviews...",
  "negotiationTips": "During your salary negotiation...",
  "longTermStrategy": "To grow your career in this direction..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating greater strategy:', error);
    throw error;
  }
}