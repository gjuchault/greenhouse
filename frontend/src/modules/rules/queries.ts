import { atomWithQuery } from "jotai/query";
import { useMutation } from "react-query";
import { api } from "../../api";
import { queryClient } from "../../app/App/queryClient";
import { CustomRule, Command, RuleInput } from "./rule";

export const rulesAtom = atomWithQuery(() => ({
  queryKey: "GET /api/rule",
  async queryFn() {
    const { data } = await api.get<{
      rule: CustomRule;
      commands: [string, Command][];
    }>("/api/rule");

    return {
      rule: data.rule,
      commands: new Map(data.commands),
    };
  },
}));

export function useCreateRule() {
  return useMutation<void, unknown, RuleInput>(
    (body) => api.post("/api/rule", body),
    {
      onSuccess: () => queryClient.invalidateQueries("GET /api/rule"),
    }
  );
}
