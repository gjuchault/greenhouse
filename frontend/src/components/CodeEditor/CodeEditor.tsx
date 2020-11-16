import React from "react";
import { Card } from "evergreen-ui";
import { ControlledEditor, monaco } from "@monaco-editor/react";
import { useAsyncEffect } from "../../helpers/useAsyncEffect";

interface Props {
  value: string;
  typescriptEnvironment: string;
  onChange(value: string): void;
}

export function CodeEditor({ value, typescriptEnvironment, onChange }: Props) {
  useAsyncEffect(async () => {
    const instance = await monaco.init();

    instance.languages.typescript.javascriptDefaults.addExtraLib(
      typescriptEnvironment,
      "ts:greenhouse.d.ts"
    );
  });

  return (
    <Card height="100%" elevation={0}>
      <ControlledEditor
        language="javascript"
        height="500px"
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
