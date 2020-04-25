import React, { useEffect, useState } from 'react'
import { Provider as AuthProvider } from '../../context/auth'
import { isLoggedIn, getName, offlineLogin } from '../../auth'
import { Login } from '../Login/Login'
import { Sidebar } from '../../components/Sidebar/Sidebar'

export function App() {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    name: '',
  })

  useEffect(() => {
    if (isLoggedIn()) {
      setAuth({
        isLoggedIn: true,
        name: getName(),
      })
    }
  }, [])

  function handleLoggedIn(name: string, token: string) {
    setAuth({
      name,
      isLoggedIn: true,
    })

    offlineLogin(name, token)
  }

  return (
    <AuthProvider value={auth}>
      {!auth.isLoggedIn && <Login onLoggedIn={handleLoggedIn} />}
      {auth.isLoggedIn && <Sidebar />}
    </AuthProvider>
  )
}
