import React from 'react'
import {
  Pane,
  Button,
  Card,
  TextInput,
  Heading,
  majorScale,
} from 'evergreen-ui'

import { useLogin } from '../../hooks/useQuery'
import { useTextInput } from '../../hooks/useInput'

type LoginProps = {
  onLoggedIn: (name: string, token: string) => void
}

export function Login({ onLoggedIn }: LoginProps) {
  const [name, setName] = useTextInput('')
  const [password, setPassword] = useTextInput('')
  const [sendLogin, { isLoading }] = useLogin()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await sendLogin({ user: name, password })

    if (res && res.outcome === 'loggedIn') {
      onLoggedIn(res.name, res.token)
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
          Serre
        </Heading>
        <form onSubmit={login}>
          <Pane display="flex" flexDirection="column">
            <TextInput
              type="text"
              disabled={isLoading}
              placeholder="Nom"
              marginBottom={majorScale(2)}
              onChange={setName}
            />
            <TextInput
              type="password"
              disabled={isLoading}
              placeholder="Mot de passe"
              marginBottom={majorScale(2)}
              onChange={setPassword}
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
  )
}
