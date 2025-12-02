import clsx from "clsx";

export function VegIcon({ isVeg }: { isVeg: boolean }) {
  return (
    <div
      className={clsx(
        "w-4 h-4 rounded-sm flex items-center justify-center border",
        isVeg ? "border-green-600" : "border-red-600"
      )}
    >
      <div
        className={clsx(
          "w-2 h-2 rounded-sm",
          isVeg ? "bg-green-600" : "bg-red-600"
        )}
      />
    </div>
  );
}

