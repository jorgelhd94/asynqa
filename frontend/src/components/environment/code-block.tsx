import { useClipboard } from "@/hooks/use-clipboard";
import { Check, Copy } from "lucide-react";

type CodeBlockProps = {
  content: string;
  label: string;
  maxHeight?: string;
  variant?: "default" | "success" | "error";
};

export function CodeBlock({
  content,
  label,
  maxHeight = "max-h-48",
  variant = "default",
}: CodeBlockProps) {
  const { copy, copied } = useClipboard();

  const formatted = tryFormat(content);
  const isJson = isValidJson(content);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-[--color-text-secondary]">
          {label}
        </span>
        <button
          onClick={() => copy(content)}
          className={`flex items-center gap-1 text-[10px] transition-colors ${copied ? "text-[--color-accent-light]" : "text-[--color-text-muted] hover:text-[--color-text-primary]"}`}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        className={`${maxHeight} overflow-auto rounded-lg border border-[--color-divider] bg-[--color-primary-bg] p-3 text-xs whitespace-pre-wrap break-words ${
          variant === "success"
            ? "text-[--color-success]"
            : variant === "error"
              ? "text-[--color-error]"
              : ""
        }`}
      >
        {isJson && variant === "default" ? (
          <JsonHighlight json={formatted} />
        ) : (
          formatted
        )}
      </pre>
    </div>
  );
}

function JsonHighlight({ json }: { json: string }) {
  const tokens = tokenize(json);
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={token.className}>
          {token.text}
        </span>
      ))}
    </>
  );
}

type Token = { text: string; className: string };

function tokenize(json: string): Token[] {
  const tokens: Token[] = [];
  // Match JSON tokens: strings, numbers, booleans, null, braces, colons, commas
  const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(true|false)|(null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\]])|([,:])|([\s]+)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(json)) !== null) {
    // Any unmatched text before this match
    if (match.index > lastIndex) {
      tokens.push({ text: json.slice(lastIndex, match.index), className: "" });
    }
    lastIndex = regex.lastIndex;

    if (match[1] !== undefined) {
      // Key (string followed by colon)
      tokens.push({ text: match[1], className: "text-[#d4a843]" }); // gold - keys
      // Capture the colon and whitespace after key
      const rest = match[0].slice(match[1].length);
      if (rest) tokens.push({ text: rest, className: "text-[--color-text-muted]" });
    } else if (match[2] !== undefined) {
      // String value
      tokens.push({ text: match[2], className: "text-[#10b981]" }); // green - strings
    } else if (match[3] !== undefined) {
      // Boolean
      tokens.push({ text: match[3], className: "text-[#f59e0b]" }); // amber - booleans
    } else if (match[4] !== undefined) {
      // Null
      tokens.push({ text: match[4], className: "text-[#f43f5e]" }); // red - null
    } else if (match[5] !== undefined) {
      // Number
      tokens.push({ text: match[5], className: "text-[#c4b5fd]" }); // purple - numbers
    } else if (match[6] !== undefined) {
      // Braces/brackets
      tokens.push({ text: match[6], className: "text-[--color-text-muted]" });
    } else if (match[7] !== undefined) {
      // Comma/colon
      tokens.push({ text: match[7], className: "text-[--color-text-muted]" });
    } else if (match[8] !== undefined) {
      // Whitespace
      tokens.push({ text: match[8], className: "" });
    }
  }

  // Remaining text
  if (lastIndex < json.length) {
    tokens.push({ text: json.slice(lastIndex), className: "" });
  }

  return tokens;
}

function tryFormat(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
