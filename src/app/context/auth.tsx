import React from 'react'

export const context = React.createContext<{
  isLoggedIn: boolean
  name: string | null
}>({
  isLoggedIn: false,
  name: null,
})

context.displayName = 'AuthContext'

export const Provider = context.Provider
export const Consumer = context.Consumer
