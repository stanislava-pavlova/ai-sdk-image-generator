"use client";

interface WordsPerSegmentInputProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function WordsPerSegmentInput({
  value,
  onValueChange,
  disabled = false,
}: WordsPerSegmentInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700">Words per Segment</label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          onValueChange(e?.target?.value);
        }}
        disabled={disabled}
        className="w-full h-9 px-3 bg-white border border-zinc-200 rounded-md shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        placeholder="25"
      />
    </div>
  );
}
