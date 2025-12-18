
import { GoogleGenAI } from "@google/genai";
import { MatchResult, UserProfile } from '../types';

/**
 * Generates the "Why This Job?" explanation and context.
 */
export const generateAgentAnalysis = async (
  result: MatchResult, 
  profile: UserProfile
): Promise<string> => {
  // Always use the process.env.API_KEY directly during initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are JobRadar India, an AI agent scout for students. 
    Analyze this job match for an Indian student.

    Student Profile:
    - Skills: ${profile.skills.join(', ')}
    - Role Pref: ${profile.roleType}
    - Location: ${profile.city}, ${profile.state} (Radius: ${profile.radiusKm}km)
    - Expected Salary: ₹${profile.expectedSalary}
    - Background: ${profile.background}

    Job Details:
    - Role: ${result.job.title} at ${result.job.company}
    - Skills Required: ${result.job.requiredSkills.join(', ')}
    - Location: ${result.job.location} (${result.job.distanceKm}km away)
    - Salary: ₹${result.job.salary}
    - Description: ${result.job.description}

    Calculated Match Score: ${result.score}/100.
    Probability: ${result.probability}.

    Task:
    Write a SHORT, punchy, agentic explanation (max 2 sentences) starting with "Notified because..." explaining exactly why this is a good fit. 
    Mention specific metrics (distance, salary vs expectation, skill match).
    If there are missing skills (${result.missingSkills.join(', ')}), briefly mention if they are critical or learnable.
    Be encouraging but realistic for the Indian job market.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access .text property directly as it is not a method in the latest SDK
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails
    return `Notified because this role matches ${result.job.requiredSkills.length - result.missingSkills.length} of your skills and is within your location preference in ${profile.city}.`;
  }
};

/**
 * Generates a career direction hint based on aggregate high scoring jobs.
 */
export const generateCareerHint = async (results: MatchResult[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const topJobs = results.filter(r => r.score > 70).slice(0, 3);
    
    if (topJobs.length === 0) return "Keep upskilling to unlock opportunities in the Indian market.";

    const jobTitles = topJobs.map(r => r.job.title).join(', ');
    
    const prompt = `
      Based on these high-matching job titles found for an Indian student: ${jobTitles}.
      Provide a very short (1 sentence) career direction hint tailored to the Indian industry context. 
      Format: "Most matching roles lean toward [Field/Direction]."
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        // Access .text property directly as it is not a method in the latest SDK
        return response.text.trim();
    } catch (error) {
        return "Most matching roles lean toward positions matching your core skill set.";
    }
}
