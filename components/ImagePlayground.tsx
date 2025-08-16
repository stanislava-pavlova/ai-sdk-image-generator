"use client";

import { useState } from "react";
import { ModelSelect } from "@/components/ModelSelect";
import { PromptInput } from "@/components/PromptInput";
import { SegmentedImageDisplay } from "@/components/SegmentedImageDisplay";
import { ModelCardCarousel } from "@/components/ModelCardCarousel";
import {
  MODEL_CONFIGS,
  PROVIDERS,
  ProviderKey,
  ModelMode,
  initializeProviderRecord,
} from "@/lib/provider-config";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { Header } from "./Header";
import { Card } from "@/components/ui/card";

export function ImagePlayground() {
  const { images, timings, failedProviders, isLoading, activePrompt } =
    useImageGeneration();

  const [segmentedImages, setSegmentedImages] = useState<any>(null);
  const [isGeneratingSegments, setIsGeneratingSegments] = useState(false);

  const [showProviders, setShowProviders] = useState(true);
  const [selectedModels, setSelectedModels] = useState<
    Record<ProviderKey, string>
  >(MODEL_CONFIGS.performance);
  const [enabledProviders, setEnabledProviders] = useState(
    initializeProviderRecord(true)
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

  const handleModelChange = (providerKey: ProviderKey, model: string) => {
    setSelectedModels((prev) => ({ ...prev, [providerKey]: model }));
  };

  const handleProviderToggle = (provider: string, enabled: boolean) => {
    setEnabledProviders((prev) => ({
      ...prev,
      [provider]: enabled,
    }));
  };

  const providerToModel = {
    // replicate: selectedModels.replicate,
    vertex: selectedModels.vertex,
    // openai: selectedModels.openai,
    // fireworks: selectedModels.fireworks,
  };

  const handleSegmentedSubmit = async (data: any) => {
    console.log("Frontend received data:", data);
    setIsGeneratingSegments(true);
    setSegmentedImages(null);

    try {
      const segments = data.segmentData.segments.map(
        (s: any) => s.selectedSentence
      );

      const requestBody = {
        segments,
        provider: "vertex",
        modelId: selectedModels.vertex,
        characterData: data.characterData,
        contextData: data.contextData,
      };

      // Use /api/generate-images route with segmented data
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to generate segmented images");
      }

      const result = await response.json();
      setSegmentedImages(result);
    } catch (error) {
      console.error("Error generating segmented images:", error);
      // Handle error - show a toast or error message
    } finally {
      setIsGeneratingSegments(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <PromptInput
          isLoading={isLoading || isGeneratingSegments}
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
                Processing text segments and generating images with
                character/context data
              </div>
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </Card>
        )}

        {/* Segmented Images Results */}
        {segmentedImages && !isGeneratingSegments && (
          <SegmentedImageDisplay
            results={segmentedImages.results}
            totalSegments={segmentedImages.totalSegments}
            successCount={segmentedImages.successCount}
            provider={segmentedImages.provider}
          />
        )}

        {/* Regular single image generation results */}
        {!segmentedImages && !isGeneratingSegments && (
          <>
            {(() => {
              const getModelProps = () =>
                (Object.keys(PROVIDERS) as ProviderKey[]).map((key) => {
                  const provider = PROVIDERS[key];
                  const imageItem = images.find((img) => img.provider === key);
                  const imageData = imageItem?.image;
                  const modelId = imageItem?.modelId ?? "N/A";
                  const timing = timings[key];

                  return {
                    label: provider.displayName,
                    models: provider.models,
                    value: selectedModels[key],
                    providerKey: key,
                    onChange: (model: string, providerKey: ProviderKey) =>
                      handleModelChange(providerKey, model),
                    iconPath: provider.iconPath,
                    color: provider.color,
                    enabled: enabledProviders[key],
                    onToggle: (enabled: boolean) =>
                      handleProviderToggle(key, enabled),
                    image: imageData,
                    modelId,
                    timing,
                    failed: failedProviders.includes(key),
                  };
                });

              return (
                <>
                  <div className="md:hidden">
                    <ModelCardCarousel models={getModelProps()} />
                  </div>
                  <div className="hidden md:grid md:grid-cols-2 2xl:grid-cols-4 gap-8">
                    {getModelProps().map((props) => (
                      <ModelSelect key={props.label} {...props} />
                    ))}
                  </div>
                  {activePrompt && activePrompt.length > 0 && (
                    <div className="text-center mt-4 text-muted-foreground">
                      {activePrompt}
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
