'use client'

import UserAvatarList from '@/components/UserAvatarList/UserAvatarList'
import type { Local } from '@/data/locais'
import type { Usuario } from '@/data/usuarios'
import styles from './RoteiroItem.module.css'

export interface RoteiroItemProps {
  local: Local
  votantes: Usuario[]
  onClick: () => void
  onRemove: () => void
}

export default function RoteiroItem({
  local,
  votantes,
  onClick,
  onRemove,
}: RoteiroItemProps) {
  const visibleTags = local.tags.slice(0, 2)
  const extraTags = local.tags.length - visibleTags.length

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <article className={styles.item} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Ver detalhes de ${local.nome}`}
    >
      <div className={styles.left}>
        <UserAvatarList usuarios={votantes} max={3} size={28} />
        <div className={styles.textGroup}>
          <span className={styles.nome}>{local.nome}</span>
          <span className={styles.votos}>
            {votantes.length} {votantes.length === 1 ? 'voto' : 'votos'}
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.tempo}>{local.tempoMedio}</span>
        <div className={styles.tags}>
          {visibleTags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
          {extraTags > 0 && (
            <span className={`${styles.tag} ${styles.tagExtra}`}>+{extraTags}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.removeBtn}
        onClick={handleRemove}
        aria-label={`Remover ${local.nome} do roteiro`}
        title="Remover do roteiro"
      >
        <i className="bi bi-trash3" aria-hidden="true" />
      </button>
    </article>
  )
}
