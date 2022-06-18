import React from "react";
import { Card } from "evergreen-ui";
import Editor, { Monaco } from "@monaco-editor/react";

interface Props {
  value: string;
  typescriptEnvironment: string;
  onChange(value: string): void;
}

export function CodeEditor({ value, typescriptEnvironment, onChange }: Props) {
  function handleMonacoMount(monaco: Monaco) {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      typescriptEnvironment,
      "ts:greenhouse.d.ts"
    );
  }

  return (
    <Card height="100%" elevation={0}>
      <Editor
        language="javascript"
        height={`${window.innerHeight - 220}px`}
        options={{
          fontSize: 17,
          wordBasedSuggestions: false,
          padding: 10,
          minimap: {
            enabled: false,
          },
        }}
        value={value}
        beforeMount={handleMonacoMount}
        onChange={(value) => onChange(value ?? "")}
      />
    </Card>
  );
}
