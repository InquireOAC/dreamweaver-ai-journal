
export type DreamTag = {
  id: string;
  name: string;
  color: string;
};

export type DreamEntry = {
  id: string;
  date: string; // ISO string
  title: string;
  content: string;
  tags: string[]; // Array of tag IDs
  mood?: string;
  lucid: boolean;
  imagePrompt?: string;
  generatedImage?: string;
  analysis?: string;
  is_public?: boolean; // Whether dream is shared to Lucid Repo
  isPublic?: boolean; // Legacy field - keeping for backward compatibility
  likeCount?: number; // Number of likes
  like_count?: number; // Supabase field name
  commentCount?: number; // Number of comments
  comment_count?: number; // Supabase field name
};

export type DreamStore = {
  entries: DreamEntry[];
  tags: DreamTag[];
};

export type SocialLinks = {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
};
