import { useMutation } from "react-query";
import { atomWithQuery } from "jotai/query";
import { api } from "../../api";
import { queryClient } from "../../app/App/queryClient";
import { Sensor, SensorInput } from "./sensor";

export const sensorsAtom = atomWithQuery(() => ({
  queryKey: "GET /api/sensors",
  async queryFn() {
    const { data } = await api.get<[string, Sensor][]>("/api/sensors");

    return new Map(data);
  },
}));

export function useCreateSensor() {
  return useMutation<void, unknown, SensorInput>(
    (sensorInput) => api.post(`/api/sensors`, sensorInput),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/sensors"),
    }
  );
}

export function useUpdateSensor() {
  return useMutation<void, unknown, Sensor>(
    (sensor) => api.put(`/api/sensors/${sensor.id}`, sensor),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/sensors"),
    }
  );
}

export function useRemoveSensor() {
  return useMutation<void, unknown, { id: string }>(
    ({ id }) => api.delete(`/api/sensors/${id}`),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/sensors"),
    }
  );
}
