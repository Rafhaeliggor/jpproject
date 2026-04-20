import React from 'react'
import styles from './Container.module.css'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  variant?: 'fixed' | 'fluid'
}

export default function Container({ children, className, variant = 'fixed' }: ContainerProps) {
  return (
    <div className={`${styles.container} ${styles[variant]} ${className ?? ''}`}>
      {children}
    </div>
  )
}
