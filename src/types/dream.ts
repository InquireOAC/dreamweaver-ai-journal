
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
};

export type DreamStore = {
  entries: DreamEntry[];
  tags: DreamTag[];
};
