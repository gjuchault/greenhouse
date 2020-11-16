import { useQuery, useMutation, queryCache } from "react-query";
import { api, Response } from "../../api";
import { Sensor, SensorInput } from "./sensor";

export function useSensors() {
  const q = useQuery<Response<[string, Sensor][]>, string>(
    "GET /api/sensors",
    () => api.get("/api/sensors")
  );

  return {
    ...q,
    data: q.data ? new Map(q.data.data) : undefined,
  };
}

export function useCreateSensor() {
  return useMutation<void, unknown, SensorInput>(
    (sensorInput) => api.post(`/api/sensors`, sensorInput),
    {
      onSuccess: () => queryCache.invalidateQueries("GET /api/sensors"),
    }
  );
}

export function useRemoveSensor() {
  return useMutation<void, unknown, { id: string }>(
    ({ id }) => api.delete(`/api/sensors/${id}`),
    {
      onSuccess: () => queryCache.invalidateQueries("GET /api/sensors"),
    }
  );
}
