
export enum StudentMode {
  STUDY = 'study',
  CAREER = 'career'
}

export enum LearningStyle {
  VISUAL = 'Visual',
  PRACTICAL = 'Practical/Hands-on',
  THEORETICAL = 'Theoretical/Reading'
}

export enum StudentBackground {
  ENGINEERING = 'Engineering',
  SCIENCE = 'Science',
  COMMERCE = 'Commerce',
  ARTS = 'Arts',
  PHARMA = 'Pharma',
  DIPLOMA = 'Diploma',
  OTHER = 'Other'
}

export enum RoleType {
  INTERN = 'Internship',
  FRESHER = 'Fresher (Full-time)',
  CONTRACT = 'Contract'
}

export enum WorkMode {
  LOCAL = 'Local/On-site',
  REMOTE = 'Remote',
  HYBRID = 'Hybrid'
}

export interface CognitiveProfile {
  learningStyle: LearningStyle;
  focusArea: string;
  strength: string;
}

export interface DailyTask {
  id: string;
  title: string;
  status: 'pending' | 'done' | 'partial' | 'missed';
  duration?: string;
  scheduledDay: 'today' | 'tomorrow';
}

export interface UserProfile {
  name: string;
  onboarded: boolean;
  cognitiveProfile?: CognitiveProfile;
  state: string;
  city: string;
  district: string;
  location?: string;
  lat: number;
  lng: number;
  expectedSalary: number;
  skills: string[];
  radiusKm: number;
  background: StudentBackground;
  roleType: RoleType;
  mode: WorkMode;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  state: string;
  city: string;
  district: string;
  salary: number;
  requiredSkills: string[];
  description: string;
  category: StudentBackground;
  lat: number;
  lng: number;
  applyUrl: string;
  distanceKm?: number;
  isRemote: boolean;
  minExperienceYears: number;
  postedDate: string;
}

export interface MatchResult {
  job: Job;
  score: number;
  breakdown: {
    skillScore: number;
    locationScore: number;
    salaryScore: number;
    experienceScore: number;
  };
  probability: 'High' | 'Medium' | 'Low';
  missingSkills: string[];
  aiAnalysis: string;
  totalEvaluated?: number;
}
