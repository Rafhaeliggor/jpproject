import React from 'react'
import styles from './Typography.module.css'

interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

export function H1({ children, className, as: Tag = 'h1' }: TypographyProps) {
  return <Tag className={`${styles.h1} ${className ?? ''}`}>{children}</Tag>
}

export function H2({ children, className, as: Tag = 'h2' }: TypographyProps) {
  return <Tag className={`${styles.h2} ${className ?? ''}`}>{children}</Tag>
}

export function H3({ children, className, as: Tag = 'h3' }: TypographyProps) {
  return <Tag className={`${styles.h3} ${className ?? ''}`}>{children}</Tag>
}

export function H4({ children, className, as: Tag = 'h4' }: TypographyProps) {
  return <Tag className={`${styles.h4} ${className ?? ''}`}>{children}</Tag>
}

export function Body({ children, className, as: Tag = 'p' }: TypographyProps) {
  return <Tag className={`${styles.body} ${className ?? ''}`}>{children}</Tag>
}

export function Label({ children, className, as: Tag = 'span' }: TypographyProps) {
  return <Tag className={`${styles.label} ${className ?? ''}`}>{children}</Tag>
}

export function Caption({ children, className, as: Tag = 'small' }: TypographyProps) {
  return <Tag className={`${styles.caption} ${className ?? ''}`}>{children}</Tag>
}