import React from 'react'
import { useHistory } from 'react-router-dom'
import Logout from './logout.svg'
import Map from './map.svg'
import Rules from './rules.svg'

import styles from './Sidebar.module.css'
import { offlineLogout } from '../../auth'

export function Sidebar() {
  const history = useHistory()

  const logout = () => {
    offlineLogout()
    location.reload()
  }

  return (
    <div className={styles.sidebar}>
      <button className={styles.button} onClick={() => history.push('/map')}>
        <Map />
      </button>
      <button className={styles.button} onClick={() => history.push('/rules')}>
        <Rules />
      </button>
      <button className={styles.button} onClick={logout}>
        <Logout />
      </button>
    </div>
  )
}
