import { generateText } from "ai";
import { vertex } from "@ai-sdk/google-vertex/edge";
import { StoryConfigData } from "./prompt-types";

const TEXT_PROMPT_MODEL_ID = "gemini-2.0-flash-001";
const TEXT_PROMPT_INSTRUCTION =
  "You are an expert prompt engineer for image generation models (e.g., Imagen, Flux, Vertex). Given a scene description and optional global context, craft a single high-quality and descriptive English prompt for image generation model. Rules: Prioritize the scene content; infer visuals from it. Use rich, evocative language. Describe lighting, atmosphere, and the subject's actions in detail to create a vivid image. Use global context only when it supports the scene; omit irrelevant details. Avoid generic studio backdrops and flat portrait framing unless the scene requires it. Output only the final prompt text, no preamble, no labels, no quotes.";

export function generatePrompt(storyConfig: StoryConfigData | null, segmentText: string): string {
  if (!storyConfig) {
    return segmentText.trim() || "no scene description";
  }

  const { identity_core, style_throughline, camera_baseline } = storyConfig;

  // Character information
  const name = identity_core.name || "unknown character";
  const origin = identity_core.origin || "";
  const domains = identity_core.domains || "";
  const values = identity_core.values || "";
  const hair = identity_core.hair_general || "styled hair";
  const demeanor = identity_core.demeanor || "composed";

  // Visual style
  const artStyle = style_throughline.art_style || "cinematic realism";
  const mood = style_throughline.mood || "determined";
  const colorPalette = style_throughline.color_palette_base || "neutral tones";

  // Camera settings
  const perspective = camera_baseline.perspective || "medium shot";
  const lensInfo = camera_baseline.lens_mm ? `${camera_baseline.lens_mm}mm lens` : "standard lens";
  const composition = camera_baseline.composition || "centered composition";
  const depthOfField = camera_baseline.depth_of_field || "balanced focus";

  const segment = segmentText.trim() || "no scene description";

  return (
    `${artStyle} ${perspective} of ${name}${origin ? `, ${origin}` : ""}, Scene: ${segment}. ` +
    `${hair}, with a ${demeanor} demeanor.${domains ? ` Active in ${domains}.` : ""} ` +
    `${mood} mood with a ${colorPalette} color palette. ` +
    `Shot with a ${lensInfo}, ${composition}, ${depthOfField}. ` +
    `Embodying values of ${values}.`
  );
}

function buildContextLines({
  identity,
  style,
  camera,
  globalConstraints,
}: {
  identity?: StoryConfigData["identity_core"];
  style?: StoryConfigData["style_throughline"];
  camera?: StoryConfigData["camera_baseline"];
  globalConstraints?: string;
}): string[] {
  const contextLines: string[] = [];

  // Character context
  if (identity?.name) contextLines.push(`character: ${identity.name}`);
  if (identity?.origin) contextLines.push(`origin: ${identity.origin}`);
  if (identity?.domains) contextLines.push(`domain: ${identity.domains}`);
  if (identity?.values) contextLines.push(`values: ${identity.values}`);
  if (identity?.hair_general) contextLines.push(`hair: ${identity.hair_general}`);
  if (identity?.demeanor) contextLines.push(`demeanor: ${identity.demeanor}`);

  // Style context
  if (style?.art_style) contextLines.push(`art_style: ${style.art_style}`);
  if (style?.mood) contextLines.push(`mood: ${style.mood}`);
  if (style?.color_palette_base) contextLines.push(`palette: ${style.color_palette_base}`);

  // Camera context
  if (camera?.perspective) contextLines.push(`perspective: ${camera.perspective}`);
  if (camera?.lens_mm) contextLines.push(`lens: ${camera.lens_mm}mm`);
  if (camera?.composition) contextLines.push(`composition: ${camera.composition}`);
  if (camera?.depth_of_field) contextLines.push(`dof: ${camera.depth_of_field}`);

  // Global constraints
  if (globalConstraints?.trim()) contextLines.push(`constraints: ${globalConstraints.trim()}`);

  return contextLines;
}

export async function generatePromptWithModel(
  storyConfigData: StoryConfigData | null,
  segment: string
): Promise<string> {
  const scene = (segment || "").trim();
  const fallback = generatePrompt(storyConfigData, scene);

  try {
    const identity = storyConfigData?.identity_core;
    const style = storyConfigData?.style_throughline;
    const camera = storyConfigData?.camera_baseline;
    const globalConstraints = storyConfigData?.global_constraints;

    const contextLines = buildContextLines({
      identity,
      style,
      camera,
      globalConstraints,
    });

    const contextBlock =
      contextLines.length > 0 ? `Global context:\n- ${contextLines.join("\n- ")}` : "";

    const fullPrompt = `${contextBlock}\nScene: "${scene}"`;

    const { text } = await generateText({
      model: vertex(TEXT_PROMPT_MODEL_ID),
      system: TEXT_PROMPT_INSTRUCTION,
      prompt: fullPrompt,
    });

    const cleaned = (text || "").trim();
    return cleaned || fallback;
  } catch (err) {
    console.warn("Prompt generation with model failed; falling back to formatter:", err);
    return fallback;
  }
}
