import { ProviderKey } from "./provider-config";

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
  storyConfigData?: any;
  useRawPrompts?: boolean;
  aspectRatio?: AspectRatio;
}

export interface GenerateImageResponse {
  image?: string;
  error?: string;
}
