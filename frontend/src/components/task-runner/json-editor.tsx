import { useRef, useCallback } from "react";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function tokenizeJson(json: string): { type: string; value: string }[] {
  const tokens: { type: string; value: string }[] = [];
  const regex =
    /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([\s]+)|([{}[\]:,])|(.)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(json)) !== null) {
    if (match[1] != null) {
      tokens.push({ type: "key", value: match[1] });
      // find the colon after the key
      const rest = json.slice(regex.lastIndex).match(/^(\s*:)/);
      if (rest) {
        tokens.push({ type: "punctuation", value: rest[1] });
        regex.lastIndex += rest[1].length;
      }
    } else if (match[2] != null) {
      tokens.push({ type: "string", value: match[2] });
    } else if (match[3] != null) {
      tokens.push({ type: "number", value: match[3] });
    } else if (match[4] != null) {
      tokens.push({ type: "boolean", value: match[4] });
    } else if (match[5] != null) {
      tokens.push({ type: "null", value: match[5] });
    } else if (match[6] != null) {
      tokens.push({ type: "whitespace", value: match[6] });
    } else if (match[7] != null) {
      tokens.push({ type: "punctuation", value: match[7] });
    } else {
      tokens.push({ type: "plain", value: match[8] });
    }
  }
  return tokens;
}

const tokenColors: Record<string, string> = {
  key: "var(--color-accent-light)",
  string: "var(--color-success)",
  number: "#d19a66",
  boolean: "#c678dd",
  null: "#c678dd",
  punctuation: "var(--color-text-muted)",
  plain: "var(--color-text-primary)",
  whitespace: "",
};

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const tokens = tokenizeJson(value);

  return (
    <div className="relative flex-1">
      {/* Line numbers */}
      <div className="absolute inset-y-0 left-0 flex w-10 flex-col border-r border-[--color-divider]/50 bg-[--color-primary-contrast]/50 pt-3 text-right pointer-events-none z-10">
        {value.split("\n").map((_, i) => (
          <span
            key={i}
            className="px-2 font-mono text-[10px] leading-[20px] text-[--color-text-muted]"
          >
            {i + 1}
          </span>
        ))}
      </div>

      {/* Syntax-highlighted layer */}
      <pre
        ref={highlightRef}
        aria-hidden
        className="absolute inset-0 overflow-hidden p-3 pl-14 font-mono text-xs leading-[20px] whitespace-pre-wrap break-words pointer-events-none"
      >
        {tokens.map((token, i) =>
          token.type === "whitespace" ? (
            token.value
          ) : (
            <span key={i} style={{ color: tokenColors[token.type] }}>
              {token.value}
            </span>
          )
        )}
        {/* Trailing newline to match textarea sizing */}
        {"\n"}
      </pre>

      {/* Transparent textarea on top */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        className="relative h-full w-full resize-none border-none bg-transparent p-3 pl-14 font-mono text-xs leading-[20px] text-transparent caret-[--color-text-primary] outline-none z-20"
      />
    </div>
  );
}
