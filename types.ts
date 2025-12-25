
export enum Tab {
  LANDING = 'LANDING',
  PRESENTATION_STUDIO = 'PRESENTATION_STUDIO',
  SPEECH_INTELLIGENCE = 'SPEECH_INTELLIGENCE',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  VIDEO_GALLERY = 'VIDEO_GALLERY',
  CALENDAR = 'CALENDAR',
  PLUGIN_HUB = 'PLUGIN_HUB',
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface NotebookGuide {
  summary: string;
  faqs: { question: string; answer: string }[];
  keyTerms: { term: string; definition: string }[];
  studyGuide: string;
}

export interface GeneratedVideo {
  id: string;
  title: string;
  prompt: string;
  uri: string;
  timestamp: number;
  type: 'AI_GENERATED' | 'YOUTUBE';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: string[];
}

export interface AudioState {
  isRecording: boolean;
  audioBlob: Blob | null;
  transcript: string;
  translation: string;
  summary: string;
}

export interface VideoResult {
  id?: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  type?: 'AI_GENERATED' | 'YOUTUBE';
}

export interface PresentationSlide {
  title: string;
  bullets: string[];
  speakerNotes: string;
  footer?: string;
  visual?: string;
}

export interface PresentationDeck {
  topic: string;
  slides: PresentationSlide[];
  source: 'WEB' | 'KB';
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  installed: boolean;
  requiresApiKey: boolean;
}

export interface PresentationOptions {
  date?: Date;
  location?: string;
}
