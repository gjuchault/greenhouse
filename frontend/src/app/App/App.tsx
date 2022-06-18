import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
import { Pane, useTheme } from "evergreen-ui";
import { Auth } from "../../modules/auth";
import { Sensors } from "../../modules/sensors";
import { Logs } from "../../modules/logs";
import { Actionables } from "../../modules/actionables";
import { Rules } from "../../modules/rules";
import { Hardwares } from "../../modules/hardware";
import { Sidebar } from "../Sidebar";
import { queryClient } from "./queryClient";
import { QueryClientProvider } from "react-query";

export function App() {
  const theme = useTheme();

  return (
    <Pane
      display="flex"
      minHeight="100%"
      background={theme.fills.neutral.backgroundColor}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <Auth
            renderApp={() => {
              return (
                <>
                  <Sidebar />
                  <Pane flex="1">
                    <Routes>
                      <Route path="/" element={<Navigate to="/sensors" />} />
                      <Route path="/sensors" element={<Sensors />} />
                      <Route path="/rules" element={<Rules />} />
                      <Route path="/hardware" element={<Hardwares />} />
                      <Route path="/actionables" element={<Actionables />} />
                      <Route path="/logs" element={<Logs />} />
                    </Routes>
                  </Pane>
                </>
              );
            }}
          />
        </Router>
      </QueryClientProvider>
    </Pane>
  );
}
