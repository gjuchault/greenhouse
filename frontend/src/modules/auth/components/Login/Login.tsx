import React from "react";
import {
  Pane,
  Card,
  Heading,
  TextInput,
  Button,
  majorScale,
} from "evergreen-ui";
import { useForm } from "react-hook-form";
import { useLogin } from "../../api";

interface LoginProps {
  onLoggedIn(name: string, token: string): void;
}

interface LoginForm {
  user: string;
  password: string;
}

export function Login({ onLoggedIn }: LoginProps) {
  const { handleSubmit, register } = useForm<LoginForm>();
  const { mutateAsync: sendLogin, isLoading } = useLogin();

  async function login(form: LoginForm) {
    const res = await sendLogin(form);

    if (res && res.outcome === "loggedIn") {
      onLoggedIn(res.name, res.token);
    }
  }

  return (
    <Pane
      display="flex"
      flex="1"
      justifyContent="center"
      alignItems="center"
      marginTop="-20vh"
    >
      <Card elevation={2} padding={majorScale(3)} background="white">
        <Heading textAlign="center" marginBottom={majorScale(2)} size={700}>
          {process.env.APP_NAME}
        </Heading>
        <form onSubmit={handleSubmit(login)}>
          <Pane display="flex" flexDirection="column">
            <TextInput
              {...register("user")}
              type="text"
              disabled={isLoading}
              placeholder="Nom"
              marginBottom={majorScale(2)}
            />
            <TextInput
              {...register("password")}
              type="password"
              disabled={isLoading}
              placeholder="Mot de passe"
              marginBottom={majorScale(2)}
            />
            <Button
              appearance="primary"
              type="submit"
              disabled={isLoading}
              justifyContent="center"
            >
              Connexion
            </Button>
          </Pane>
        </form>
      </Card>
    </Pane>
  );
}
