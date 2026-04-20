import styles from './InfoCard.module.css'

export interface InfoCardProps {
  tempoTotal: string
  totalLocais: number
  cidades: string[]
}

export default function InfoCard({ tempoTotal, totalLocais, cidades }: InfoCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Resumo</h3>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Tempo total</span>
          <span className={styles.value}>{tempoTotal || '—'}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>Total de locais</span>
          <span className={styles.value}>{totalLocais}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>Cidades visitadas</span>
          <span className={styles.value}>
            {cidades.length > 0 ? cidades.join(', ') : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
