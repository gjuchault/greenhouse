import { useMutation } from "react-query";
import { api } from "../../api";

type LoginBody = {
  user: string;
  password: string;
};

type LoginResponse =
  | { outcome: "notLoggedIn"; reason: "invalidBody" }
  | { outcome: "notLoggedIn"; reason: "userNotFound" }
  | { outcome: "notLoggedIn"; reason: "invalidPassword" }
  | { outcome: "loggedIn"; name: string; token: string };

export function useLogin() {
  return useMutation<LoginResponse, unknown, LoginBody>(
    async (body) => (await api.post("/api/login", body)).data
  );
}
