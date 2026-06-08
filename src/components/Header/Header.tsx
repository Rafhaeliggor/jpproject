'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ContadorRegressivo from '../ContadorRegressivo/ContadorRegressivo'
import SettingsModal from '../SettingsModal/SettingsModal'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Header.module.css'

const DEFAULT_TRAVEL_DATE = '2027-02-10T00:00:00'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [travelDate, setTravelDate] = useState(DEFAULT_TRAVEL_DATE)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedFont = localStorage.getItem('settings-font')
    const savedContrast = localStorage.getItem('settings-contrast')
    const savedA11yContrast = localStorage.getItem('settings-a11y-contrast')
    const savedDate = localStorage.getItem('settings-travel-date')
    if (savedFont) document.documentElement.setAttribute('data-font', savedFont)
    if (savedContrast) document.documentElement.setAttribute('data-contrast', savedContrast)
    document.documentElement.setAttribute('data-a11y-contrast', savedA11yContrast === 'true' ? 'true' : 'false')
    if (savedDate) setTravelDate(savedDate)
  }, [])

  useEffect(() => {
    function handleDateChange(e: Event) {
      const date = (e as CustomEvent<{ date: string }>).detail?.date
      if (date) setTravelDate(date)
    }
    window.addEventListener('travel-date-change', handleDateChange)
    return () => window.removeEventListener('travel-date-change', handleDateChange)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  function handleLogout() {
    setDropdownOpen(false)
    logout()
    router.replace('/login')
  }

  const userName = user?.name ?? ''

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <ContadorRegressivo targetDate={travelDate} />

          <div className={styles.userWrapper} ref={wrapperRef}>
            <button
              className={styles.userInfo}
              aria-label={`Usuário: ${userName}`}
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span>{userName}</span>
              <i className="bi bi-person-circle" aria-hidden="true" />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown} role="menu">
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => {
                    setDropdownOpen(false)
                    setModalOpen(true)
                  }}
                >
                  <i className="bi bi-gear" aria-hidden="true" />
                  <span>Configurações</span>
                </button>

                <div className={styles.dropdownSeparator} />

                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <SettingsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
