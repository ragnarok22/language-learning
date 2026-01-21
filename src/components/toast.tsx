import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";

export type ToastVariant = "info" | "success" | "error" | "loading";

export type ToastItem = {
  id: number;
  message: string;
  variant?: ToastVariant;
};

type Props = {
  items: ToastItem[];
  onDismiss?: (id: number) => void;
};

export function ToastStack({ items, onDismiss }: Props) {
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

  const variantStyles: Record<ToastVariant, string> = {
    info: "border-white/20 bg-slate-800/95 text-slate-50",
    success: "border-emerald-400/60 bg-emerald-900/70 text-emerald-50",
    error: "border-rose-400/70 bg-rose-900/70 text-rose-50",
    loading: "border-sky-400/50 bg-sky-900/70 text-sky-50",
  };

  const variantIcons: Record<ToastVariant, ReactNode> = {
    info: <InfoIcon className="h-5 w-5" aria-hidden />,
    success: <CheckCircle2Icon className="h-5 w-5" aria-hidden />,
    error: <CircleAlertIcon className="h-5 w-5" aria-hidden />,
    loading: <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${variantStyles[item.variant ?? "info"]}`}
        >
          <div className="mt-0.5">{variantIcons[item.variant ?? "info"]}</div>
          <p className="leading-snug text-base">{item.message}</p>
          {item.variant !== "loading" ? (
            <button
              className="ml-auto rounded-lg p-1 text-white/80 transition hover:text-white"
              onClick={() => onDismiss?.(item.id)}
              type="button"
              aria-label="Dismiss"
            >
              <XIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
