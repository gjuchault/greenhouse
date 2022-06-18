import { useQuery, useMutation } from "react-query";
import { api, Response } from "../../api";
import { queryClient } from "../../app/App/queryClient";
import { CustomRule, Command, RuleInput } from "./rule";

export function useRules() {
  const q = useQuery<
    Response<{ rule: CustomRule; commands: [string, Command][] }>,
    string
  >("GET /api/rule", () => api.get("/api/rule"));

  return {
    ...q,
    data: q.data
      ? {
          rule: q.data.data.rule,
          commands: new Map(q.data.data.commands),
        }
      : undefined,
  };
}

export function useCreateRule() {
  return useMutation<void, unknown, RuleInput>(
    (body) => api.post("/api/rule", body),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/rule"),
    }
  );
}
