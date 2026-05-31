'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(true)
  const [a11yContrastEnabled, setA11yContrastEnabled] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const savedFont = localStorage.getItem('settings-font') as FontValue | null
    const savedContrast = localStorage.getItem('settings-contrast') as ContrastValue | null
    const savedVlibras = localStorage.getItem('settings-vlibras')
    const savedKeyboardNav = localStorage.getItem('settings-keyboard-nav')
    const savedA11yContrast = localStorage.getItem('settings-a11y-contrast')
    if (savedFont) setSelectedFont(savedFont)
    if (savedContrast) setContrast(savedContrast)
    setVlibrasEnabled(savedVlibras === 'true')
    setKeyboardNavEnabled(savedKeyboardNav !== 'false')
    setA11yContrastEnabled(savedA11yContrast === 'true')
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
    localStorage.setItem('settings-keyboard-nav', keyboardNavEnabled ? 'true' : 'false')
    window.dispatchEvent(
      new CustomEvent('keyboard-nav-settings-change', { detail: { enabled: keyboardNavEnabled } })
    )
  }, [keyboardNavEnabled])

  useEffect(() => {
    localStorage.setItem('settings-a11y-contrast', a11yContrastEnabled ? 'true' : 'false')
    document.documentElement.setAttribute('data-a11y-contrast', a11yContrastEnabled ? 'true' : 'false')
  }, [a11yContrastEnabled])

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
          <aside
            className={styles.sidebar}
            ref={sidebarRef}
            onKeyDown={(e) => {
              if (!keyboardNavEnabled) return
              if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return
              const sections: SidebarSection[] = ['aparencia', 'acessibilidade']
              const currentIdx = sections.indexOf(activeSection)
              const nextIdx =
                e.key === 'ArrowDown'
                  ? (currentIdx + 1) % sections.length
                  : (currentIdx - 1 + sections.length) % sections.length
              setActiveSection(sections[nextIdx])
              const buttons = sidebarRef.current?.querySelectorAll<HTMLElement>('button')
              buttons?.[nextIdx]?.focus()
              e.preventDefault()
            }}
          >
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
              <>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Alto Contraste</h3>
                  <p className={styles.sectionDesc}>
                    Substitui o vermelho por azul em todos os elementos, aumenta o contraste do texto
                    e elimina ambiguidade de cores para pessoas com daltonismo.
                  </p>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <p className={styles.toggleLabel}>Ativar alto contraste</p>
                      <p className={styles.toggleDesc}>
                        Redesenha a interface com paleta segura para todos os tipos de daltonismo
                        (deuteranopia, protanopia, tritanopia).
                      </p>
                    </div>
                    <label className={styles.toggle} aria-label="Ativar alto contraste para daltônicos">
                      <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={a11yContrastEnabled}
                        onChange={(e) => setA11yContrastEnabled(e.target.checked)}
                      />
                      <span className={styles.toggleTrack} />
                    </label>
                  </div>
                </section>

                <hr className={styles.divider} />

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Navegação pelo Teclado</h3>
                  <p className={styles.sectionDesc}>
                    Permite navegar pelo site sem usar o mouse: use Tab para mover entre elementos,
                    setas para rolar a página e trocar entre seções do menu lateral.
                  </p>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <p className={styles.toggleLabel}>Ativar navegação pelo teclado</p>
                      <p className={styles.toggleDesc}>
                        Exibe indicadores de foco visíveis e habilita atalhos de seta para navegar pela plataforma.
                      </p>
                    </div>
                    <label className={styles.toggle} aria-label="Ativar navegação pelo teclado">
                      <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={keyboardNavEnabled}
                        onChange={(e) => setKeyboardNavEnabled(e.target.checked)}
                      />
                      <span className={styles.toggleTrack} />
                    </label>
                  </div>
                </section>

                <hr className={styles.divider} />

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
              </>
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
