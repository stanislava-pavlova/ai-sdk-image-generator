import { useState, useRef } from "react";
import { FileUpload, TextSegmentData, StoryConfigData } from "@/lib/prompt-types";
import { segmentBulgarianText } from "@/lib/text-segmentation";

export function usePromptManager() {
  // JSON story config
  const [storyConfigFile, setStoryConfigFile] = useState<FileUpload | null>(null);
  const [storyConfigData, setStoryConfigData] = useState<StoryConfigData | null>(null);

  // Bulgarian text segmentation state
  const [textFile, setTextFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [segmentData, setSegmentData] = useState<TextSegmentData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const storyConfigFileRef = useRef<HTMLInputElement>(null);
  const textFileRef = useRef<HTMLInputElement>(null);

  const handleStoryConfigFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const jsonData = JSON.parse(content) as StoryConfigData;

      setStoryConfigData(jsonData);
      setStoryConfigFile({
        content,
        filename: file.name,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error reading JSON file";
      alert(`Failed to parse story config: ${errorMessage}`);
      console.error("Story config file reading error:", error);
    }
  };

  const removeStoryConfigFile = () => {
    setStoryConfigFile(null);
    setStoryConfigData(null);
    if (storyConfigFileRef.current) {
      storyConfigFileRef.current.value = "";
    }
  };

  // Bulgarian text file handlers
  const handleTextFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Please select a .txt file");
      return;
    }

    setError(null);
    setTextFile(file);

    try {
      const content = await readFileContent(file);
      setTextContent(content);
    } catch (err) {
      setError("Failed to read file content");
      console.error("File reading error:", err);
    }
  };

  const removeTextFile = () => {
    setTextFile(null);
    setTextContent("");
    setSegmentData(null);
    setError(null);

    if (textFileRef.current) {
      textFileRef.current.value = "";
    }
  };

  const processTextSegmentation = async () => {
    if (!textContent.trim()) {
      setError("No text content to process");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Segment the Bulgarian text
      const segments = segmentBulgarianText(textContent, 25, 25);

      if (segments.length === 0) {
        setError("No segments could be extracted from the text");
        setIsProcessing(false);
        return;
      }

      const segmentData: TextSegmentData = {
        originalText: textContent,
        segments: segments.map((segment) => ({
          selectedSentence: segment.selectedSentence,
          windowIndex: segment.windowIndex,
          wordCount: segment.windowWords.length,
        })),
        totalSegments: segments.length,
      };

      setSegmentData(segmentData);
    } catch (err) {
      setError("Failed to process text segmentation");
      console.error("Segmentation error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content || "");
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file, "utf-8");
    });
  };

  return {
    // Story config state
    storyConfigFile,
    storyConfigData,

    // Bulgarian text state
    textFile,
    textContent,
    segmentData,
    isProcessing,
    error,

    // Refs
    storyConfigFileRef,
    textFileRef,

    // Handlers
    handleStoryConfigFileChange,
    removeStoryConfigFile,
    handleTextFileChange,
    removeTextFile,
    processTextSegmentation,

    // Getters for accessing data
    getStoryConfigData: () => storyConfigData,
  };
}
