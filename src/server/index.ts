import path from "path";
import { config as dotenv } from "dotenv";
import { buildListenArduino, Arduino } from "./arduino";
import { buildParseSensors } from "./sensors";
import { buildStorage, SensorsConfig } from "./storage";
const { version } = require("../../package.json");

dotenv({ path: path.resolve(__dirname, "../../.env.local") });
dotenv({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  console.log(`Greenhouse v${version}`);
  const storage = buildStorage();

  let sensorsConfig: SensorsConfig;
  try {
    await storage.connect();
    sensorsConfig = await storage.getSensors();
    console.log("Storage connected");
  } catch (err) {
    console.log("Couldn't connect to database");
    console.log(err);
    process.exit(1);
  }

  if (process.env.MOCK_ARDUINO) {
    console.log("Skipped arduino");
    return;
  }

  const listenArduino = buildListenArduino();
  const parseSensors = buildParseSensors(sensorsConfig);
  let arduino: Arduino;

  try {
    arduino = await listenArduino();
    console.log("Arduino connected");
  } catch (err) {
    console.log("Couldn't initialize an Arduino");
    console.log(err);
    process.exit(1);
  }

  arduino.on("line", async (data: string) => {
    const sensors = parseSensors(data);

    if (!sensors) {
      return;
    }

    console.log("Arduino data", JSON.stringify(sensors));

    await storage.postStatement(sensors);
  });
}

main();
