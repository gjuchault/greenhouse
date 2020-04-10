import { buildListenArduino, Arduino } from "./arduino";
import { buildParseSensors } from "./sensors";
const { version } = require("../package.json");

async function main() {
  console.log(`Greenhouse v${version}`);
  const listenArduino = buildListenArduino();
  const parseSensors = buildParseSensors();
  let arduino: Arduino;

  try {
    arduino = await listenArduino();
  } catch (err) {
    console.log("Couldn't initialize an Arduino");
    console.log(err);
    process.exit(1);
  }

  arduino.on("line", (data: string) => {
    const sensors = parseSensors(data);

    console.log(sensors);
  });
}

main();
