import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { Pane, useTheme } from "evergreen-ui";
import { Auth } from "../../modules/auth";
import { Sensors } from "../../modules/sensors";
import { Logs } from "../../modules/logs";
import { Actionables } from "../../modules/actionables";
import { Rules } from "../../modules/rules";
import { Hardwares } from "../../modules/hardware";
import { Sidebar } from "../Sidebar";

export function App() {
  const theme = useTheme();

  return (
    <Pane
      display="flex"
      minHeight="100%"
      background={theme.palette.neutral.lightest}
    >
      <Router>
        <Auth
          renderApp={() => {
            return (
              <>
                <Sidebar />
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
                    <Route path="/hardware">
                      <Hardwares />
                    </Route>
                    <Route path="/actionables">
                      <Actionables />
                    </Route>
                    <Route path="/logs">
                      <Logs />
                    </Route>
                  </Switch>
                </Pane>
              </>
            );
          }}
        />
      </Router>
    </Pane>
  );
}
