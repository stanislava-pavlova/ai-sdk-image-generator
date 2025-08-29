import { Eye, FileText, Edit, X, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { downloadImage } from "@/lib/utils";
import { SegmentedImageResult } from "@/lib/api-types";

interface SegmentCardProps {
  index: number;
  result: SegmentedImageResult;
  isGenerating: boolean;
  isRegenerating: boolean;
  onImageClick: (imageData: string, prompt: string) => void;
  onEditStart?: (index: number, currentPrompt: string) => void;
  isEditing: boolean;
  editedPrompt: string;
  setEditedPrompt: (value: string) => void;
  onEditCancel: () => void;
  onEditSave: (index: number) => void;
}

export function SegmentCard({
  index,
  result,
  isGenerating,
  isRegenerating,
  onImageClick,
  onEditStart,
  isEditing,
  editedPrompt,
  setEditedPrompt,
  onEditCancel,
  onEditSave,
}: SegmentCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-auto relative">
        {isRegenerating || isGenerating ? (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center min-h-52">
            <div className="text-center">
              <Spinner className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">
                {isRegenerating ? "Regenerating..." : "Generating..."}
              </p>
            </div>
          </div>
        ) : result.image ? (
          <div className="relative group">
            <img
              src={`data:image/png;base64,${result.image}`}
              alt={`Segment ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => onImageClick(result.image!, result.prompt)}
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
              {result.error && <p className="text-xs text-red-500 mt-1">{result.error}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700">Segment {index + 1}</span>
          <div className="flex items-center gap-1">
            {onEditStart && (
              <Button
                onClick={() => onEditStart(index, result.prompt)}
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
                onClick={() => downloadImage(result.image!, index)}
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

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              placeholder="Edit the prompt for this image..."
              rows={3}
              className="text-xs resize-none min-h-28"
            />
            <div className="flex justify-end gap-1">
              <Button onClick={onEditCancel} variant="ghost" size="sm" className="h-6 px-2">
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={() => onEditSave(index)}
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
            {result.prompt.length > 100 ? `${result.prompt.substring(0, 100)}...` : result.prompt}
          </p>
        )}
      </div>
    </Card>
  );
}
