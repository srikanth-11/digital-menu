export function MirchiIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="#ef4444"
    >
      <path d="M14.5 2c-2.5.5-4 2-5 3.5C7 8 4 10 3 11c-.5.5-1 1.5-.5 2.5.6 1.4 3 4.5 8.5 4 5-.5 7-3 8-4 .5-.5 1-1.5.5-2.5-.5-1.3-2-4-5.5-6C15 3.5 15 2.5 14.5 2z" />
    </svg>
  );
}

export function SpiceLevel({ level = 0 }: { level?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <MirchiIcon key={i} />
      ))}
    </div>
  );
}
