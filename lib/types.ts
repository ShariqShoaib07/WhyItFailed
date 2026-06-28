// TypeScript Type Definitions for FailLog Database

export interface Profile {
  id: string;
  name: string;
  university: string | null;
  created_at: string;
}

export type FailureCategory = 'Robotics' | 'AI/ML' | 'Web/App' | 'Embedded' | 'Hardware' | 'Other';

export interface Failure {
  id: string;
  user_id: string;
  title: string;
  category: FailureCategory;
  problem: string;
  what_tried: string;
  why_failed: string;
  tags: string[] | null;
  image_url: string | null;
  upvote_count: number;
  created_at: string;
  
  // Joined relation fields (optional helper)
  profiles?: Profile;
}

export interface Upvote {
  id: string;
  failure_id: string;
  user_id: string;
  created_at: string;
}
