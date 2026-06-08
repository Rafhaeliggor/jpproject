'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './GroupSetup.module.css'

export default function GroupSetup() {
  const { createGroup, joinGroup, logout } = useAuth()

  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [joinError, setJoinError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setCreateLoading(true)
    setCreateError('')
    try {
      await createGroup(groupName.trim())
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Erro ao criar grupo')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setJoinLoading(true)
    setJoinError('')
    try {
      await joinGroup(inviteCode.trim())
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : 'Codigo de convite invalido')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.flag}>🇯🇵</div>
          <h1 className={styles.title}>Planejamento de Viagem</h1>
          <p className={styles.subtitle}>Crie ou entre em um grupo para começar</p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Criar novo grupo</h2>
          {createError && <div className={styles.error}>{createError}</div>}
          <form className={styles.form} onSubmit={handleCreate}>
            <div className={styles.field}>
              <label htmlFor="group-name">Nome do grupo</label>
              <input
                id="group-name"
                type="text"
                placeholder="Ex: Viagem ao Japão 2027"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={createLoading}
                autoComplete="off"
              />
            </div>
            <button type="submit" className={styles.button} disabled={createLoading || !groupName.trim()}>
              {createLoading ? 'Criando...' : 'Criar grupo'}
            </button>
          </form>
        </div>

        <div className={styles.divider}>ou</div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Entrar em um grupo</h2>
          {joinError && <div className={styles.error}>{joinError}</div>}
          <form className={styles.form} onSubmit={handleJoin}>
            <div className={styles.field}>
              <label htmlFor="invite-code">Codigo de convite</label>
              <input
                id="invite-code"
                type="text"
                placeholder="Ex: a1b2c3d4"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={joinLoading}
                autoComplete="off"
              />
            </div>
            <button type="submit" className={styles.button} disabled={joinLoading || !inviteCode.trim()}>
              {joinLoading ? 'Entrando...' : 'Entrar no grupo'}
            </button>
          </form>
        </div>

        <button className={styles.logoutLink} onClick={logout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
