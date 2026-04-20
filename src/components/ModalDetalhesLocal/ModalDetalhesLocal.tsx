'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import UserAvatarList from '@/components/UserAvatarList/UserAvatarList'
import type { Local } from '@/data/locais'
import type { Usuario } from '@/data/usuarios'
import styles from './ModalDetalhesLocal.module.css'

const MapaLocal = dynamic(() => import('../MapaLocal/MapaLocal'), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder}>Carregando mapa…</div>,
})

export interface ModalDetalhesLocalProps {
  local: Local
  votantes: Usuario[]
  onClose: () => void
}

export default function ModalDetalhesLocal({
  local,
  votantes,
  onClose,
}: ModalDetalhesLocalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${local.nome}`}
        onClick={(e) => e.stopPropagation()}
      >

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <UserAvatarList usuarios={votantes} max={4} size={32} />
            <div>
              <h2 className={styles.headerNome}>{local.nome}</h2>
              <span className={styles.headerVotos}>
                {votantes.length} {votantes.length === 1 ? 'voto' : 'votos'}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.tempoBadge}>{local.tempoMedio}</span>
            <div className={styles.tagsRow}>
              {local.tags.slice(0, 2).map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
              {local.tags.length > 2 && (
                <span className={`${styles.tag} ${styles.tagExtra}`}>
                  +{local.tags.length - 2}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.colLeft}>
            <h3 className={styles.sectionTitle}>Endereço</h3>
            <p className={styles.endereco}>{local.endereco}</p>

            <MapaLocal coordenadas={local.coordenadas} nome={local.nome} />
          </section>

          <section className={styles.colRight}>
            <h3 className={styles.sectionTitle}>Descrição</h3>
            <p className={styles.descricao}>{local.descricao}</p>

            <h3 className={styles.sectionTitle}>Tags</h3>
            <div className={styles.allTags}>
              {local.tags.map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </section>
        </div>


        <footer className={styles.footer}>
          <h3 className={styles.sectionTitle}>Votantes</h3>
          <div className={styles.votantesList}>
            {votantes.map((u) => (
              <div key={u.id} className={styles.votanteItem}>
                <UserAvatarList usuarios={[u]} max={1} size={32} />
                <span className={styles.votanteNome}>{u.nome}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
