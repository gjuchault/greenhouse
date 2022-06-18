import { useMutation } from "react-query";
import { atomWithQuery } from "jotai/query";
import { api } from "../../api";
import { queryClient } from "../../app/App/queryClient";
import { Actionable, ActionableInput, CommandInput } from "./actionable";

export const actionablesAtom = atomWithQuery(() => ({
  queryKey: "GET /api/actionables",
  async queryFn() {
    const { data } = await api.get<[string, Actionable][]>("/api/actionables");

    return new Map(data);
  },
}));

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
