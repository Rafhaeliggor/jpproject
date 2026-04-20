import Image from 'next/image'
import styles from './CardViagem.module.css'

export interface CardViagemProps {
  titulo: string
  subtituloJP?: string
  descricao: string
  imagemUrl?: string
  link?: string
  categoria?: string
}

export default function CardViagem({
  titulo,
  subtituloJP,
  descricao,
  imagemUrl,
  link,
  categoria,
}: CardViagemProps) {
  return (
    <article className={styles.card}>
      {imagemUrl && (
        <div className={styles.imageWrapper}>
          <Image
            src={imagemUrl}
            alt={titulo}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {categoria && (
            <span className={styles.badge}>{categoria}</span>
          )}
        </div>
      )}

      <div className={styles.content}>
        {subtituloJP && (
          <span className={styles.subtituloJP}>{subtituloJP}</span>
        )}

        <h4 className={styles.titulo}>{titulo}</h4>

        <p className={styles.descricao}>{descricao}</p>

        {link && (
          <footer className={styles.footer}>
            <a href={link} className={styles.link}>
              Ver mais{' '}
              <i className="bi bi-arrow-right-short" aria-hidden="true" />
            </a>
          </footer>
        )}
      </div>
    </article>
  )
}
