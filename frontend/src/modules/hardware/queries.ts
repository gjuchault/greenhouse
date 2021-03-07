import { useMutation, useQuery, queryCache } from "react-query";
import { api, Response } from "../../api";
import { Hardware } from "./hardware";

export function useHardware() {
  const q = useQuery<Response<Hardware[]>, string>("GET /api/hardware", () =>
    api.get("/api/hardware")
  );

  return {
    ...q,
    data: q.data ? q.data.data : undefined,
  };
}

export function useUpdateHardware() {
  return useMutation<void, unknown, Pick<Hardware, "path" | "name">>(
    (hardware) =>
      api.post("/api/hardware/update", {
        path: hardware.path,
        name: hardware.name,
      }),
    {
      onSuccess: () => queryCache.invalidateQueries("GET /api/hardware"),
    }
  );
}

export function useRestartHardware() {
  return useMutation<void, unknown, Pick<Hardware, "path">>((hardware) =>
    api.post("/api/hardware/restart", { path: hardware.path })
  );
}
