import { useMutation } from "react-query";
import { atomWithQuery } from "jotai/query";
import { api } from "../../api";
import { queryClient } from "../../app/App/queryClient";
import { Hardware } from "./hardware";

export const hardwareAtom = atomWithQuery(() => ({
  queryKey: "GET /api/hardware",
  async queryFn() {
    const { data } = await api.get<Hardware[]>("/api/hardware");

    return data;
  },
}));

export function useUpdateHardware() {
  return useMutation<void, unknown, Pick<Hardware, "path" | "name">>(
    (hardware) =>
      api.post("/api/hardware/update", {
        path: hardware.path,
        name: hardware.name,
      }),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/hardware"),
    }
  );
}

export function useRestartHardware() {
  return useMutation<void, unknown, Pick<Hardware, "path">>((hardware) =>
    api.post("/api/hardware/restart", { path: hardware.path })
  );
}
