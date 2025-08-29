import { NextRequest, NextResponse } from "next/server";
import { ImageModel, experimental_generateImage as generateImage } from "ai";
// import { openai } from "@ai-sdk/openai";
import { vertex } from "@ai-sdk/google-vertex/edge";
import { ProviderKey } from "@/lib/provider-config";
import { GenerateSegmentedImagesRequest, AspectRatio, SegmentedImageResult } from "@/lib/api-types";
import { generatePrompt, generatePromptWithModel } from "@/lib/prompt-helpers";
import { StoryConfigData } from "@/lib/prompt-types";

/**
 * Intended to be slightly less than the maximum execution time allowed by the
 * runtime so that we can gracefully terminate our request.
 */
const TIMEOUT_MILLIS = 55 * 1000;

const DEFAULT_IMAGE_SIZE = "1024x1024";
const DEFAULT_ASPECT_RATIO = "9:16";

interface ProviderConfig {
  createImageModel: (modelId: string) => ImageModel;
  dimensionFormat: "size" | "aspectRatio";
}

const providerConfig: Record<ProviderKey, ProviderConfig> = {
  // openai: {
  //   createImageModel: openai.image,
  //   dimensionFormat: "size",
  // },
  vertex: {
    createImageModel: vertex.image,
    dimensionFormat: "aspectRatio",
  },
};

const withTimeout = <T>(promise: Promise<T>, timeoutMillis: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMillis)
    ),
  ]);
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    segments,
    provider,
    modelId,
    storyConfigData = null,
    useRawPrompts = false,
    originalSegmentIndex,
    aspectRatio = DEFAULT_ASPECT_RATIO,
  } = body as GenerateSegmentedImagesRequest & {
    storyConfigData?: StoryConfigData;
    originalSegmentIndex?: number;
  };

  const forceSegmentedResponse = true; // Always return segmented format

  return handleImageGeneration(
    {
      segments,
      provider,
      modelId,
      storyConfigData,
      useRawPrompts,
      originalSegmentIndex,
      aspectRatio,
    },
    forceSegmentedResponse
  );
}

async function handleImageGeneration(
  {
    segments,
    provider,
    modelId,
    storyConfigData,
    useRawPrompts = false,
    originalSegmentIndex,
    aspectRatio = DEFAULT_ASPECT_RATIO,
  }: {
    segments: string[];
    provider: ProviderKey;
    modelId: string;
    storyConfigData: StoryConfigData | null;
    useRawPrompts?: boolean;
    originalSegmentIndex?: number;
    aspectRatio?: AspectRatio;
  },
  forceSegmentedResponse: boolean = false
) {
  if (
    !Array.isArray(segments) ||
    segments?.length === 0 ||
    !provider ||
    !modelId ||
    !providerConfig[provider]
  ) {
    const error = "Invalid request parameters";
    console.error(`${error}`);
    return NextResponse.json({ error }, { status: 400 });
  }

  const config = providerConfig[provider];
  const results: SegmentedImageResult[] = [];
  const isMultipleSegments = segments.length > 1;

  // Generate images for each segment
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    // Use the original segment index if provided (for single image generation),
    // otherwise use the loop index (for batch generation)
    const segmentIndex = originalSegmentIndex !== undefined ? originalSegmentIndex : i;

    try {
      // Use raw prompt if useRawPrompts flag is set (for manual editing), otherwise generate with AI
      const prompt = useRawPrompts
        ? segment
        : await generatePromptWithModel(storyConfigData, segment, segmentIndex);

      const generatePromise = generateImage({
        model: config.createImageModel(modelId),
        prompt,
        ...(config.dimensionFormat === "size" ? { size: DEFAULT_IMAGE_SIZE } : { aspectRatio }),
        seed: Math.floor(Math.random() * 1000000),
        // Vertex AI only accepts a specified seed if watermark is disabled.
        providerOptions: { vertex: { addWatermark: false } },
      }).then(({ image, warnings }) => {
        if (warnings?.length > 0) {
          console.warn(`Warnings for image ${i}: `, warnings);
        }

        return {
          segmentIndex: i,
          image: image.base64,
          prompt,
        };
      });

      const result = await withTimeout(generatePromise, TIMEOUT_MILLIS);
      results.push(result);
    } catch (error) {
      // Log full error detail on the server, but return a generic error message
      // to avoid leaking any sensitive information to the client.
      console.error(
        `Error generating image ${i} [provider=${provider}, model=${modelId}]: `,
        error
      );
      results.push({
        segmentIndex: i,
        image: null,
        error: "Failed to generate image for this segment",
        prompt: generatePrompt(storyConfigData, segment, segmentIndex),
      });
    }
  }

  const successCount = results.filter((r) => r.image).length;
  console.log(`Completed image generation [success=${successCount}/${segments.length}]`);

  // For single image requests, return the original format for backward compatibility
  // UNLESS forceSegmentedResponse is true (for editing functionality)
  if (!isMultipleSegments && results.length === 1 && !forceSegmentedResponse) {
    const result = results[0];
    if (result.image) {
      return NextResponse.json(
        {
          provider,
          image: result.image,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          error: result.error || "Failed to generate image",
        },
        { status: 500 }
      );
    }
  }

  // For multiple segments, return the segmented format
  return NextResponse.json(
    {
      results,
      totalSegments: segments.length,
      successCount,
      provider,
    },
    { status: 200 }
  );
}
