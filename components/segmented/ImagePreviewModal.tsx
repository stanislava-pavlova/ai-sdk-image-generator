import { Button } from "@/components/ui/button";

interface ImagePreviewModalProps {
  image: string;
  prompt: string;
  onClose: () => void;
}

export function ImagePreviewModal({ image, prompt, onClose }: ImagePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Image Preview</h3>
            <Button onClick={onClose} variant="ghost" size="sm">
              ×
            </Button>
          </div>
        </div>

        <div className="p-4">
          <img
            src={`data:image/png;base64,${image}`}
            alt="Selected segment"
            className="max-w-full max-h-[60vh] mx-auto rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-700 mb-2">Generated Prompt:</h4>
            <p className="text-sm text-zinc-600">{prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
