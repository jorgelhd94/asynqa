import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function highlight(code: string) {
  return Prism.highlight(code, Prism.languages.json, "json");
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  const lines = value.split("\n");

  return (
    <div className="json-editor-wrapper relative flex flex-1 overflow-y-auto overflow-x-hidden">
      {/* Line numbers — scrolls with the editor */}
      <div
        className="sticky left-0 z-10 shrink-0 select-none border-r border-[--color-divider]/50 bg-[--color-primary-contrast]/50 pt-3 pr-2 pl-2 text-right"
        aria-hidden
      >
        {lines.map((_, i) => (
          <div key={i} className="font-mono text-[10px] leading-[20px] text-[--color-text-muted]">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code editor */}
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        padding={12}
        tabSize={2}
        insertSpaces
        className="json-editor flex-1 min-w-0"
      />
    </div>
  );
}
