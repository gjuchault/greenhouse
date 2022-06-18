import React from "react";
import { Card } from "evergreen-ui";
import Editor, { loader } from "@monaco-editor/react";
import { useAsyncEffect } from "../../helpers/useAsyncEffect";

interface Props {
  value: string;
  typescriptEnvironment: string;
  onChange(value: string): void;
}

export function CodeEditor({ value, typescriptEnvironment, onChange }: Props) {
  useAsyncEffect(async () => {
    const instance = await loader.init();

    instance.languages.typescript.javascriptDefaults.addExtraLib(
      typescriptEnvironment,
      "ts:greenhouse.d.ts"
    );
  });

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
        onChange={(_, value) => onChange(value || "")}
      />
    </Card>
  );
}
