import { useState, useCallback, useRef } from "react";
import { ClipboardSetText } from "../../wailsjs/runtime/runtime";

export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const copy = useCallback(
    async (text: string) => {
      try {
        await ClipboardSetText(text);
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  return { copy, copied };
}
