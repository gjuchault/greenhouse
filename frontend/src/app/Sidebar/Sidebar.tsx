import React from "react";
import { useHistory } from "react-router-dom";
import { Pane, Text, Heading, useTheme, majorScale } from "evergreen-ui";
import { ReactComponent as Logout } from "./logout.svg";
import { ReactComponent as Sensors } from "./sensors.svg";
import { ReactComponent as Rules } from "./rules.svg";
import { ReactComponent as Actionables } from "./actionables.svg";
import { ReactComponent as Logs } from "./logs.svg";
import { ReactComponent as Bee } from "./bee.svg";
import { ReactComponent as Usb } from "./usb.svg";
import { ReactComponent as Fish } from "./fish.svg";
import styles from "./Sidebar.module.css";

import { offlineLogout } from "../../modules/auth";

const logos = new Map([
  ["bee", <Bee />],
  ["fish", <Fish />],
]);

export function Sidebar() {
  const theme = useTheme();
  const history = useHistory();

  const logout = () => {
    offlineLogout();
  };

  return (
    <Pane width="200px" background={theme.palette.blue.base}>
      <Pane display="flex" marginTop={majorScale(3)} justifyContent="center">
        {logos.get(process.env.APP_LOGO || "fish")}
      </Pane>
      <Heading
        color="white"
        textAlign="center"
        paddingTop="20px"
        paddingBottom="20px"
      >
        {process.env.APP_NAME}
      </Heading>
      <SidebarButton
        onClick={() => history.push("/sensors")}
        renderIcon={() => <Sensors />}
      >
        <Text color="white">Capteurs</Text>
      </SidebarButton>
      <SidebarButton
        onClick={() => history.push("/actionables")}
        renderIcon={() => <Actionables />}
      >
        <Text color="white">Actionables</Text>
      </SidebarButton>
      <SidebarButton
        onClick={() => history.push("/hardware")}
        renderIcon={() => <Usb />}
      >
        <Text color="white">Matériel USB</Text>
      </SidebarButton>
      <SidebarButton
        onClick={() => history.push("/rules")}
        renderIcon={() => <Rules />}
      >
        <Text color="white">Règles</Text>
      </SidebarButton>
      <SidebarButton
        onClick={() => history.push("/logs")}
        renderIcon={() => <Logs />}
      >
        <Text color="white">Logs</Text>
      </SidebarButton>
      <SidebarButton onClick={logout} renderIcon={() => <Logout />}>
        <Text color="white">Déconnexion</Text>
      </SidebarButton>
    </Pane>
  );
}

function SidebarButton(
  props: React.PropsWithChildren<{
    onClick: () => void;
    renderIcon: () => React.ReactNode;
  }>
) {
  return (
    <Pane
      display="flex"
      paddingLeft="20px"
      height="50px"
      onClick={props.onClick}
      className={styles.sidebarButton}
      cursor="pointer"
    >
      <Pane display="flex" alignItems="center">
        <Pane marginRight="12px">{props.renderIcon()}</Pane>
        {props.children}
      </Pane>
    </Pane>
  );
}
