
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PresentationSlide, PresentationOptions, NotebookGuide } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const parseJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (inner) { }
    }
    const firstOpenBrace = text.indexOf('{');
    const lastCloseBrace = text.lastIndexOf('}');
    if (firstOpenBrace !== -1 && lastCloseBrace !== -1) {
       try {
         return JSON.parse(text.substring(firstOpenBrace, lastCloseBrace + 1));
       } catch (inner) { }
    }
    throw e;
  }
};

const SLIDE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'The title of the slide.' },
    bullets: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: 'A list of 3-5 key points for the slide.'
    },
    speakerNotes: { type: Type.STRING, description: 'Detailed notes for the presenter.' },
    footer: { type: Type.STRING, description: 'Contextual footer text.' }
  },
  required: ['title', 'bullets', 'speakerNotes']
};

export const runDirectSearch = async (query: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: query,
    config: { tools: [{ googleSearch: {} }] },
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const runMapsQuery = async (query: string, location?: { lat: number, lng: number }) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: { 
      tools: [{ googleMaps: {} }],
      toolConfig: location ? {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      } : undefined
    },
  });
  return {
    text: response.text,
    places: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const executePythonCode = async (code: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Execute this Python code and provide the output/result. If it's mathematical, show steps.
    
    CODE:
    ${code}`,
    config: { 
      systemInstruction: "You are a Python execution environment and math tutor. Provide the exact output of the code provided."
    }
  });
  return response.text;
};

export const generateNotebookGuide = async (docs: { title: string; content: string }[]): Promise<NotebookGuide> => {
  const ai = getClient();
  const context = docs.map(d => `SOURCE: ${d.title}\nCONTENT: ${d.content}`).join('\n---\n');
  const prompt = `Based on these sources, generate a Notebook Guide. Include a 2-paragraph summary, 5 FAQs, 5 key terms, and a comprehensive study guide. Return ONLY JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt + "\n\nCONTEXT:\n" + context,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          faqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ['question', 'answer']
            }
          },
          keyTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING }
              },
              required: ['term', 'definition']
            }
          },
          studyGuide: { type: Type.STRING }
        },
        required: ['summary', 'faqs', 'keyTerms', 'studyGuide']
      }
    }
  });
  return parseJSON(response.text || "{}");
};

export const chatWithNotebook = async (query: string, docs: { title: string; content: string }[], history: any[] = []): Promise<{ text: string; sources: string[] }> => {
  const ai = getClient();
  const context = docs.map(d => `SOURCE: ${d.title}\nCONTENT: ${d.content}`).join('\n---\n');
  const prompt = `You are a research assistant. Answer the user query using ONLY the provided context. If the information is not present, say so. ALWAYS cite the source titles in brackets like [Source Title].
  
  CONTEXT:
  ${context}
  
  QUERY: ${query}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });

  const text = response.text || "I couldn't find information about that in your notebook.";
  const citedSources = docs.filter(d => text.includes(`[${d.title}]`)).map(d => d.title);

  return { text, sources: citedSources };
};

export const generateAudioOverview = async (docs: { title: string; content: string }[]): Promise<string> => {
  const ai = getClient();
  const context = docs.map(d => `SOURCE: ${d.title}\nCONTENT: ${d.content}`).join('\n---\n');
  
  const conversationPrompt = `Create a lively, deep-dive educational podcast conversation between Joe and Jane about these documents.
  Joe is energetic and asks great questions. Jane is an expert and explains things clearly.
  Focus on the most interesting insights from the sources.
  
  Joe: How's it going today Jane?
  Jane: Great! I've been looking at these documents and...
  
  SOURCES:
  ${context}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: conversationPrompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
          ]
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed");
  return base64Audio;
};

export const generateEducationalVideo = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const educationalPrompt = `An educational visualization for: ${prompt}.`;
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: educationalPrompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Translate to ${targetLanguage}: "${text}"`,
  });
  return response.text || text;
};

export const searchVideos = async (query: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Educational YouTube videos for: "${query}"`,
    config: { tools: [{ googleSearch: {} }] },
  });
  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType: mimeType } },
        { text: "Transcribe this educational recording." },
      ],
    },
  });
  return response.text || "";
};

export const processSpeechIntelligence = async (transcript: string, knowledgeBase: string[], plugins: string[]): Promise<any> => {
  const ai = getClient();
  const activePlugins = plugins || [];
  const useGoogleSearch = activePlugins.includes('google-search');
  
  const prompt = `Perform a Deep Research analysis on the following transcript: "${transcript}".
  
  TASKS:
  1. Translate the transcript into high-quality scholarly English.
  2. Synthesize a "Deep Research" hybrid summary. Use both the provided Knowledge Base context and real-time information from the web to verify facts and expand on concepts.
  3. The summary should be authoritative, detailed, and structured for research purposes.
  4. Determine if external web grounding was used.

  KNOWLEDGE BASE CONTEXT:
  ${knowledgeBase.length > 0 ? knowledgeBase.join('\n---\n') : "No personal documents provided."}

  Return ONLY a JSON object.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING },
          summary: { type: Type.STRING },
          ragUsed: { type: Type.BOOLEAN }
        },
        required: ['translation', 'summary', 'ragUsed']
      },
      tools: useGoogleSearch ? [{ googleSearch: {} }] : undefined,
      thinkingConfig: { thinkingBudget: 16000 }
    }
  });

  return parseJSON(response.text || "{}");
};

export const generatePresentation = async (topic: string, kb: string[], options: any, plugins: string[] = []): Promise<any> => {
  const ai = getClient();
  const context = kb.join('\n---\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a presentation about ${topic}. Context/Location: ${options?.location || 'General'}. 
    Knowledge Base Context:
    ${context}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: SLIDE_SCHEMA
      },
      tools: plugins.includes('google-search') ? [{ googleSearch: {} }] : undefined
    }
  });
  return parseJSON(response.text || "[]");
};

export const expandPresentation = async (topic: string, slides: any[], kb: string[], plugins: string[] = []): Promise<any> => {
  const ai = getClient();
  const context = kb.join('\n---\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Expand the following presentation deck about ${topic}. Add 3 more unique slides. Current slides: ${JSON.stringify(slides)}. 
    Knowledge Base Context:
    ${context}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: SLIDE_SCHEMA
      },
      tools: plugins.includes('google-search') ? [{ googleSearch: {} }] : undefined
    }
  });
  return parseJSON(response.text || "[]");
};

export const generateSlideVisual = async (title: string, bullets: string[] = []): Promise<string> => {
  const ai = getClient();
  const highlights = Array.isArray(bullets) ? bullets.join(', ') : 'educational visualization';
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `Infographic for ${title}. Highlights: ${highlights}`,
  });
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return "";
};

export const editImage = async (base64: string, prompt: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64, mimeType: 'image/png' } }, { text: prompt }] },
  });
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return "";
};
