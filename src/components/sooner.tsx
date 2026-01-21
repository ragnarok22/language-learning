import { useEffect } from "react";

export type SoonerVariant = "info" | "success" | "error" | "loading";

export type SoonerItem = {
  id: number;
  message: string;
  variant?: SoonerVariant;
};

type Props = {
  items: SoonerItem[];
  onDismiss?: (id: number) => void;
};

export function SoonerStack({ items, onDismiss }: Props) {
  useEffect(() => {
    const timers = items.map((item) => {
      if (item.variant === "loading") return null;
      return setTimeout(() => onDismiss?.(item.id), 3200);
    });
    return () => {
      timers.forEach((t) => {
        if (t) clearTimeout(t);
      });
    };
  }, [items, onDismiss]);

  const variantStyles: Record<SoonerVariant, string> = {
    info: "border-white/15 bg-slate-800/90 text-slate-50",
    success: "border-emerald-400/50 bg-emerald-500/20 text-emerald-50",
    error: "border-rose-400/60 bg-rose-500/20 text-rose-50",
    loading: "border-sky-400/40 bg-sky-500/20 text-sky-50",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur ${variantStyles[item.variant ?? "info"]}`}
        >
          {item.variant === "loading" ? (
            <span
              className="mt-0.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
          ) : null}
          <p className="leading-snug">{item.message}</p>
          {item.variant !== "loading" ? (
            <button
              className="ml-auto rounded-lg px-2 text-xs text-white/80 hover:text-white"
              onClick={() => onDismiss?.(item.id)}
              type="button"
            >
              ×
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
