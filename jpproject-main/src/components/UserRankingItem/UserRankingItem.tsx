import Image from 'next/image'
import type { Usuario } from '@/data/usuarios'
import styles from './UserRankingItem.module.css'

export interface UserRankingItemProps {
  usuario: Usuario
}

export default function UserRankingItem({ usuario }: UserRankingItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <span className={styles.nome}>{usuario.nome}</span>
        <span className={styles.locais}>
          {usuario.locaisAdicionados}{' '}
          {usuario.locaisAdicionados === 1 ? 'local' : 'locais'}
        </span>
      </div>

      <div
        className={styles.avatar}
        style={{ backgroundColor: usuario.cor }}
        title={usuario.nome}
      >
        <Image
          src={usuario.avatarUrl}
          alt={usuario.nome}
          width={36}
          height={36}
          className={styles.avatarImg}
        />
      </div>
    </div>
  )
}
