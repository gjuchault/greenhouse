import { useQuery, useMutation } from "react-query";
import { api, Response } from "../../api";
import { queryClient } from "../../app/App/queryClient";
import { Actionable, ActionableInput, CommandInput } from "./actionable";

export function useActionables() {
  const q = useQuery<Response<[string, Actionable][]>, string>(
    "GET /api/actionables",
    () => api.get("/api/actionables")
  );

  return {
    ...q,
    data: q.data ? new Map(q.data.data) : undefined,
  };
}

export function useRemoveActionable() {
  return useMutation<void, unknown, { id: string }>(
    ({ id }) => api.delete(`/api/actionables/${id}`),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/actionables"),
    }
  );
}

export function useUpdateActionable() {
  return useMutation<void, unknown, Actionable>(
    (actionable) => api.put(`/api/actionables/${actionable.id}`, actionable),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/actionables"),
    }
  );
}

export function useCreateActionable() {
  return useMutation<void, unknown, ActionableInput>(
    (actionableInput) => api.post(`/api/actionables`, actionableInput),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/actionables"),
    }
  );
}

export function useSendCommand() {
  return useMutation<void, unknown, CommandInput>(
    (commandInput) => api.post(`/api/commands`, commandInput),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/actionables"),
    }
  );
}
