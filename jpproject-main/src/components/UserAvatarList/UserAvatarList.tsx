import Image from 'next/image'
import type { Usuario } from '@/data/usuarios'
import styles from './UserAvatarList.module.css'

export interface UserAvatarListProps {
  usuarios: Usuario[]
  max?: number
  size?: number
}

export default function UserAvatarList({
  usuarios,
  max = 3,
  size = 28,
}: UserAvatarListProps) {
  const shown = usuarios.slice(0, max)
  const extra = usuarios.length - shown.length

  return (
    <div className={styles.list} style={{ height: size }}>
      {shown.map((u, i) => (
        <div
          key={u.id}
          className={styles.avatar}
          style={{
            width: size,
            height: size,
            backgroundColor: u.cor,
            marginLeft: i > 0 ? -Math.round(size * 0.35) : 0,
            zIndex: shown.length - i,
            fontSize: Math.round(size * 0.36),
          }}
          title={u.nome}
        >
          <Image
            src={u.avatarUrl}
            alt={u.nome}
            width={size}
            height={size}
            className={styles.avatarImg}
          />
        </div>
      ))}

      {extra > 0 && (
        <div
          className={`${styles.avatar} ${styles.extra}`}
          style={{
            width: size,
            height: size,
            marginLeft: -Math.round(size * 0.35),
            fontSize: Math.round(size * 0.34),
          }}
          title={`+${extra} usuário(s)`}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
