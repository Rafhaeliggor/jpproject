import Image from 'next/image'
import styles from './MiniCard.module.css'

export interface MiniCardProps {
  nome: string
  endereco: string
  imagemUrl?: string
  onClick: () => void
}

export default function MiniCard({ nome, endereco, imagemUrl, onClick }: MiniCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      aria-label={`Adicionar ${nome} ao roteiro`}
    >
      <div className={styles.info}>
        <span className={styles.nome}>{nome}</span>
        <span className={styles.endereco}>{endereco}</span>
      </div>

      {imagemUrl && (
        <div className={styles.imageWrapper}>
          <Image
            src={imagemUrl}
            alt={nome}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 90vw, 280px"
          />
        </div>
      )}
    </button>
  )
}
