"use client";

import { AspectRatio } from "@/lib/api-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AspectRatioSelectProps {
  value: AspectRatio;
  onValueChange: (value: AspectRatio) => void;
  disabled?: boolean;
}

const aspectRatioOptions = [
  { value: "1:1" as AspectRatio, label: "Square (1:1)" },
  { value: "9:16" as AspectRatio, label: "Portrait (9:16)" },
  { value: "16:9" as AspectRatio, label: "Landscape (16:9)" },
];

export function AspectRatioSelect({
  value,
  onValueChange,
  disabled = false,
}: AspectRatioSelectProps) {
  const selectedOption = aspectRatioOptions.find((option) => option.value === value);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700">Aspect Ratio</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full h-9 bg-white border shadow-sm border-zinc-200 hover:bg-zinc-50">
          <SelectValue>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-zinc-700">{selectedOption?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {aspectRatioOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
