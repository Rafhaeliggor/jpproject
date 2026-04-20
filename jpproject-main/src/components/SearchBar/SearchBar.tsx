'use client'

import styles from './SearchBar.module.css'

export interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  showAdd?: boolean
  onAddClick?: () => void
  className?: string
}

export default function SearchBar({
  placeholder = 'Pesquisa',
  value,
  onChange,
  showAdd = false,
  onAddClick,
  className,
}: SearchBarProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <i className={`bi bi-search ${styles.searchIcon}`} aria-hidden="true" />

      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />

      {showAdd && (
        <button
          type="button"
          className={styles.addBtn}
          onClick={onAddClick}
          aria-label="Adicionar local"
          title="Adicionar local"
        >
          <i className="bi bi-plus-lg" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
