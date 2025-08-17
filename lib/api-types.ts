import { ProviderKey } from "./provider-config";

export interface GenerateImageRequest {
  prompt: string;
  provider: ProviderKey;
  modelId: string;
}

export interface GenerateSegmentedImagesRequest {
  segments: string[];
  provider: ProviderKey;
  modelId: string;
  storyConfigData?: any;
}

export interface GenerateImageResponse {
  image?: string;
  error?: string;
}
