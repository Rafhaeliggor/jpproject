'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './ContadorRegressivo.module.css'

export interface ContadorRegressivoProps {
  targetDate: Date | string
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes }
}

export default function ContadorRegressivo({
  targetDate,
  className,
}: ContadorRegressivoProps) {
  const target = useMemo(
    () => typeof targetDate === 'string' ? new Date(targetDate) : targetDate,
    [targetDate],
  )

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(calcTimeLeft(target))
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 60_000)
    return () => clearInterval(id)
  }, [target])

  if (!timeLeft) {
    return (
      <div
        className={[styles.contador, className].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
    )
  }

  const { days, hours, minutes } = timeLeft

  return (
    <div
      className={[styles.contador, className].filter(Boolean).join(' ')}
      aria-label={`${days} dias, ${hours} horas e ${minutes} minutos restantes`}
      role="timer"
    >
      <span className={styles.text}>
        {days}日{String(hours).padStart(2, '0')}時
        {String(minutes).padStart(2, '0')}分
      </span>
    </div>
  )
}
