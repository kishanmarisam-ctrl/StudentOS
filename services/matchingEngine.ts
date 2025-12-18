import { Job, UserProfile, MatchResult, StudentBackground } from '../types';

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

/**
 * Deterministic calculation of job suitability.
 * Logic: Skill(40%), Degree(25%), Proximity(20%), Salary(15%)
 */
export const evaluateJob = (job: Job, profile: UserProfile): MatchResult | null => {
  let skillScore = 0;
  let locationScore = 0;
  let salaryScore = 0;
  let degreeScore = 0;
  let distanceKm = 0;

  // 1. Proximity Filter & Score (20%)
  if (job.isRemote) {
    distanceKm = 0;
    locationScore = 100;
  } else if (profile.lat && profile.lng) {
    distanceKm = parseFloat(getDistanceFromLatLonInKm(profile.lat, profile.lng, job.lat, job.lng).toFixed(1));
    job.distanceKm = distanceKm;
    
    if (distanceKm > profile.radiusKm) {
      return null; // Silent rejection if outside requested radius
    }
    locationScore = Math.max(0, 100 - ((distanceKm / profile.radiusKm) * 100)); 
  }

  // 2. Degree Relevance (25%)
  if (profile.background === job.category) {
    degreeScore = 100;
  } else if (profile.background === StudentBackground.OTHER || job.category === StudentBackground.OTHER) {
    degreeScore = 50; // Partial relevance for generalist roles
  } else {
    degreeScore = 0;
  }

  // 3. Skill Overlap (40%)
  const userSkillsLower = profile.skills.map(s => s.toLowerCase().trim());
  const jobSkillsLower = job.requiredSkills.map(s => s.toLowerCase().trim());
  
  const matchingSkills = jobSkillsLower.filter(s => userSkillsLower.includes(s));
  const missingSkills = job.requiredSkills.filter(s => !userSkillsLower.includes(s.toLowerCase().trim()));
  
  const matchRatio = jobSkillsLower.length > 0 ? matchingSkills.length / jobSkillsLower.length : 0;
  skillScore = Math.min(matchRatio * 100, 100);

  // 4. Salary Fit (15%)
  if (job.salary >= profile.expectedSalary) {
    salaryScore = 100;
  } else {
    const diffPercent = (profile.expectedSalary - job.salary) / profile.expectedSalary;
    salaryScore = Math.max(0, 100 - (diffPercent * 300)); // Steep drop for low salary
  }

  // Weighted Total Calculation
  let totalScore = (
    (skillScore * 0.40) +
    (degreeScore * 0.25) +
    (locationScore * 0.20) +
    (salaryScore * 0.15)
  );

  totalScore = Math.round(Math.min(totalScore, 100));

  // Probability Classification
  let probability: 'High' | 'Medium' | 'Low' = 'Low';
  if (totalScore >= 80) probability = 'High';
  else if (totalScore >= 60) probability = 'Medium';

  return {
    job,
    score: totalScore,
    breakdown: { skillScore, locationScore, salaryScore, experienceScore: degreeScore }, // Map degree to experience for type compatibility
    probability,
    missingSkills,
    aiAnalysis: "Preparing OS context..."
  };
};