'use client'

import { useState, useEffect, useRef } from 'react'
import ContadorRegressivo from '../ContadorRegressivo/ContadorRegressivo'
import SettingsModal from '../SettingsModal/SettingsModal'
import styles from './Header.module.css'

interface HeaderProps {
  targetDate?: Date | string
  userName?: string
}

export default function Header({
  targetDate = '2027-02-10T00:00:00',
  userName = 'Iggor Rafhael',
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedFont = localStorage.getItem('settings-font')
    const savedContrast = localStorage.getItem('settings-contrast')
    if (savedFont) document.documentElement.setAttribute('data-font', savedFont)
    if (savedContrast) document.documentElement.setAttribute('data-contrast', savedContrast)
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

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <ContadorRegressivo targetDate={targetDate} />

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
              </div>
            )}
          </div>
        </div>
      </header>

      <SettingsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
