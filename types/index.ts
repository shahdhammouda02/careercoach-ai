export interface CVAnalysis {
  extractedSkills: string[];
  experienceYears: number;
  educationLevel: string;
  gaps: string[];
  strengths: string[];
  matchScore: number;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer: string;
}

export interface RoadmapWeek {
  week: number;
  focus: string;
  topics: string[];
  resources: {
    title: string;
    url: string;
    type: "video" | "article" | "course";
  }[];
}

export interface AnalysisResult {
  agentSteps: string[];
  cvAnalysis: CVAnalysis;
  interviewQuestions: InterviewQuestion[];
  roadmap: RoadmapWeek[];
}