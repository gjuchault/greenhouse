import React from "react";
import { Pane, Spinner } from "evergreen-ui";

export function SuspenseSpinner() {
  return (
    <Pane
      display="flex"
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </Pane>
  );
}
