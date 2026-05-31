'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './SettingsModal.module.css'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SidebarSection = 'aparencia' | 'acessibilidade'

type FontValue = 'inter' | 'opensans' | 'lexend' | 'sourcesans'
type ContrastValue = 'normal' | 'high'

const FONTS: { value: FontValue; label: string; cssVar: string }[] = [
  { value: 'inter', label: 'Inter', cssVar: 'var(--font-inter)' },
  { value: 'opensans', label: 'Open Sans', cssVar: 'var(--font-open-sans)' },
  { value: 'lexend', label: 'Lexend', cssVar: 'var(--font-lexend)' },
  { value: 'sourcesans', label: 'Source Sans 3', cssVar: 'var(--font-source-sans)' },
]

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SidebarSection>('aparencia')
  const [selectedFont, setSelectedFont] = useState<FontValue>('inter')
  const [contrast, setContrast] = useState<ContrastValue>('normal')
  const [vlibrasEnabled, setVlibrasEnabled] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const savedFont = localStorage.getItem('settings-font') as FontValue | null
    const savedContrast = localStorage.getItem('settings-contrast') as ContrastValue | null
    const savedVlibras = localStorage.getItem('settings-vlibras')
    if (savedFont) setSelectedFont(savedFont)
    if (savedContrast) setContrast(savedContrast)
    setVlibrasEnabled(savedVlibras === 'true')
  }, [isOpen])

  useEffect(() => {
    document.documentElement.setAttribute('data-font', selectedFont)
    document.documentElement.setAttribute('data-contrast', contrast)
    localStorage.setItem('settings-font', selectedFont)
    localStorage.setItem('settings-contrast', contrast)
  }, [selectedFont, contrast])

  useEffect(() => {
    localStorage.setItem('settings-vlibras', vlibrasEnabled ? 'true' : 'false')
    window.dispatchEvent(
      new CustomEvent('vlibras-settings-change', { detail: { enabled: vlibrasEnabled } })
    )
  }, [vlibrasEnabled])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Configurações">
        <div className={styles.header}>
          <h2 className={styles.title}>Configurações</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar configurações">
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <button
              className={`${styles.sidebarItem} ${activeSection === 'aparencia' ? styles.sidebarItemActive : ''}`}
              onClick={() => setActiveSection('aparencia')}
            >
              <i className="bi bi-palette" aria-hidden="true" />
              <span>Aparência</span>
            </button>
            <button
              className={`${styles.sidebarItem} ${activeSection === 'acessibilidade' ? styles.sidebarItemActive : ''}`}
              onClick={() => setActiveSection('acessibilidade')}
            >
              <i className="bi bi-universal-access" aria-hidden="true" />
              <span>Acessibilidade</span>
            </button>
          </aside>

          <div className={styles.content}>
            {activeSection === 'acessibilidade' && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Libras (VLibras)</h3>
                <p className={styles.sectionDesc}>
                  Quando ativado, um intérprete de Libras aparece no canto inferior direito
                  e sinaliza automaticamente o conteúdo sempre que um som for reproduzido na plataforma.
                </p>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <p className={styles.toggleLabel}>Intérprete de Libras</p>
                    <p className={styles.toggleDesc}>
                      Exibe o boneco VLibras e aciona a sinalização junto a cada áudio da plataforma.
                    </p>
                  </div>
                  <label className={styles.toggle} aria-label="Ativar intérprete de Libras">
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={vlibrasEnabled}
                      onChange={(e) => setVlibrasEnabled(e.target.checked)}
                    />
                    <span className={styles.toggleTrack} />
                  </label>
                </div>
              </section>
            )}

            {activeSection === 'aparencia' && (
              <>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Fonte</h3>
                  <p className={styles.sectionDesc}>Escolha uma fonte com maior legibilidade.</p>
                  <div className={styles.fontGrid}>
                    {FONTS.map((font) => (
                      <button
                        key={font.value}
                        className={`${styles.fontOption} ${selectedFont === font.value ? styles.fontOptionActive : ''}`}
                        onClick={() => setSelectedFont(font.value)}
                        style={{ fontFamily: font.cssVar }}
                      >
                        <span className={styles.fontPreview}>Aa</span>
                        <span className={styles.fontName}>{font.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <hr className={styles.divider} />

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Contraste</h3>
                  <p className={styles.sectionDesc}>Aumente o contraste do texto para melhor visibilidade.</p>
                  <div className={styles.contrastGrid}>
                    <button
                      className={`${styles.contrastOption} ${contrast === 'normal' ? styles.contrastOptionActive : ''}`}
                      onClick={() => setContrast('normal')}
                    >
                      <span className={styles.contrastPreviewNormal}>Texto</span>
                      <span className={styles.contrastLabel}>Normal</span>
                    </button>
                    <button
                      className={`${styles.contrastOption} ${contrast === 'high' ? styles.contrastOptionActive : ''}`}
                      onClick={() => setContrast('high')}
                    >
                      <span className={styles.contrastPreviewHigh}>Texto</span>
                      <span className={styles.contrastLabel}>Alto Contraste</span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
