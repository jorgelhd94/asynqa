import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function highlightWithLineNumbers(code: string) {
  const highlighted = Prism.highlight(code, Prism.languages.json, "json");
  return highlighted
    .split("\n")
    .map(
      (line, i) =>
        `<span class="editor-line"><span class="line-number">${i + 1}</span>${line}</span>`,
    )
    .join("\n");
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightWithLineNumbers}
        padding={12}
        tabSize={2}
        insertSpaces
        className="json-editor min-w-0 flex-1"
      />
    </div>
  );
}
