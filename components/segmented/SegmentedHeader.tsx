import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SegmentedHeaderProps {
  successCount: number;
  totalSegments: number;
  provider: string;
  generatingCount: number;
  onDownloadAll: () => void;
}

export function SegmentedHeader({
  successCount,
  totalSegments,
  provider,
  generatingCount,
  onDownloadAll,
}: SegmentedHeaderProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-800">
            Segmented Images
            {generatingCount > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-600">
                ({generatingCount} generating...)
              </span>
            )}
          </h3>
          <p className="text-sm text-zinc-600">
            {successCount} of {totalSegments} images generated successfully using {provider}
            {generatingCount > 0 && (
              <span className="ml-1 text-orange-600">• {generatingCount} in progress</span>
            )}
          </p>
        </div>
        {successCount > 0 && (
          <Button
            onClick={onDownloadAll}
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
  );
}
