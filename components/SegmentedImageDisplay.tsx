import { Download, Eye, FileText, Edit, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

interface SegmentedImageResult {
  segmentIndex: number;
  image?: string;
  error?: string;
  prompt: string;
}

interface SegmentedImageDisplayProps {
  results: SegmentedImageResult[];
  totalSegments: number;
  successCount: number;
  provider: string;
  onEditImage?: (segmentIndex: number, newPrompt: string) => void;
  generatingIndices?: Set<number>;
}

export function SegmentedImageDisplay({
  results,
  totalSegments,
  successCount,
  provider,
  onEditImage,
  generatingIndices = new Set(),
}: SegmentedImageDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>("");
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleImageClick = (imageData: string, prompt: string) => {
    setSelectedImage(imageData);
    setSelectedPrompt(prompt);
  };

  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `segment-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    results.forEach((result, index) => {
      if (result.image) {
        setTimeout(() => {
          handleDownload(result.image!, index);
        }, index * 500); // Stagger downloads
      }
    });
  };

  const handleEditStart = (index: number, currentPrompt: string) => {
    setEditingIndex(index);
    setEditedPrompt(currentPrompt);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditedPrompt("");
  };

  const handleEditSave = async (index: number) => {
    if (!editedPrompt.trim() || !onEditImage) return;
    
    setRegeneratingIndex(index);
    setEditingIndex(null);
    
    try {
      await onEditImage(index, editedPrompt.trim());
    } catch (error) {
      console.error("Error regenerating image:", error);
    } finally {
      setRegeneratingIndex(null);
      setEditedPrompt("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-800">
              Segmented Images
              {generatingIndices.size > 0 && (
                <span className="ml-2 text-sm font-normal text-zinc-600">
                  ({generatingIndices.size} generating...)
                </span>
              )}
            </h3>
            <p className="text-sm text-zinc-600">
              {successCount} of {totalSegments} images generated successfully using {provider}
              {generatingIndices.size > 0 && (
                <span className="ml-1 text-orange-600">
                  • {generatingIndices.size} in progress
                </span>
              )}
            </p>
          </div>
          {successCount > 0 && (
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All ({successCount})
            </Button>
          )}
        </div>
      </Card>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((result, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square relative">
              {(regeneratingIndex === index || generatingIndices.has(index)) ? (
                <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                  <div className="text-center">
                    <Spinner className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-600">
                      {regeneratingIndex === index ? "Regenerating..." : "Generating..."}
                    </p>
                  </div>
                </div>
              ) : result.image ? (
                <div className="relative group">
                  <img
                    src={`data:image/png;base64,${result.image}`}
                    alt={`Segment ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => handleImageClick(result.image!, result.prompt)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                  <div className="text-center p-4">
                    <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Failed to generate</p>
                    {result.error && (
                      <p className="text-xs text-red-500 mt-1">{result.error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700">
                  Segment {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  {onEditImage && (
                    <Button
                      onClick={() => handleEditStart(index, result.prompt)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Edit prompt and regenerate"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                  {result.image && (
                    <Button
                      onClick={() => handleDownload(result.image!, index)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Download image"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    placeholder="Edit the prompt for this image..."
                    rows={3}
                    className="text-xs resize-none min-h-28"
                  />
                  <div className="flex justify-end gap-1">
                    <Button
                      onClick={handleEditCancel}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleEditSave(index)}
                      variant="default"
                      size="sm"
                      className="h-6 px-2"
                      disabled={!editedPrompt.trim()}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 line-clamp-3">
                  {result.prompt.length > 100
                    ? `${result.prompt.substring(0, 100)}...`
                    : result.prompt
                  }
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Image Preview</h3>
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="ghost"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <img
                src={`data:image/png;base64,${selectedImage}`}
                alt="Selected segment"
                className="max-w-full max-h-[60vh] mx-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
                <h4 className="text-sm font-medium text-zinc-700 mb-2">Generated Prompt:</h4>
                <p className="text-sm text-zinc-600">{selectedPrompt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
