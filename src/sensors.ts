interface Sensors {
  /**
   * HC-SR04 distance in centimeters
   */
  distance: number;

  /**
   * Thermoresistence temperature in °C
   */
  temperature: number;

  /**
   * Light between 0 and 100
   */
  light: number;
}

const MAX_RAW_LIGHT = 1024;

export function buildParseSensors() {
  function parse(line: string): Sensors {
    const [rawTemperature, rawDistance, rawLight] = line.split(";");

    return {
      distance: Number(rawDistance),
      temperature: Number(rawTemperature),
      light: (Number(rawLight) / MAX_RAW_LIGHT) * 100,
    };
  }

  return parse;
}
