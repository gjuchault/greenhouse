import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  Pane,
  Heading,
  Select,
  TextInput,
  Text,
  Button,
  majorScale,
} from "evergreen-ui";
import { CodeEditor } from "../../../../components/CodeEditor";
import { useActionables } from "../../../actionables";
import { useSensors } from "../../../sensors";
import { formatDistance } from "../../../../helpers/date";
import { useCreateRule, useRules } from "../../queries";
import { useMemoizedSorted } from "./useMemoizedSorted";
import { makeGreenhouseTypescriptEnvironment } from "../../rule";

interface CommandForm {
  target: string;
  value: string;
  expiresIn: string;
}

export function Rules() {
  const { data: rules } = useRules();
  const { data: actionablesMap } = useActionables();
  const { data: sensorsMap } = useSensors();

  const [createRule, { status: createRuleStatus }] = useCreateRule();

  const actionables = useMemoizedSorted(actionablesMap, ({ name }) => name);
  const sensors = useMemoizedSorted(sensorsMap, ({ name }) => name);
  const commands = useMemoizedSorted(rules?.commands, ({ target }) => target);

  const [rule, setRule] = useState("");
  useEffect(() => {
    setRule(rules?.rule.content || "");
  }, [rules]);

  const { handleSubmit, register, watch, control } = useForm<CommandForm>();
  const watchTarget = watch("target");

  async function createCommand(form: CommandForm) {
    await createRule({
      kind: "command",
      ...form,
    });
  }

  async function updateRule(newContent: string) {
    await createRule({
      kind: "customRule",
      rule: newContent,
    });
  }

  return (
    <Card
      background="white"
      padding={majorScale(3)}
      elevation={1}
      margin={majorScale(3)}
    >
      <Heading size={800} marginBottom={majorScale(3)}>
        Contrôle manuel
      </Heading>
      <Pane>
        <form onSubmit={handleSubmit(createCommand)}>
          <Pane
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            marginTop={majorScale(2)}
            marginBottom={majorScale(2)}
          >
            <Pane>
              <Controller
                control={control}
                name="target"
                defaultValue={actionables[0]?.target}
                render={({ onChange, value, ref }) => (
                  <Select
                    ref={ref}
                    marginRight={majorScale(1)}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  >
                    <option>Choisir une cible</option>
                    {actionables.map((actionable) => {
                      return (
                        <option key={actionable.id} value={actionable.target}>
                          {actionable.name}
                        </option>
                      );
                    })}
                  </Select>
                )}
              />
            </Pane>
            <Pane>
              {actionablesMap?.get(watchTarget)?.valueType.range === "0-1" ? (
                <Controller
                  control={control}
                  name="value"
                  defaultValue="0"
                  render={({ onChange, value, ref }) => (
                    <Select
                      ref={ref}
                      width={100}
                      marginRight={majorScale(2)}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                    </Select>
                  )}
                />
              ) : (
                <TextInput
                  type="number"
                  name="value"
                  ref={register}
                  placeholder="Valeur"
                  width="100px"
                  min="1"
                  max="1024"
                  marginRight={majorScale(2)}
                />
              )}
            </Pane>
            <TextInput
              type="datetime-local"
              name="date"
              ref={register}
              placeholder="Minutes"
              width="175px"
              marginRight={majorScale(2)}
            />
            <Button type="submit">Appliquer</Button>
          </Pane>
        </form>

        <Pane display="flex" marginBottom={majorScale(3)}>
          {commands.map((rule, i, { length }) => (
            <Card
              key={rule.id}
              elevation={1}
              display="flex"
              flexDirection="column"
              padding={majorScale(2)}
              marginRight={i === length - 1 ? 0 : majorScale(2)}
            >
              <Text marginBottom={majorScale(1)}>Cible: {rule.target}</Text>
              <Text marginBottom={majorScale(1)}>Valeur: {rule.value}</Text>
              <Text>Expire: {formatDistance(rule.expiresIn)}</Text>
            </Card>
          ))}
        </Pane>
      </Pane>

      <Heading size={800} marginBottom={majorScale(3)}>
        Moteur de règles
      </Heading>
      <Pane>
        <Button
          type="button"
          appearance="primary"
          disabled={createRuleStatus === "loading"}
          onClick={() => updateRule(rule)}
          marginBottom={majorScale(2)}
        >
          Sauvegarder
        </Button>
        <CodeEditor
          value={rule}
          onChange={setRule}
          typescriptEnvironment={makeGreenhouseTypescriptEnvironment(
            actionables,
            sensors
          )}
        />
      </Pane>
    </Card>
  );
}
