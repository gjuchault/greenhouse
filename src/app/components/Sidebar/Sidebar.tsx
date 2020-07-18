import React from 'react'
import { useHistory } from 'react-router-dom'
import { Pane, Text, Heading, useTheme } from 'evergreen-ui'
import Logout from './logout.svg'
import Map from './map.svg'
import Rules from './rules.svg'
import Actionables from './actionables.svg'
import styles from './Sidebar.module.css'

import { offlineLogout } from '../../auth'

export function Sidebar() {
  const theme = useTheme()
  const history = useHistory()

  const logout = () => {
    offlineLogout()
    location.reload()
  }

  return (
    <Pane width="200px" background={theme.palette.blue.base}>
      <Heading
        color="white"
        textAlign="center"
        paddingTop="20px"
        paddingBottom="20px"
      >
        Serre
      </Heading>
      <SidebarButton
        onClick={() => history.push('/sensors')}
        renderIcon={() => <Map />}
      >
        <Text color="white">Capteurs</Text>
      </SidebarButton>
      <SidebarButton
        onClick={() => history.push('/actionables')}
        renderIcon={() => <Actionables />}
      >
        <Text color="white">Actionables</Text>
      </SidebarButton>
      <SidebarButton
        onClick={() => history.push('/rules')}
        renderIcon={() => <Rules />}
      >
        <Text color="white">Règles</Text>
      </SidebarButton>
      <SidebarButton onClick={logout} renderIcon={() => <Logout />}>
        <Text color="white">Déconnexion</Text>
      </SidebarButton>
    </Pane>
  )
}

function SidebarButton(
  props: React.PropsWithChildren<{
    onClick: () => void
    renderIcon: () => React.ReactNode
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
  )
}
