import React, { useState } from "react";
import { isLoggedIn, getName, offlineLogin } from "../authStorage";
import { Login } from "./Login";

interface AuthProps {
  renderApp(): JSX.Element;
}

export function Auth({ renderApp }: AuthProps): JSX.Element {
  const isAuth = isLoggedIn();
  const name = getName();

  const [auth, setAuth] = useState({
    isLoggedIn: isAuth,
    name: name,
  });

  function handleUserLoggedIn(name: string, token: string) {
    setAuth({
      name,
      isLoggedIn: true,
    });

    offlineLogin(name, token);
  }

  if (auth.isLoggedIn) {
    return renderApp();
  }

  return <Login onLoggedIn={handleUserLoggedIn} />;
}
