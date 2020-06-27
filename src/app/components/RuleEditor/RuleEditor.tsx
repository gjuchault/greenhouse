import React, { useEffect } from 'react'
import { ControlledEditor, monaco } from '@monaco-editor/react'
import styles from './RuleEditor.module.css'

type Props = {
  value: string
  onChange: (value: string) => void
  actionables: Actionable[]
  emitterSensors: EmitterSensor[]
}

type Actionable = {
  id: string
  target: string
  name: string
  value: '0-1' | '1-1024'
}

type EmitterSensor = {
  id: string
  sensor: string
  name: string
  min: number
  max: number
}

export function RuleEditor({
  value,
  onChange,
  actionables,
  emitterSensors,
}: Props) {
  useEffect(() => {
    ;(async () => {
      const instance = await monaco.init()

      const Actionables = [
        'declare const Actionables = {',
        ...actionables.map((actionnable) => `"${actionnable.name}": string`),
        '}',
      ].join('\n')

      const Sensors = [
        'declare const Sensors = {',
        ...emitterSensors.map((sensor) => `"${sensor.name}": string`),
        '}',
      ].join('\n')

      instance.languages.typescript.javascriptDefaults.addExtraLib(
        `
          declare const date: Date;

          ${Actionables}
          ${Sensors}

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
