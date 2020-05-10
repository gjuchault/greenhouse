import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { Provider as AuthProvider } from '../../context/auth'
import { isLoggedIn, getName, offlineLogin } from '../../auth'
import { Login } from '../Login/Login'
import { Sidebar } from '../../components/Sidebar/Sidebar'
import { LiveMap } from '../LiveMap/LiveMap'
import { Rules } from '../Rules/Rules'

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
    <Router>
      <AuthProvider value={auth}>
        {!auth.isLoggedIn && <Login onLoggedIn={handleLoggedIn} />}
        {auth.isLoggedIn && <Sidebar />}
        {auth.isLoggedIn && (
          <main>
            <Route path="/map">
              <LiveMap />
            </Route>
            <Route path="/rules">
              <Rules />
            </Route>
          </main>
        )}
      </AuthProvider>
    </Router>
  )
}
