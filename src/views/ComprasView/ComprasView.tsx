'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Container from '@/components/Container/Container'
import SearchBar from '@/components/SearchBar/SearchBar'
import { api, type ShoppingItem } from '@/lib/api'
import styles from './ComprasView.module.css'

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: currency || 'JPY' }).format(price)
  } catch {
    return `¥${price}`
  }
}

export default function ComprasView() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [nome, setNome] = useState('')
  const [localField, setLocalField] = useState('')
  const [valor, setValor] = useState('')
  const [tagsField, setTagsField] = useState('')
  const [descricao, setDescricao] = useState('')
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null)

  useEffect(() => {
    api.shopping.list()
      .then(setItems)
      .catch(() => setError('Erro ao carregar lista de compras.'))
      .finally(() => setLoading(false))
  }, [])

  const resultados = useMemo(
    () => items.filter(it => it.name.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query],
  )

  const totalValue = items.reduce((sum, it) => sum + it.price, 0)
  const currency = items[0]?.currency || 'JPY'

  const clearForm = () => {
    setNome(''); setLocalField(''); setValor(''); setTagsField(''); setDescricao('')
  }

  const handleCreate = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const newItem = await api.shopping.create({
        name: nome.trim(),
        description: descricao.trim() || '—',
        tags: tagsField.split(',').map(t => t.trim()).filter(Boolean),
        location: localField || 'Local',
        price: parseFloat(valor.replace(/[^0-9.]/g, '')) || 0,
        currency: 'JPY',
      })
      setItems(prev => [newItem, ...prev])
      clearForm()
      setQuery('')
    } catch {
      setError('Erro ao criar item.')
    } finally {
      setSaving(false)
    }
  }

  const confirmRemove = async () => {
    if (pendingRemoveId == null) return
    try {
      await api.shopping.delete(pendingRemoveId)
      setItems(prev => prev.filter(it => it.id !== pendingRemoveId))
    } catch {
      setError('Erro ao remover item.')
    } finally {
      setPendingRemoveId(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Container>
          <p style={{ padding: '2rem', color: '#6b7280' }}>Carregando lista de compras...</p>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.decoText} aria-hidden>買い物</span>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <Container>
        <div className={styles.grid}>
          <aside className={styles.colLeft}>
            <div className={styles.card}>
              <h2 style={{ marginTop: 0 }}>Adicionar</h2>

              <label>
                Nome do item
                <input
                  className={styles.input}
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome do item"
                />
              </label>

              <div className={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label>
                    Local
                    <input
                      className={styles.input}
                      value={localField}
                      onChange={e => setLocalField(e.target.value)}
                      placeholder="Local"
                    />
                  </label>
                </div>
                <div style={{ width: 140 }}>
                  <label>
                    Valor (¥)
                    <input
                      className={styles.input}
                      value={valor}
                      onChange={e => setValor(e.target.value)}
                      placeholder="ex: 1200"
                    />
                  </label>
                </div>
              </div>

              <label>
                Tags (separe por vírgula)
                <input
                  className={styles.input}
                  value={tagsField}
                  onChange={e => setTagsField(e.target.value)}
                  placeholder="ex: Snack, Souvenir"
                />
              </label>

              <label style={{ display: 'block', marginTop: 8 }}>
                Descrição
                <input
                  className={styles.input}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Descrição"
                />
              </label>

              <div className={styles.leftButtons}>
                <button className={styles.btnClear} onClick={clearForm} type="button">
                  LIMPAR
                </button>
                <button
                  className={styles.btnCreate}
                  onClick={handleCreate}
                  type="button"
                  disabled={saving}
                >
                  {saving ? 'CRIANDO...' : 'CRIAR'}
                </button>
              </div>
            </div>
          </aside>

          <section className={styles.colCenter}>
            <SearchBar placeholder="Pesquisa" value={query} onChange={setQuery} />

            <div className={styles.list}>
              {items.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="bi bi-bag" aria-hidden="true" />
                  <p>Nenhum item cadastrado.</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    Use o formulário ao lado para adicionar o primeiro item.
                  </p>
                </div>
              )}
              {items.length > 0 && resultados.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="bi bi-search" aria-hidden="true" />
                  <p>Nenhum item encontrado para &ldquo;{query}&rdquo;.</p>
                </div>
              )}
              {resultados.map(it => (
                <div key={it.id} className={styles.item}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {it.image_url ? (
                      <img
                        src={it.image_url}
                        alt={it.name}
                        width={72}
                        height={72}
                        style={{ borderRadius: 6, objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.avatar}>{it.name[0]}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{it.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        {it.description}
                      </div>
                      <div className={styles.tags}>
                        {(it.tags ?? []).map((t, idx) => (
                          <span key={idx} className={styles.tag}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                    <div style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                      {it.location}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setPendingRemoveId(it.id)}
                        type="button"
                        title="Remover item"
                        style={{
                          border: 'none', background: 'transparent',
                          color: '#c0392b', cursor: 'pointer', fontSize: '0.85rem',
                        }}
                      >
                        REMOVER
                      </button>
                    </div>
                    <div className={styles.priceBox}>{formatPrice(it.price, it.currency)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {items.length > 0 && (
            <aside className={styles.colRight}>
              <div className={styles.summary}>
                <h3 style={{ margin: 0 }}>Resumo</h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  Total de itens: {items.length}
                </p>
                <p style={{ marginTop: '0.25rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>
                  Valor total: {formatPrice(totalValue, currency)}
                </p>
              </div>
            </aside>
          )}
        </div>
      </Container>

      {pendingRemoveId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)', zIndex: 1200,
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)', color: 'var(--color-text-primary)',
              padding: 20, borderRadius: 8, width: 'min(480px, 92%)',
            }}
          >
            <h4 style={{ marginTop: 0 }}>Confirmar remoção</h4>
            <p style={{ marginTop: 4 }}>Tem certeza que deseja remover este item?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className={styles.btnClear} onClick={() => setPendingRemoveId(null)} type="button">
                Cancelar
              </button>
              <button className={styles.btnCreate} onClick={confirmRemove} type="button">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
