import { useCallback, useState } from "react";
import type { SoonerItem, SoonerVariant } from "../components/sooner";

export function useSooner(initial: SoonerItem[] = []) {
  const [items, setItems] = useState<SoonerItem[]>(initial);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: SoonerVariant = "info", persist = false) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message, variant }]);
      if (!persist && variant !== "loading") {
        setTimeout(() => dismiss(id), 3200);
      }
      return id;
    },
    [dismiss],
  );

  const update = useCallback(
    (id: number, message: string, variant: SoonerVariant = "info") => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, message, variant } : item,
        ),
      );
      if (variant !== "loading") {
        setTimeout(() => dismiss(id), 2600);
      }
    },
    [dismiss],
  );

  return { items, push, update, dismiss };
}
