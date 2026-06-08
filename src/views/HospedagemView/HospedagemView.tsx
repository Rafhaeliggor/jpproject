'use client'

import { useEffect, useState, useMemo } from 'react'
import Container from '@/components/Container/Container'
import SearchBar from '@/components/SearchBar/SearchBar'
import { api, type Accommodation } from '@/lib/api'
import styles from './HospedagemView.module.css'

const TYPES = ['Hotel', 'Ryokan', 'Hostel', 'Airbnb', 'Pousada']
const CURRENCIES = ['BRL', 'JPY', 'USD', 'EUR']

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency || 'BRL' }).format(price)
  } catch {
    return `${currency} ${price}`
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map(n => (
        <i
          key={n}
          className={n <= rating ? 'bi bi-star-fill' : 'bi bi-star'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  return <span className={`${styles.typeBadge} ${styles[`type${type.replace(/\s/g, '')}`] ?? ''}`}>{type}</span>
}

const EMPTY_FORM = {
  name: '',
  type: 'Hotel',
  address: '',
  city: '',
  check_in: '',
  check_out: '',
  price_per_night: '',
  currency: 'BRL',
  rating: '0',
  notes: '',
  tags: '',
  image_url: '',
}

export default function HospedagemView() {
  const [items, setItems] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    api.accommodations.list()
      .then(setItems)
      .catch(() => setError('Erro ao carregar hospedagens.'))
      .finally(() => setLoading(false))
  }, [])

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      it =>
        it.name.toLowerCase().includes(q) ||
        it.city.toLowerCase().includes(q) ||
        it.type.toLowerCase().includes(q),
    )
  }, [items, query])

  const totalNoites = items.reduce((s, it) => s + it.nights, 0)
  const totalCusto = items.reduce((s, it) => s + it.total_price, 0)

  function setField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function clearForm() {
    setForm(EMPTY_FORM)
  }

  async function handleCreate() {
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      const created = await api.accommodations.create({
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim(),
        city: form.city.trim(),
        check_in: form.check_in,
        check_out: form.check_out,
        price_per_night: parseFloat(form.price_per_night) || 0,
        currency: form.currency,
        rating: parseInt(form.rating) || 0,
        notes: form.notes.trim(),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        image_url: form.image_url.trim(),
      })
      setItems(prev => [...prev, created])
      clearForm()
    } catch {
      setError('Erro ao criar hospedagem.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmRemove() {
    if (pendingRemoveId == null) return
    try {
      await api.accommodations.delete(pendingRemoveId)
      setItems(prev => prev.filter(it => it.id !== pendingRemoveId))
    } catch {
      setError('Erro ao remover hospedagem.')
    } finally {
      setPendingRemoveId(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Container>
          <p style={{ padding: '2rem', color: '#6b7280' }}>Carregando hospedagens...</p>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.decoText} aria-hidden="true">宿泊</span>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <Container>
        <div className={styles.grid}>

          {/* ── Formulário ── */}
          <aside className={styles.colLeft}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Adicionar</h2>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Nome da hospedagem *
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    placeholder="Ex: APA Hotel Shinjuku"
                  />
                </label>
              </div>

              <div className={styles.row2}>
                <label className={styles.label}>
                  Tipo
                  <select className={styles.input} value={form.type} onChange={e => setField('type', e.target.value)}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className={styles.label}>
                  Cidade
                  <input
                    className={styles.input}
                    value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    placeholder="Ex: Tokyo"
                  />
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Endereço
                  <input
                    className={styles.input}
                    value={form.address}
                    onChange={e => setField('address', e.target.value)}
                    placeholder="Endereço completo"
                  />
                </label>
              </div>

              <div className={styles.row2}>
                <label className={styles.label}>
                  Check-in
                  <input
                    type="date"
                    className={styles.input}
                    value={form.check_in}
                    onChange={e => setField('check_in', e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  Check-out
                  <input
                    type="date"
                    className={styles.input}
                    value={form.check_out}
                    onChange={e => setField('check_out', e.target.value)}
                  />
                </label>
              </div>

              <div className={styles.row2}>
                <label className={styles.label}>
                  Diária
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={styles.input}
                    value={form.price_per_night}
                    onChange={e => setField('price_per_night', e.target.value)}
                    placeholder="0"
                  />
                </label>
                <label className={styles.label}>
                  Moeda
                  <select className={styles.input} value={form.currency} onChange={e => setField('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Avaliação
                  <div className={styles.ratingPicker}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.ratingBtn} ${parseInt(form.rating) >= n ? styles.ratingBtnOn : ''}`}
                        onClick={() => setField('rating', String(n))}
                        aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                      >
                        <i className="bi bi-star-fill" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Tags <span className={styles.hint}>(separe por vírgula)</span>
                  <input
                    className={styles.input}
                    value={form.tags}
                    onChange={e => setField('tags', e.target.value)}
                    placeholder="Ex: Onsen, Central, Café incluso"
                  />
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Observações
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                    placeholder="Informações adicionais, políticas, etc."
                    rows={3}
                  />
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Imagem URL <span className={styles.hint}>(opcional)</span>
                  <input
                    type="url"
                    className={styles.input}
                    value={form.image_url}
                    onChange={e => setField('image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnClear} onClick={clearForm}>
                  LIMPAR
                </button>
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={handleCreate}
                  disabled={saving || !form.name.trim()}
                >
                  {saving ? 'CRIANDO…' : 'CRIAR'}
                </button>
              </div>
            </div>
          </aside>

          {/* ── Lista ── */}
          <section className={styles.colCenter}>
            <SearchBar placeholder="Pesquisar hospedagem…" value={query} onChange={setQuery} />

            <div className={styles.list}>
              {items.length === 0 && (
                <div className={styles.empty}>
                  <i className="bi bi-building" aria-hidden="true" />
                  <span>Nenhuma hospedagem cadastrada.</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    Use o formulário ao lado para adicionar a primeira.
                  </span>
                </div>
              )}
              {items.length > 0 && resultados.length === 0 && (
                <div className={styles.empty}>
                  <i className="bi bi-search" aria-hidden="true" />
                  <span>Nenhuma hospedagem encontrada para &ldquo;{query}&rdquo;.</span>
                </div>
              )}

              {resultados.map(item => {
                const expanded = expandedId === item.id
                return (
                  <div key={item.id} className={styles.card}>
                    <div className={styles.cardMain}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className={styles.cardImage}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className={styles.cardImageFallback}>
                          <i className="bi bi-building" aria-hidden="true" />
                        </div>
                      )}

                      <div className={styles.cardBody}>
                        <div className={styles.cardTopRow}>
                          <div>
                            <span className={styles.cardName}>{item.name}</span>
                            <TypeBadge type={item.type} />
                          </div>
                          <Stars rating={item.rating} />
                        </div>

                        <div className={styles.cardMeta}>
                          <span>
                            <i className="bi bi-geo-alt" aria-hidden="true" /> {item.city}
                            {item.address ? ` — ${item.address}` : ''}
                          </span>
                        </div>

                        <div className={styles.cardDates}>
                          <span>
                            <i className="bi bi-calendar-check" aria-hidden="true" /> {item.check_in || '—'}
                          </span>
                          <i className="bi bi-arrow-right" aria-hidden="true" />
                          <span>{item.check_out || '—'}</span>
                          {item.nights > 0 && (
                            <span className={styles.nights}>{item.nights} noite{item.nights !== 1 ? 's' : ''}</span>
                          )}
                        </div>

                        {(item.tags ?? []).length > 0 && (
                          <div className={styles.tags}>
                            {item.tags.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
                          </div>
                        )}
                      </div>

                      <div className={styles.cardRight}>
                        <div className={styles.cardPrice}>
                          {formatPrice(item.total_price || item.price_per_night * item.nights, item.currency)}
                        </div>
                        {item.price_per_night > 0 && (
                          <div className={styles.cardPriceNight}>
                            {formatPrice(item.price_per_night, item.currency)}/noite
                          </div>
                        )}
                        <div className={styles.cardActions}>
                          {item.notes && (
                            <button
                              type="button"
                              className={styles.btnExpand}
                              onClick={() => setExpandedId(expanded ? null : item.id)}
                              aria-expanded={expanded}
                              aria-label="Ver observações"
                            >
                              <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`} aria-hidden="true" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.btnRemove}
                            onClick={() => setPendingRemoveId(item.id)}
                            aria-label={`Remover ${item.name}`}
                          >
                            <i className="bi bi-trash3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expanded && item.notes && (
                      <div className={styles.cardNotes}>
                        <i className="bi bi-info-circle" aria-hidden="true" />
                        {item.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Resumo ── */}
          <aside className={styles.colRight}>
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Resumo</h3>
              <div className={styles.summaryRow}>
                <span>Hospedagens</span>
                <strong>{items.length}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Total de noites</span>
                <strong>{totalNoites}</strong>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Custo estimado</span>
                <strong>{formatPrice(totalCusto, items[0]?.currency || 'BRL')}</strong>
              </div>

              {items.length > 0 && (
                <div className={styles.citiesList}>
                  <p className={styles.citiesLabel}>Cidades</p>
                  {[...new Set(items.map(it => it.city).filter(Boolean))].map(city => (
                    <div key={city} className={styles.cityRow}>
                      <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                      <span>{city}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>

      {pendingRemoveId !== null && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.confirmCard}>
            <h4 className={styles.confirmTitle}>Confirmar remoção</h4>
            <p className={styles.confirmText}>Tem certeza que deseja remover esta hospedagem?</p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.btnClear} onClick={() => setPendingRemoveId(null)}>
                Cancelar
              </button>
              <button type="button" className={styles.btnCreate} onClick={confirmRemove}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
