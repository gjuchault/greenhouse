import React from 'react'

import { Card } from '../../components/Card/Card'

import { useLogin } from '../../hooks/useQuery'
import { useTextInput } from '../../hooks/useInput'

import styles from './Login.module.css'

type LoginProps = {
  onLoggedIn: (name: string, token: string) => void
}

type LoginBody = {
  user: string
  password: string
}

type LoginResponse =
  | { outcome: 'notLoggedIn'; reason: 'invalidBody' }
  | { outcome: 'notLoggedIn'; reason: 'userNotFound' }
  | { outcome: 'notLoggedIn'; reason: 'invalidPassword' }
  | { outcome: 'loggedIn'; name: string; token: string }

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
    <div className={styles.login}>
      <Card className={styles.card}>
        <h3 className={styles.title}>Serre</h3>
        <form className={styles.form} onSubmit={login}>
          <input
            type="text"
            disabled={isLoading}
            placeholder="Nom"
            onChange={setName}
          />
          <input
            type="password"
            disabled={isLoading}
            placeholder="Mot de passe"
            onChange={setPassword}
          />
          <button type="submit" disabled={isLoading}>
            Connexion
          </button>
        </form>
      </Card>
    </div>
  )
}
