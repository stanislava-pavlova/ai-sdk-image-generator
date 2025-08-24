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

export interface AgeProgression {
  enabled: boolean;
  milestones: Record<string, {
    age: number;
    description?: string;
  }>;
}

export interface StoryConfigData {
  identity_core: {
    name: string;
    base_age?: number;
    age_progression?: AgeProgression;
    origin?: string;
    domains?: string;
    values?: string;
    hair_general?: string;
    demeanor?: string;
  };
  style_throughline: {
    art_style?: string;
    mood?: string;
    color_palette_base?: string;
  };
  camera_baseline: {
    perspective?: string;
    lens_mm?: number;
    composition?: string;
    depth_of_field?: string;
  };
  global_constraints?: string;
}
