import React, { useEffect } from 'react'
import { ControlledEditor, monaco } from '@monaco-editor/react'
import styles from './RuleEditor.module.css'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function RuleEditor({ value, onChange }: Props) {
  useEffect(() => {
    ;(async () => {
      const instance = await monaco.init()

      instance.languages.typescript.javascriptDefaults.addExtraLib(
        `
          declare const date: Date;

          declare const emitterSensors: Map<
            string,
            {
              value: string
              lastSentAt: string
              source: string
            }
          >;

          declare const actionables: Map<
            string,
            {
              value: string
              lastSentAt: string
            }
          >;
        `,
        'ts:greenhouse.d.ts'
      )
    })()
  }, [])

  return (
    <div className={styles.editor}>
      <ControlledEditor
        language="javascript"
        height="500px"
        options={{
          fontSize: 17,
          wordBasedSuggestions: false,
          minimap: {
            enabled: false,
          },
        }}
        value={value}
        onChange={(ev, value) => onChange(value || '')}
      />
    </div>
  )
}
