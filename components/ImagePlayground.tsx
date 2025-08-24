"use client";

import { useState, useEffect } from "react";
import { PromptInput } from "@/components/PromptInput";
import { SegmentedImageDisplay } from "@/components/SegmentedImageDisplay";
import { MODEL_CONFIGS, ProviderKey, ModelMode } from "@/lib/provider-config";
import { Header } from "./Header";
import { Card } from "@/components/ui/card";

export function ImagePlayground() {
  const [segmentedImages, setSegmentedImages] = useState<any>(null);
  const [isGeneratingSegments, setIsGeneratingSegments] = useState(false);
  const [originalSegments, setOriginalSegments] = useState<string[]>([]);
  const [storyConfigData, setStoryConfigData] = useState<any>(null);
  const [generatingIndices, setGeneratingIndices] = useState<Set<number>>(new Set());

  // Effect to detect when all images are done generating
  useEffect(() => {
    if (generatingIndices.size === 0 && isGeneratingSegments) {
      setIsGeneratingSegments(false);
    }
  }, [generatingIndices.size, isGeneratingSegments]);

  const [showProviders, setShowProviders] = useState(true);
  const [selectedModels, setSelectedModels] = useState<Record<ProviderKey, string>>(
    MODEL_CONFIGS.performance
  );
  const [mode, setMode] = useState<ModelMode>("performance");
  const toggleView = () => {
    setShowProviders((prev) => !prev);
  };

  const handleModeChange = (newMode: ModelMode) => {
    setMode(newMode);
    setSelectedModels(MODEL_CONFIGS[newMode]);
    setShowProviders(true);
  };

  const generateSingleImage = async (
    segment: string,
    segmentIndex: number,
    totalSegments: number,
    storyConfigOverride?: any
  ): Promise<void> => {
    // Use override data if provided, otherwise fall back to state
    const configData = storyConfigOverride !== undefined ? storyConfigOverride : storyConfigData;

    // If storyConfigOverride is explicitly null, this is a manual edit - use raw prompts
    const useRawPrompts = storyConfigOverride === null;

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segments: [segment],
          provider: "vertex",
          modelId: selectedModels.vertex,
          storyConfigData: configData,
          useRawPrompts,
          originalSegmentIndex: segmentIndex,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image ${segmentIndex + 1}`);
      }

      const result = await response.json();

      // Update the specific image immediately
      if (result.results && result.results[0]) {
        const newImageResult = {
          ...result.results[0],
          segmentIndex: segmentIndex,
        };

        setSegmentedImages((prev: any) => {
          if (!prev) {
            // Initialize with empty results array
            return {
              results: Array(totalSegments)
                .fill(null)
                .map((_, i) => ({
                  segmentIndex: i,
                  image: null,
                  error: null,
                  prompt: originalSegments[i] || "",
                })),
              totalSegments,
              successCount: 0,
              provider: "vertex",
            };
          }

          // Update specific image
          const updatedResults = [...prev.results];
          updatedResults[segmentIndex] = newImageResult;

          return {
            ...prev,
            results: updatedResults,
            successCount: updatedResults.filter((r) => r.image).length,
          };
        });
      }
    } catch (error) {
      console.error(`Error generating image ${segmentIndex + 1}:`, error);

      // Update with error state
      setSegmentedImages((prev: any) => {
        if (!prev) return prev;

        const updatedResults = [...prev.results];
        updatedResults[segmentIndex] = {
          segmentIndex: segmentIndex,
          image: null,
          error: "Failed to generate image",
          prompt: originalSegments[segmentIndex] || "",
        };

        return {
          ...prev,
          results: updatedResults,
        };
      });
    } finally {
      // Remove from generating indices
      setGeneratingIndices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(segmentIndex);
        return newSet;
      });
    }
  };

  const handleSegmentedSubmit = async (data: any) => {
    setIsGeneratingSegments(true);
    setSegmentedImages(null);
    setGeneratingIndices(new Set());

    try {
      const segments = data.segmentData.segments.map((s: any) => s.selectedSentence);

      // Store original data for editing
      setOriginalSegments(segments);
      setStoryConfigData(data.storyConfigData);

      // Initialize with loading states for all images
      const initialResults = segments.map((segment: string, index: number) => ({
        segmentIndex: index,
        image: null,
        error: null,
        prompt: segment,
      }));

      setSegmentedImages({
        results: initialResults,
        totalSegments: segments.length,
        successCount: 0,
        provider: "vertex",
      });

      // Set all indices as generating
      setGeneratingIndices(new Set(segments.map((_: string, i: number) => i)));

      // Generate images progressively (one by one to show them as they complete)
      for (let i = 0; i < segments.length; i++) {
        // Don't await - start all generations in parallel but update UI immediately
        generateSingleImage(segments[i], i, segments.length, data.storyConfigData);
      }
    } catch (error) {
      console.error("Error starting segmented generation:", error);
      setIsGeneratingSegments(false);
      setGeneratingIndices(new Set());
    }

    // We don't set isGeneratingSegments to false here because
    // individual images are still generating
  };

  const handleEditImage = async (segmentIndex: number, newPrompt: string) => {
    if (!segmentedImages) return;

    // Add to generating indices for UI feedback
    setGeneratingIndices((prev) => new Set(prev).add(segmentIndex));

    try {
      // Create a new segments array with the edited prompt
      const updatedSegments = [...originalSegments];
      updatedSegments[segmentIndex] = newPrompt;

      // Generate only the specific image using the single image function
      await generateSingleImage(
        newPrompt,
        segmentIndex,
        segmentedImages.totalSegments,
        null // Use null to force raw prompt for editing
      );

      // Update the original segments array
      setOriginalSegments(updatedSegments);
    } catch (error) {
      console.error("Error editing image:", error);
      // Remove from generating indices on error
      setGeneratingIndices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(segmentIndex);
        return newSet;
      });
      throw error; // Re-throw to be handled by the UI
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <PromptInput
          isLoading={isGeneratingSegments}
          onSegmentedSubmit={handleSegmentedSubmit}
          showProviders={showProviders}
          onToggleProviders={toggleView}
          mode={mode}
          onModeChange={handleModeChange}
        />

        {/* Loading state for segmented generation */}
        {isGeneratingSegments && (
          <Card className="p-6 text-center mb-6">
            <div className="space-y-3">
              <div className="text-lg font-medium">Generating Images...</div>
              <div className="text-sm text-zinc-600">
                Processing text segments and generating images
              </div>
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </Card>
        )}

        {/* Segmented Images Results */}
        {segmentedImages && (
          <SegmentedImageDisplay
            results={segmentedImages.results}
            totalSegments={segmentedImages.totalSegments}
            successCount={segmentedImages.successCount}
            provider={segmentedImages.provider}
            onEditImage={handleEditImage}
            generatingIndices={generatingIndices}
          />
        )}
      </div>
    </div>
  );
}
