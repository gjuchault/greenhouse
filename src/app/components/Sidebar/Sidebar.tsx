import React from 'react'
import Logout from './logout.svg'

import styles from './Sidebar.module.css'
import { offlineLogout } from '../../auth'

export function Sidebar() {
  const logout = () => {
    offlineLogout()
    location.reload()
  }

  return (
    <div className={styles.sidebar}>
      <button className={styles.button} onClick={logout}>
        <Logout />
      </button>
    </div>
  )
}
