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
  range: {
    min: number;
    max: number;
  };
}

export interface Statement {
  id: string;
  sensorId: string;
  value: string;
  date: string;
  source: string;
}

export interface StatementInput {
  sensorId: string;
  value: string;
  date: string;
  source: string;
}
