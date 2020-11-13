import { useQuery } from "react-query";
import { api, Response } from "../../api";

export const useLogs = () => {
  const q = useQuery<Response<[string, string, string][]>, string>(
    "GET /api/logs",
    () => api.get("/api/logs")
  );

  console.log(q.data);

  return {
    ...q,
    data: q.data?.data.map(([date, service, message]) => ({
      date: new Date(date),
      service,
      message,
    })),
  };
};
