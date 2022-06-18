import vm from "vm";
import { Logger } from "winston";
import { Sensor } from "../sensors/sensor";
import { CustomRule, Command } from "./rule";
import { Actionable } from "../actionables";
import { GreenhouseEvents } from "../../events";
import { isIterable } from "../../helpers/iterables";
import { debounce } from "../../helpers/debounce";

interface ExecuteRulesDependencies {
  logger: Logger;
  events: GreenhouseEvents;
  listRule(): Promise<CustomRule>;
  listCommands(): Promise<Map<string, Command>>;
  listSensors(): Promise<Map<string, Sensor>>;
  listActionables(): Promise<Map<string, Actionable>>;
  setLastActionablesValues(lastValues: Map<string, string>): Promise<void>;
}

export function buildExecuteRules({
  logger,
  events,
  listRule,
  listCommands,
  listSensors,
  listActionables,
  setLastActionablesValues,
}: ExecuteRulesDependencies) {
  let isRunning = false;

  async function executeRules() {
    if (isRunning) {
      return;
    }

    isRunning = true;

    const [rule, commands, sensors, actionables] = await Promise.all([
      listRule(),
      listCommands(),
      listSensors(),
      listActionables(),
    ]);

    const now = new Date();

    let result: Map<string, string> = new Map(
      Object.keys(actionables).map((target) => [target, "1"])
    );

    const Actionables: Record<string, string> = {};
    for (const actionable of actionables.values()) {
      Actionables[actionable.name] = actionable.target;
    }

    const Sensors: Record<string, string> = {};
    for (const sensor of sensors.values()) {
      Sensors[sensor.name] = sensor.sensor;
    }

    const vmContext = vm.createContext({
      date: now,
      sensors,
      actionables,
      Actionables,
      Sensors,
    });

    try {
      const output = vm.runInContext(rule.content, vmContext);

      if (!isIterable(output)) {
        logger.error(new Error(`${JSON.stringify(output)}`));
      }

      for (const [key, value] of output as Map<string, number>) {
        result.set(key, value.toString());
      }
    } catch (err) {
      logger.error(err);
    }

    for (const command of commands.values()) {
      if (command.expiresAt <= now) {
        result.set(command.target, command.value.toString());
      }
    }

    const newActionablesValues = new Map(
      Array.from(result).filter(([target, value]) => {
        return value !== actionables.get(target)?.lastAction?.value?.toString();
      })
    );

    for (const [target, value] of newActionablesValues) {
      logger.info(`${target} : ${value}`);

      events.emit("rule:updateActionable", { target, value });
      events.emit("command:send", { target, value });
    }

    await setLastActionablesValues(newActionablesValues);
    isRunning = false;
  }

  return executeRules;
}
