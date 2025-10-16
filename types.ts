
export interface Chapter {
  id: string;
  title: string;
  description: string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  coverImage: string | null; // Base64 encoded image
  chapters: Chapter[];
}
