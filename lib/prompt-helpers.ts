import { StoryConfigData } from "./prompt-types";

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

  return `${artStyle} ${perspective} of ${name}${origin ? `, ${origin}` : ''}${domains ? `, working in ${domains}` : ''}, ${hair}, with ${demeanor} demeanor. ${mood} mood with ${colorPalette} color palette. Shot with ${lensInfo}, ${composition}, ${depthOfField}. ${values ? `Embodying values of ${values}. ` : ''}Scene: ${segment}`;
}
