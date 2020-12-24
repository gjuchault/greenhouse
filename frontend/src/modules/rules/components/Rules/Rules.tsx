import React, { useState, useEffect, useMemo } from "react";
import { Prompt } from "react-router";
import { Card, Pane, Heading, Button, majorScale } from "evergreen-ui";
import { CodeEditor } from "../../../../components/CodeEditor";
import { useActionables } from "../../../actionables";
import { useSensors } from "../../../sensors";
import { useCreateRule, useRules } from "../../queries";
import { useMemoizedSorted } from "./useMemoizedSorted";
import { makeGreenhouseTypescriptEnvironment } from "../../rule";

export function Rules() {
  const { data: rules } = useRules();
  const { data: actionablesMap } = useActionables();
  const { data: sensorsMap } = useSensors();

  const [createRule, { status: createRuleStatus }] = useCreateRule();

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

  return (
    <>
      <Prompt
        when={hasUnsavedRule}
        message="Vous n'avez pas sauvegardé la règle, êtes-vous sûr de vouloir quitter la page ?"
      />
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
