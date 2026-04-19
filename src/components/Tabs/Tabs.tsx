'use client'

import { useState } from 'react'
import styles from './Tabs.module.css'

export interface TabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabsProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSelect = (tab: string) => {
    onTabChange(tab)
    setMenuOpen(false)
  }

  return (
    <nav
      className={[styles.nav, className].filter(Boolean).join(' ')}
      aria-label="Navegação por seções"
    >
      <ul className={styles.list} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab === activeTab
          return (
            <li key={tab} role="presentation">
              <button
                role="tab"
                aria-selected={isActive}
                className={[styles.tab, isActive ? styles.active : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelect(tab)}
              >
                {tab}
              </button>
            </li>
          )
        })}
      </ul>

      <div className={styles.mobileMenu}>
        <button
          className={styles.mobileToggle}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
        >
          <i className="bi bi-list" aria-hidden="true" />
          <span>{activeTab}</span>
          <i
            className={[
              'bi bi-chevron-down',
              styles.chevron,
              menuOpen ? styles.chevronOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
        </button>

        {menuOpen && (
          <ul className={styles.mobileList} role="listbox">
            {tabs.map((tab) => {
              const isActive = tab === activeTab
              return (
                <li key={tab} role="option" aria-selected={isActive}>
                  <button
                    className={[
                      styles.mobileItem,
                      isActive ? styles.mobileItemActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSelect(tab)}
                  >
                    <span>{tab}</span>
                    {isActive && (
                      <i className="bi bi-check2" aria-hidden="true" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </nav>
  )
}
