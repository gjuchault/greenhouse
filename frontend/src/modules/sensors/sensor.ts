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

export interface SensorInput {
  sensor: string;
  name: string;
  min: number;
  max: number;
}
