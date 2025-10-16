import { GoogleGenAI, Type } from "@google/genai";
import { Book, Chapter } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOutline = async (topic: string, style: string, numChapters: number): Promise<Omit<Chapter, 'id' | 'content'>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a comprehensive book outline for the topic: "${topic}".
      The desired writing style is "${style}".
      The outline should be an array of exactly ${numChapters} chapters. Each chapter must have a 'title' and a brief 'description'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'The title of the chapter.',
              },
              description: {
                type: Type.STRING,
                description: 'A brief description of the chapter content.',
              },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed as Omit<Chapter, 'id' | 'content'>[];
  } catch (error) {
    console.error("Error generating outline:", error);
    throw new Error("Failed to generate book outline.");
  }
};

export const generateChapterContent = async (book: Pick<Book, 'title' | 'subtitle' | 'author' | 'chapters'>, chapterToGenerate: Chapter): Promise<string> => {
  const allChapterTitles = book.chapters.map((c, i) => `${i + 1}. ${c.title}: ${c.description}`).join('\n');
  
  const prompt = `You are an expert author writing a book titled "${book.title}" by ${book.author || 'the author'}.
  The book's overall description is: "${book.subtitle}".

  You are currently writing the chapter: "${chapterToGenerate.title}".
  The description for this chapter is: "${chapterToGenerate.description}".

  Here is the full outline of the book for context:
  ${allChapterTitles}

  Please write the full content for the chapter "${chapterToGenerate.title}". The content should be detailed, engaging, and align with the chapter's description and its place in the overall book structure. Ensure the tone is consistent with the rest of the book.
  
  The content should be well-structured and written in clear, compelling language. Use Markdown for formatting (e.g., headings, lists, bold text). The chapter should be at least 700 words.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Using a more powerful model for better content
      contents: prompt,
    });
    // FIX: response.text can be undefined, provide a fallback.
    return response.text || '';
  } catch (error) {
    console.error("Error generating chapter content:", error);
    throw new Error("Failed to generate chapter content.");
  }
};