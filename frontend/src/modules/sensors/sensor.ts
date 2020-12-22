export interface Sensor {
  id: string;
  sensor: string;
  name: string;
  range: {
    min: number;
    max: number;
  };
  lastStatement?: {
    value: string;
    sentAt: string;
    source: string;
  };
}

export const sensorNamePattern = /^[a-z0-9]+$/i;
export const sensorSensorPattern = /^[0-9]+$/;

export interface SensorInput {
  sensor: string;
  name: string;
  range: {
    min: number;
    max: number;
  };
}
