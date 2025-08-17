import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
