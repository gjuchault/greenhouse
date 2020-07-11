import React, { useEffect } from 'react'
import { ControlledEditor, monaco } from '@monaco-editor/react'
import { Actionable, EmitterSensor } from '../../hooks/useQuery'
import styles from './RuleEditor.module.css'

type Props = {
  value: string
  onChange: (value: string) => void
  actionables: Actionable[]
  emitterSensors: EmitterSensor[]
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
        'declare const Actionables: {',
        ...actionables.map((actionable) => `"${actionable.name}": string`),
        '}',
      ].join('\n')

      const Sensors = [
        'declare const Sensors: {',
        ...emitterSensors.map((sensor) => `"${sensor.name}": string`),
        '}',
      ].join('\n')

      const greenhouseLib = `
        declare const date: Date;

        ${Actionables}
        ${Sensors}

        interface EmitterSensor {
          id: string
          sensor: string
          name: string
          range: {
            min: number
            max: number
          }
          lastStatement?: {
            value: string
            sentAt: string
            source: string
          }
        }

        interface Actionable {
          id: string
          target: string
          name: string
          valueType: {
            range: '0-1' | '1-1024'
            default: string
          }
          lastAction?: {
            value: string
            sentAt: string
          }
        }

        declare const emitterSensors: Map<string, EmitterSensor>;
        declare const actionables: Map<string, Actionable>;
      `

      instance.languages.typescript.javascriptDefaults.addExtraLib(
        greenhouseLib,
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
        onChange={(_, value) => onChange(value || '')}
      />
    </div>
  )
}
