export type ProviderKey = "vertex";
export type ModelMode = "performance" | "quality";

export const PROVIDERS: Record<
  ProviderKey,
  {
    displayName: string;
    iconPath: string;
    color: string;
    models: string[];
  }
> = {
  vertex: {
    displayName: "Vertex AI",
    iconPath: "/provider-icons/vertex.svg",
    color: "from-green-500 to-emerald-500",
    models: ["imagen-3.0-generate-001", "imagen-3.0-fast-generate-001"],
  },
  // openai: {
  //   displayName: "OpenAI",
  //   iconPath: "/provider-icons/openai.svg",
  //   color: "from-blue-500 to-cyan-500",
  //   models: ["dall-e-2", "dall-e-3"],
  // },
};

export const MODEL_CONFIGS: Record<ModelMode, Record<ProviderKey, string>> = {
  performance: {
    vertex: "imagen-3.0-fast-generate-001",
    // openai: "dall-e-2",
  },
  quality: {
    vertex: "imagen-3.0-generate-001",
    // openai: "dall-e-3",
  },
};

export const PROVIDER_ORDER: ProviderKey[] = [
  "vertex",
  // "openai",
];

export const initializeProviderRecord = <T>(defaultValue?: T) =>
  Object.fromEntries(
    PROVIDER_ORDER.map((key) => [key, defaultValue])
  ) as Record<ProviderKey, T>;
