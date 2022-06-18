import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useAtom } from "jotai";
import { Card, Pane, Heading, Button, majorScale } from "evergreen-ui";
import { CodeEditor } from "../../../../components/CodeEditor";
import { actionablesAtom } from "../../../actionables";
import { sensorsAtom } from "../../../sensors";
import { useCreateRule, rulesAtom } from "../../queries";
import { useMemoizedSorted } from "./useMemoizedSorted";
import { makeGreenhouseTypescriptEnvironment } from "../../rule";
import { SuspenseSpinner } from "../../../../components/SuspenseSpinner";

export function Rules() {
  return (
    <Suspense fallback={<SuspenseSpinner />}>
      <SuspensedRules />
    </Suspense>
  );
}

function SuspensedRules() {
  const [rules] = useAtom(rulesAtom);
  const [sensorsMap] = useAtom(sensorsAtom);
  const [actionablesMap] = useAtom(actionablesAtom);

  const { mutateAsync: createRule, status: createRuleStatus } = useCreateRule();

  const actionables = useMemoizedSorted(actionablesMap, ({ name }) => name);
  const sensors = useMemoizedSorted(sensorsMap, ({ name }) => name);

  const [rule, setRule] = useState("");
  const [initialRule, setInitialRule] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (rules && initialRule === undefined) {
      setRule(rules?.rule.content || "");
      setInitialRule(rules?.rule.content || "");
    }
  }, [rules, initialRule]);

  const hasUnsavedRule = useMemo(() => rule !== initialRule, [
    rule,
    initialRule,
  ]);

  async function updateRule(newContent: string) {
    await createRule({
      rule: newContent,
    });

    setInitialRule(newContent);
  }

  async function validate() {
    const Actionables: Record<string, string> = {};
    for (const actionable of actionables) {
      Actionables[actionable.name] = actionable.target;
    }

    const Sensors: Record<string, string> = {};
    for (const sensor of sensors) {
      Sensors[sensor.name] = sensor.sensor;
    }

    if (!rule.trim().endsWith("motors;")) {
      alert("Les règles doivent terminer par 'motors;'");
      return;
    }

    const sensorBySensor = new Map(
      sensors.map((sensor) => [sensor.sensor, sensor])
    );
    const actionableByTarget = new Map(
      actionables.map((actionable) => [actionable.target, actionable])
    );

    const ruleWithReturn = rule.trim().replace(/motors;$/, "return motors;");

    const result: Map<string, string> = new Map(
      actionables.map((target) => [target.target, "1"])
    );

    try {
      // eslint-disable-next-line no-new-func
      const executeRules = new Function(
        "date",
        "sensors",
        "actionables",
        "Actionables",
        "Sensors",
        ruleWithReturn
      );

      const output: Map<string, string> = executeRules(
        new Date(),
        sensorBySensor,
        actionableByTarget,
        Actionables,
        Sensors
      );

      for (const [key, value] of Array.from(output.entries())) {
        result.set(key, value.toString());
      }

      const formattedOutput = Array.from(result.entries()).reduce(
        (acc, [target, value]) => {
          const actionable = actionableByTarget.get(target);

          return acc + `${actionable?.name}: ${value}\n`;
        },
        ""
      );

      alert(
        "Valide. À l'heure actuelle, les moteurs seraient mis à\n" +
          formattedOutput
      );
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Card
        background="white"
        padding={majorScale(3)}
        elevation={1}
        margin={majorScale(3)}
      >
        <Heading size={900} marginBottom={majorScale(3)}>
          Moteur de règles
        </Heading>
        <Pane>
          <Button
            type="button"
            appearance="primary"
            disabled={createRuleStatus === "loading" || !hasUnsavedRule}
            onClick={() => updateRule(rule)}
            marginBottom={majorScale(2)}
          >
            Sauvegarder
          </Button>
          <Button
            type="button"
            appearance="default"
            marginLeft={majorScale(2)}
            onClick={() => validate()}
            marginBottom={majorScale(2)}
          >
            Valider
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
    </>
  );
}
