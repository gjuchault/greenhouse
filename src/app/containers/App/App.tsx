import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom'
import { Pane, useTheme } from 'evergreen-ui'
import { Provider as AuthProvider } from '../../context/auth'
import { isLoggedIn, getName, offlineLogin } from '../../auth'
import { Login } from '../Login/Login'
import { Sidebar } from '../../components/Sidebar/Sidebar'
import { Sensors } from '../Sensors/Sensors'
import { Actionables } from '../Actionables/Actionables'
import { Rules } from '../Rules/Rules'
import { Logs } from '../Logs/Logs'

export function App() {
  const theme = useTheme()

  const isAuth = isLoggedIn()
  const name = getName()

  const [auth, setAuth] = useState({
    isLoggedIn: isAuth,
    name: name,
  })

  function handleLoggedIn(name: string, token: string) {
    setAuth({
      name,
      isLoggedIn: true,
    })

    offlineLogin(name, token)
  }

  return (
    <Pane
      display="flex"
      minHeight="100%"
      background={theme.palette.neutral.lightest}
    >
      <Router>
        <AuthProvider value={auth}>
          {!auth.isLoggedIn && <Login onLoggedIn={handleLoggedIn} />}
          {auth.isLoggedIn && <Sidebar />}
          {auth.isLoggedIn && (
            <Pane flex="1">
              <Switch>
                <Route exact path="/">
                  <Redirect to="/sensors" />
                </Route>
                <Route path="/sensors">
                  <Sensors />
                </Route>
                <Route path="/rules">
                  <Rules />
                </Route>
                <Route path="/actionables">
                  <Actionables />
                </Route>
                <Route path="/logs">
                  <Logs />
                </Route>
              </Switch>
            </Pane>
          )}
        </AuthProvider>
      </Router>
    </Pane>
  )
}
