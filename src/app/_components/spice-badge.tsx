export function SpiceBadge({ level }: { level: number }) {
  if (!level || level === 0) {
    return (
      <span className="inline-block text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
        Not Spicy
      </span>
    );
  }

  // Strongly typed keys
  const LABELS = {
    1: { text: "Mild", color: "bg-green-200 text-green-800" },
    2: { text: "Medium", color: "bg-yellow-200 text-yellow-800" },
    3: { text: "Hot", color: "bg-orange-200 text-orange-800" },
    4: { text: "Extra Hot", color: "bg-red-200 text-red-800" },
    5: { text: "Extreme", color: "bg-red-500 text-white" },
  } as const;

  type LevelKey = keyof typeof LABELS;

  // Clamp level between 1–5 AND type-cast safely
  const safeLevel: LevelKey =
    Math.min(5, Math.max(1, level)) as LevelKey;

  const info = LABELS[safeLevel];

  return (
    <span className={`inline-block text-xs px-2 py-1 rounded ${info.color}`}>
      {info.text}
    </span>
  );
}
