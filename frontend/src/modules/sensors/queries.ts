import { useQuery, useMutation, queryCache } from "react-query";
import { api, Response } from "../../api";
import { Sensor, SensorInput } from "./sensor";

export const useSensors = () => {
  const q = useQuery<Response<[string, Sensor][]>, string>(
    "GET /api/sensors",
    () => api.get("/api/sensors")
  );

  return {
    ...q,
    data: q.data ? new Map(q.data.data) : undefined,
  };
};

export const useCreateSensor = () =>
  useMutation<void, unknown, SensorInput>(
    (sensorInput) => api.post(`/api/sensors`, sensorInput),
    {
      onSuccess: () => queryCache.invalidateQueries("GET /api/sensors"),
    }
  );

export const useRemoveSensor = () =>
  useMutation<void, unknown, { id: string }>(
    ({ id }) => api.delete(`/api/sensors/${id}`),
    {
      onSuccess: () => queryCache.invalidateQueries("GET /api/sensors"),
    }
  );
