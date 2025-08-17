import { NextRequest, NextResponse } from "next/server";
import { ImageModel, experimental_generateImage as generateImage } from "ai";
// import { openai } from "@ai-sdk/openai";
// import { fireworks } from "@ai-sdk/fireworks";
// import { replicate } from "@ai-sdk/replicate";
import { vertex } from "@ai-sdk/google-vertex/edge";
import { ProviderKey } from "@/lib/provider-config";
import {
  GenerateImageRequest,
  GenerateSegmentedImagesRequest,
} from "@/lib/api-types";
import { generatePrompt } from "@/lib/prompt-helpers";

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
  // fireworks: {
  //   createImageModel: fireworks.image,
  //   dimensionFormat: "aspectRatio",
  // },
  // replicate: {
  //   createImageModel: replicate.image,
  //   dimensionFormat: "size",
  // },
  vertex: {
    createImageModel: vertex.image,
    dimensionFormat: "aspectRatio",
  },
};

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMillis)
    ),
  ]);
};

interface SegmentedImageResult {
  segmentIndex: number;
  image?: string;
  error?: string;
  prompt: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("Received request body:", JSON.stringify(body));

  // Normalize request to always use segments format
  let segments: string[];
  let provider: ProviderKey;
  let modelId: string;
  let characterData: any = null;
  let contextData: any = null;
  let forceSegmentedResponse = false;

  if ("segments" in body) {
    // Segmented request
    ({ segments, provider, modelId, characterData, contextData } = body);
    forceSegmentedResponse = true; // Always return segmented format for editing
  } else {
    // Single prompt request - convert to segments format
    const { prompt, provider: p, modelId: m } = body as GenerateImageRequest;
    segments = [prompt];
    provider = p;
    modelId = m;
  }

  return handleImageGeneration({
    segments,
    provider,
    modelId,
    characterData,
    contextData,
  }, forceSegmentedResponse);
}

async function handleImageGeneration({
  segments,
  provider,
  modelId,
  characterData,
  contextData,
}: GenerateSegmentedImagesRequest, forceSegmentedResponse: boolean = false) {
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
    const startTime = performance.now();

    try {
      // Generate prompt for this segment using character and context data
      const prompt = generatePrompt(characterData, contextData, segment);

      const generatePromise = generateImage({
        model: config.createImageModel(modelId),
        prompt,
        ...(config.dimensionFormat === "size"
          ? { size: DEFAULT_IMAGE_SIZE }
          : { aspectRatio: DEFAULT_ASPECT_RATIO }),
        seed: Math.floor(Math.random() * 1000000),
        // Vertex AI only accepts a specified seed if watermark is disabled.
        providerOptions: { vertex: { addWatermark: false } },
      }).then(({ image, warnings }) => {
        if (warnings?.length > 0) {
          console.warn(`Warnings for image ${i}: `, warnings);
        }

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        console.log(
          `Completed image ${i + 1}/${segments.length} [elapsed=${elapsed}s]`
        );

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
        error: "Failed to generate image for this segment",
        prompt: generatePrompt(characterData, contextData, segment),
      });
    }
  }

  const successCount = results.filter((r) => r.image).length;
  console.log(
    `Completed image generation [success=${successCount}/${segments.length}]`
  );

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
