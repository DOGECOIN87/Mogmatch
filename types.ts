export interface ProfileStats {
  jawline: number; // 1-10
  canthalTilt: string; // e.g., "Positive", "Neutral", "Prey Eyes"
  mewingStreak: number; // days
  height: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  tagline: string;
  bio: string;
  stats: ProfileStats;
  imageUrl: string;
  isSuperMog?: boolean;
}

export interface AnalysisResult {
  score: number;
  title: string;
  analysis: string;
  improvements: string[];
  breakdown: {
    jawline: number;
    eyes: number;
    skin: number;
    symmetry: number;
    phenotype: string; // e.g., "Warrior Skull", "Alien", "Potato"
  };
}

export enum AppView {
  SWIPE = 'SWIPE',
  RATE = 'RATE',
  CHAT = 'CHAT'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatMatch {
  id: string;
  profile: Profile;
  messages: ChatMessage[];
  lastMessage: string;
  timestamp: number;
}