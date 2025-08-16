export interface FileUpload {
  content: string;
  filename: string;
}

export interface TextSegmentData {
  originalText: string;
  segments: {
    selectedSentence: string;
    windowIndex: number;
    wordCount: number;
  }[];
  totalSegments: number;
}

export interface CharacterData {
  name?: string;
  age?: number;
  ethnicity?: string;
  occupation?: string;
  style?: string;
  clothing?: string;
  accessories?: string;
  pose?: string;
  facial_expression?: string;
  eyes?: string;
  hair?: string;
  [key: string]: any;
}

export interface ContextData {
  mood?: string;
  environment?: string;
  time_of_day?: string;
  emotion?: string;
  location?: string;
  season?: string;
  weather?: string;
  lighting?: string;
  perspective?: string;
  color_palette?: string;
  [key: string]: any;
}

export interface PromptTemplate {
  character: CharacterData | null;
  context: ContextData | null;
  segmentText: string;
}
