
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
  isPublic?: boolean; // Whether dream is shared to Lucid Repo
  likeCount?: number; // Number of likes
  commentCount?: number; // Number of comments
};

export type DreamStore = {
  entries: DreamEntry[];
  tags: DreamTag[];
};
