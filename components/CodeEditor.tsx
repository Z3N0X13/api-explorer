"use client";

import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { EditorView, oneDark } from "@uiw/react-codemirror";
import dynamic from "next/dynamic";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});

type Lang = "json" | "javascript" | "text";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  lang?: Lang;
  readOnly?: boolean;
  minHeight?: string;
  placeholder?: string;
}

const langExtension = (lang: Lang) => {
  if (lang === "json") return [json()];
  if (lang === "javascript") return [javascript()];
  return [];
};

const customTheme = EditorView.theme({
  "&": {
    fontSize: "12px",
    background: "#171717 !important",
  },
  ".cm-content": {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
    padding: "8px 0",
  },
  ".cm-gutters": {
    background: "#171717",
    border: "none",
    color: "#444",
  },
  ".cm-line": {
    paddingLeft: "12px",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-activeLine": {
    background: "#1f1f1f",
  },
  ".cm-placeholder": {
    color: "#555",
    fontStyle: "italic",
  },
});

export default function CodeEditor({
  value,
  onChange,
  lang = "text",
  readOnly = false,
  minHeight = "120px",
  placeholder,
}: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      theme={oneDark}
      extensions={[
        ...langExtension(lang),
        customTheme,
        EditorView.lineWrapping,
      ]}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: !readOnly,
        highlightSelectionMatches: true,
        autocompletion: !readOnly,
        bracketMatching: true,
        closeBrackets: !readOnly,
        indentOnInput: !readOnly,
      }}
      placeholder={placeholder}
      style={{ minHeight, overflow: "hidden", borderRadius: 6 }}
    />
  );
}
