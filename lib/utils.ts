import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StoryConfigData } from "./prompt-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadImage(imageData: string, index: number, prefix = "segment") {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${imageData}`;
  link.download = `${prefix}-${index + 1}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getAgeForSegment(segmentIndex: number, storyConfigData: StoryConfigData | null) {
  if (!storyConfigData?.identity_core?.age_progression?.enabled) {
    return null;
  }

  const milestones = storyConfigData.identity_core.age_progression.milestones;
  for (const range in milestones) {
    const milestone = milestones[range];

    if (range.includes("+")) {
      const minSegment = parseInt(range.replace("+", ""));
      if (segmentIndex >= minSegment) {
        return { age: milestone.age, range };
      }
    } else if (range.includes("-")) {
      const [min, max] = range.split("-").map((n) => parseInt(n));
      if (segmentIndex >= min && segmentIndex <= max) {
        return { age: milestone.age, range };
      }
    }
  }
  return { age: storyConfigData.identity_core.base_age, range: "base" };
}
