import { useState } from "react";
import { Upload, X, FileText, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { usePromptManager } from "@/hooks/use-prompt-manager";
import { getAgeForSegment } from "@/lib/utils";

type QualityMode = "performance" | "quality";

interface PromptInputProps {
  onSegmentedSubmit?: (segmentData: any) => void;
  isLoading?: boolean;
  showProviders: boolean;
  onToggleProviders: () => void;
  mode: QualityMode;
  onModeChange: (mode: QualityMode) => void;
}

export function PromptInput({ isLoading, onSegmentedSubmit }: PromptInputProps) {
  const [showSegments, setShowSegments] = useState(false);

  const {
    storyConfigFile,
    storyConfigData,
    storyConfigFileRef,
    textFile,
    textContent,
    segmentData,
    isProcessing,
    error,
    textFileRef,
    handleStoryConfigFileChange,
    removeStoryConfigFile,
    handleTextFileChange,
    removeTextFile,
    processTextSegmentation,
  } = usePromptManager();

  const handleSubmit = async () => {
    if (!textContent.trim()) return;

    if (!segmentData) {
      await processTextSegmentation();
      return;
    }

    if (onSegmentedSubmit) {
      onSegmentedSubmit({
        segmentData,
        storyConfigData,
      });
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-zinc-50 rounded-xl p-4">
        <div className="flex flex-col gap-3">
          {/* Story Configuration Upload */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">
              Story Configuration:
            </label>
            <input
              ref={storyConfigFileRef}
              type="file"
              accept=".json"
              onChange={handleStoryConfigFileChange}
              className="hidden"
              id="story-config-file"
            />
            {storyConfigFile ? (
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-zinc-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <div>
                    <div className="text-sm font-medium text-zinc-700">
                      {storyConfigFile.filename}
                    </div>
                    {storyConfigData && (
                      <div className="text-xs text-zinc-500">
                        Character: {storyConfigData.identity_core.name} • Style:{" "}
                        {storyConfigData.style_throughline.art_style || "cinematic realism"}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeStoryConfigFile}
                  className="h-6 w-6 p-0 hover:bg-zinc-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => storyConfigFileRef.current?.click()}
                className="w-full h-9 bg-white border-zinc-200 hover:bg-zinc-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Story Configuration (.json)
              </Button>
            )}
          </div>

          {/* Text Upload */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">Text:</label>

            <input
              ref={textFileRef}
              type="file"
              accept=".txt"
              onChange={handleTextFileChange}
              className="hidden"
              id="text-file"
            />

            {textFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    <div>
                      <div className="text-sm font-medium text-zinc-700">{textFile.name}</div>
                      <div className="text-xs text-zinc-500">
                        {Math.round(textFile.size / 1024)} KB • {textContent.split(" ").length}{" "}
                        words
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeTextFile}
                    className="h-8 w-8 p-0 hover:bg-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Text Preview */}
                <div className="bg-zinc-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-sm text-zinc-600">
                    {textContent.substring(0, 300)}
                    {textContent.length > 300 && "..."}
                  </p>
                </div>

                {/* Segmentation Status */}
                {segmentData && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Text processed: {segmentData.totalSegments} segments ready
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSegments(!showSegments)}
                        className="h-6 px-2 text-green-600 hover:bg-green-100"
                      >
                        {showSegments ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Preview
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-green-600 mb-2">
                      Ready to generate {segmentData.totalSegments} images
                    </div>

                    {/* Collapsible Segments Preview */}
                    {showSegments && (
                      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                        <div className="text-xs font-medium text-green-700 mb-2">
                          Segments Preview:
                        </div>
                        {segmentData.segments.map((segment, index) => {
                          const ageInfo = getAgeForSegment(index, storyConfigData);
                          return (
                            <div
                              key={index}
                              className="bg-white rounded p-2 border border-green-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-green-700">
                                    Segment {index + 1}
                                  </span>
                                  {ageInfo && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                      Age {ageInfo.age}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-green-600">
                                  {segment.wordCount} words
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {segment.selectedSentence.length > 150
                                  ? `${segment.selectedSentence.substring(0, 150)}...`
                                  : segment.selectedSentence}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => textFileRef.current?.click()}
                className="w-full h-12 bg-white border-zinc-200 hover:bg-zinc-50 border-dashed"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Text (.txt)
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-zinc-500">
              {textFile ? (
                <span>Тext uploaded • Upload character/context for enhanced prompts</span>
              ) : (
                <span>Upload text (.txt) to generate segmented images</span>
              )}
            </div>

            {textFile ? (
              <button
                onClick={segmentData ? handleSubmit : processTextSegmentation}
                disabled={isLoading || isProcessing || !textContent.trim()}
                className="h-8 px-4 rounded-full bg-black flex items-center justify-center disabled:opacity-50 text-white text-sm"
              >
                {isLoading || isProcessing ? (
                  <Spinner className="w-3 h-3 text-white" />
                ) : segmentData ? (
                  <>Generate {segmentData.totalSegments} Images</>
                ) : (
                  "Process Text"
                )}
              </button>
            ) : (
              <div className="text-xs text-zinc-400">No text uploaded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
