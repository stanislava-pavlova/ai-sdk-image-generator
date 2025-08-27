"use client";

interface WordsPerSegmentInputProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export function WordsPerSegmentInput({
  value,
  onValueChange,
  disabled = false,
}: WordsPerSegmentInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue > 0) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700">
        Words per Segment
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-9 px-3 bg-white border border-zinc-200 rounded-md shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        placeholder="25"
      />
    </div>
  );
}
