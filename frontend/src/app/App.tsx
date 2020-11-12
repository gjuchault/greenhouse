import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { Pane, useTheme } from "evergreen-ui";
import { Auth } from "../modules/auth";
import { Sidebar } from "./Sidebar";

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
            return <Sidebar />;
          }}
        />
      </Router>
    </Pane>
  );
}
