import { useContext } from 'react'
import { context } from '../context/auth'

export const useAuth = useContext(context)
