import { atomWithQuery } from "jotai/query";
import { api } from "../../api";

export const logsAtom = atomWithQuery(() => ({
  queryKey: "GET /api/logs",
  async queryFn() {
    const { data } = await api.get<[string, string, string][]>("/api/logs");

    return data.map(([date, service, message]) => ({
      date: new Date(date),
      service,
      message,
    }));
  },
}));
