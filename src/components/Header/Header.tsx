import ContadorRegressivo from '../ContadorRegressivo/ContadorRegressivo'
import styles from './Header.module.css'

interface HeaderProps {
  targetDate?: Date | string
  userName?: string
}

export default function Header({
  targetDate = '2027-02-10T00:00:00',
  userName = 'Iggor Rafhael',
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <ContadorRegressivo targetDate={targetDate} />

        <div className={styles.userInfo} aria-label={`Usuário: ${userName}`}>
          <span>{userName}</span>
          <i className="bi bi-person-circle" aria-hidden="true" />
        </div>
      </div>
    </header>
  )
}
