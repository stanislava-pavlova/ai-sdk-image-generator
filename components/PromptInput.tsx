import { Upload, X, FileText, BarChart3 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { usePromptManager } from "@/hooks/use-prompt-manager";

type QualityMode = "performance" | "quality";

interface PromptInputProps {
  onSegmentedSubmit?: (segmentData: any) => void;
  isLoading?: boolean;
  showProviders: boolean;
  onToggleProviders: () => void;
  mode: QualityMode;
  onModeChange: (mode: QualityMode) => void;
}

export function PromptInput({
  isLoading,
  onSegmentedSubmit,
}: PromptInputProps) {
  const {
    contextFile,
    characterFile,
    contextData,
    characterData,
    contextFileRef,
    characterFileRef,
    textFile,
    textContent,
    segmentData,
    isProcessing,
    error,
    textFileRef,
    handleContextFileChange,
    handleCharacterFileChange,
    removeContextFile,
    removeCharacterFile,
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
        characterData,
        contextData,
      });
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-zinc-50 rounded-xl p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Context File Upload */}
            <div className="flex-1">
              <input
                ref={contextFileRef}
                type="file"
                accept=".json,.txt"
                onChange={handleContextFileChange}
                className="hidden"
                id="context-file"
              />
              {contextFile ? (
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-700">
                      Context:
                    </span>
                    <span className="text-sm text-zinc-600">
                      {contextFile.filename}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeContextFile}
                    className="h-6 w-6 p-0 hover:bg-zinc-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => contextFileRef.current?.click()}
                  className="w-full h-9 bg-white border-zinc-200 hover:bg-zinc-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Context (.json/.txt)
                </Button>
              )}
            </div>

            {/* Character File Upload */}
            <div className="flex-1">
              <input
                ref={characterFileRef}
                type="file"
                accept=".json,.txt"
                onChange={handleCharacterFileChange}
                className="hidden"
                id="character-file"
              />
              {characterFile ? (
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-700">
                      Character:
                    </span>
                    <span className="text-sm text-zinc-600">
                      {characterFile.filename}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCharacterFile}
                    className="h-6 w-6 p-0 hover:bg-zinc-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => characterFileRef.current?.click()}
                  className="w-full h-9 bg-white border-zinc-200 hover:bg-zinc-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Character (.json/.txt)
                </Button>
              )}
            </div>
          </div>

          {/* Text Upload */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">
              Text:
            </label>

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
                      <div className="text-sm font-medium text-zinc-700">
                        {textFile.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {Math.round(textFile.size / 1024)} KB •{" "}
                        {textContent.split(" ").length} words
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
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Text processed: {segmentData.totalSegments} segments
                        ready
                      </span>
                    </div>
                    <div className="text-xs text-green-600">
                      Ready to generate {segmentData.totalSegments} images
                    </div>
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
                Upload Bulgarian Text (.txt)
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-zinc-500">
              {textFile ? (
                <span>
                  Bulgarian text uploaded • Upload character/context for
                  enhanced prompts
                </span>
              ) : contextFile || characterFile ? (
                <span>
                  Character/context uploaded • Upload Bulgarian text to proceed
                </span>
              ) : (
                <span>
                  Upload Bulgarian text (.txt) to generate segmented images
                </span>
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
