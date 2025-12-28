
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async getSearchSuggestions(query: string) {
    if (!query) return [];
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the search query "${query}", suggest 5 relevant educational topics or course titles related to software, design, or business. Return as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Gemini Search Suggestion Error:", error);
      return [];
    }
  },

  async analyzeCourseContent(courseTitle: string, description: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this course content: 
        Title: ${courseTitle}
        Description: ${description}
        
        Provide:
        1. A 1-sentence catchy hook.
        2. 3 key learning outcomes.
        3. 5 suggested tags for SEO.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook: { type: Type.STRING },
              outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["hook", "outcomes", "tags"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Content Analysis Error:", error);
      return null;
    }
  },

  async askTutor(context: string, question: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert educational tutor. Based on this video content description: "${context}", answer the following student question: "${question}". Keep it helpful, concise, and professional.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Tutor Error:", error);
      return "I'm sorry, I couldn't process that question right now.";
    }
  }
};
