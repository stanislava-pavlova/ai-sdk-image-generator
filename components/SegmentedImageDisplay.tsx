import { useState } from "react";
import { SegmentedHeader } from "@/components/segmented/SegmentedHeader";
import { SegmentCard } from "@/components/segmented/SegmentCard";
import { ImagePreviewModal } from "@/components/segmented/ImagePreviewModal";
import { downloadImage } from "@/lib/utils";
import { SegmentedImageResult } from "@/lib/api-types";

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

  const handleDownloadAll = () => {
    results.forEach((result, index) => {
      if (result.image) {
        setTimeout(() => {
          downloadImage(result.image!, index);
        }, index * 500);
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
      <SegmentedHeader
        successCount={successCount}
        totalSegments={totalSegments}
        provider={provider}
        generatingCount={generatingIndices.size}
        onDownloadAll={handleDownloadAll}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((result, index) => (
          <SegmentCard
            key={index}
            index={index}
            result={result}
            isGenerating={generatingIndices.has(index)}
            isRegenerating={regeneratingIndex === index}
            onImageClick={handleImageClick}
            onEditStart={onEditImage ? handleEditStart : undefined}
            isEditing={editingIndex === index}
            editedPrompt={editedPrompt}
            setEditedPrompt={setEditedPrompt}
            onEditCancel={handleEditCancel}
            onEditSave={handleEditSave}
          />
        ))}
      </div>

      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          prompt={selectedPrompt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
