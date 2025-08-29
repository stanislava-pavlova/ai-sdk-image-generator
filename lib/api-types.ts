import { ProviderKey } from "./provider-config";
import { StoryConfigData, TextSegmentData } from "./prompt-types";

export interface GenerateImageRequest {
  prompt: string;
  provider: ProviderKey;
  modelId: string;
  aspectRatio?: AspectRatio;
}

export type AspectRatio = "1:1" | "9:16" | "16:9";

export interface GenerateSegmentedImagesRequest {
  segments: string[];
  provider: ProviderKey;
  modelId: string;
  storyConfigData?: StoryConfigData;
  useRawPrompts?: boolean;
  aspectRatio?: AspectRatio;
}

export interface GenerateImageResponse {
  image?: string;
  error?: string;
}

export interface SegmentedImageResult {
  segmentIndex: number;
  image: string | null;
  error?: string;
  prompt: string;
}

export interface SegmentedImagesState {
  results: SegmentedImageResult[];
  totalSegments: number;
  successCount: number;
  provider: ProviderKey;
}

export interface SubmitData {
  segmentData: TextSegmentData;
  storyConfigData: StoryConfigData | null;
}
