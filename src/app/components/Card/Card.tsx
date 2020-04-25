import React from 'react'
import cx from 'classnames'
import styles from './Card.module.css'

type Props = {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: Props) {
  return <div className={cx(styles.card, className)}>{children}</div>
}
