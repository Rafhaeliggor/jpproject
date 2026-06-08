'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Container from '@/components/Container/Container'
import { api, type BudgetCategory, type ShoppingItem, type Flight, type Accommodation, type Location } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import styles from './orcamentoView.module.css'

const TAG_CLASSES = [styles.tagPink, styles.tagYellow, styles.tagBlue]

const EMPTY_BUDGET_FORM = { name: '', amount: '', currency: 'BRL', percentage: '' }

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount)
}

function minutesToHours(total: number) {
  const h = Math.floor(total / 60)
  const m = total % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function ModalAdicionarCategoria({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: (cat: BudgetCategory) => void
}) {
  const [form, setForm] = useState(EMPTY_BUDGET_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof typeof EMPTY_BUDGET_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      const created = await api.budget.create({
        name: form.name.trim(),
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        percentage: parseInt(form.percentage) || 0,
      })
      onSaved(created)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Fechar">×</button>
        <h3 className={styles.modalTitle}>Adicionar Categoria de Orçamento</h3>
        <form onSubmit={submit}>
          {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 8 }}>{error}</p>}
          <label className={styles.modalField}>
            Nome *
            <input className={styles.modalInput} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Alimentação, Transporte interno" />
          </label>
          <div className={styles.modalRow}>
            <label className={styles.modalField}>
              Valor
              <input className={styles.modalInput} type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
            </label>
            <label className={styles.modalField}>
              Moeda
              <select className={styles.modalInput} value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option>BRL</option><option>USD</option><option>JPY</option><option>EUR</option>
              </select>
            </label>
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalBtnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.modalBtnSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrcamentoView() {
  const { user } = useAuth()
  const [budgetCards, setBudgetCards] = useState<BudgetCategory[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [itinerary, setItinerary] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [focusedCard, setFocusedCard] = useState<BudgetCategory | null>(null)
  const [modalCategoria, setModalCategoria] = useState(false)

  useEffect(() => {
    Promise.all([
      api.budget.list(),
      api.shopping.list(),
      api.flights.list(),
      api.accommodations.list(),
      api.itinerary.list(),
    ])
      .then(([budget, shopping, flts, accoms, itin]) => {
        setBudgetCards(budget)
        setShoppingItems(shopping)
        setFlights(flts)
        setAccommodations(accoms)
        setItinerary(itin)
        if (budget.length > 0) setFocusedCard(budget[0])
      })
      .finally(() => setLoading(false))
  }, [])

  // Totais automáticos por aba
  const totalPassagens = useMemo(
    () => flights.reduce((s, f) => s + (f.price || 0), 0),
    [flights],
  )
  const moedaPassagens = flights[0]?.currency || 'BRL'

  const totalHospedagem = useMemo(
    () => accommodations.reduce((s, a) => s + (a.total_price || 0), 0),
    [accommodations],
  )
  const moedaHospedagem = accommodations[0]?.currency || 'BRL'

  const totalCompras = useMemo(
    () => shoppingItems.reduce((s, i) => s + (i.price || 0), 0),
    [shoppingItems],
  )
  const moedaCompras = shoppingItems[0]?.currency || 'JPY'

  const duracaoRoteiro = useMemo(
    () => itinerary.reduce((s, l) => s + (l.duration_minutes || 0), 0),
    [itinerary],
  )

  // Total em BRL (passagens + hospedagem assumidas BRL + compras BRL)
  const totalBRL = useMemo(() => {
    const passagensBRL = moedaPassagens === 'BRL' ? totalPassagens : 0
    const hospedagemBRL = moedaHospedagem === 'BRL' ? totalHospedagem : 0
    const comprasBRL = moedaCompras === 'BRL' ? totalCompras : 0
    const manualBRL = budgetCards.filter(c => c.currency === 'BRL').reduce((s, c) => s + c.amount, 0)
    return passagensBRL + hospedagemBRL + comprasBRL + manualBRL
  }, [totalPassagens, totalHospedagem, totalCompras, budgetCards, moedaPassagens, moedaHospedagem, moedaCompras])

  const donutPercent = focusedCard?.percentage ?? 0
  const donutDeg = `${Math.round((donutPercent / 100) * 360)}deg`

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Container>
          <p style={{ padding: '2rem', color: '#6b7280' }}>Carregando orçamento...</p>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.decoText} aria-hidden>予算</span>

      <Container>
        {/* ── Monitoramento automático ── */}
        <h2 className={styles.sectionLabel}>Gastos previstos</h2>
        <section className={styles.monitorGrid}>
          <div className={styles.monitorCard}>
            <div className={styles.monitorTop}>
              <i className="bi bi-map" aria-hidden="true" />
              <span className={styles.monitorLabel}>Roteiro</span>
            </div>
            <div className={styles.monitorValue}>
              {itinerary.length} {itinerary.length === 1 ? 'local' : 'locais'}
            </div>
            <div className={styles.monitorMeta}>
              {duracaoRoteiro > 0 ? minutesToHours(duracaoRoteiro) + ' planejadas' : 'sem duração estimada'}
            </div>
          </div>

          <div className={styles.monitorCard}>
            <div className={styles.monitorTop}>
              <i className="bi bi-airplane" aria-hidden="true" />
              <span className={styles.monitorLabel}>Passagens</span>
            </div>
            <div className={styles.monitorValue}>
              {flights.length === 0 ? '—' : fmt(totalPassagens, moedaPassagens)}
            </div>
            <div className={styles.monitorMeta}>
              {flights.length === 0 ? 'nenhum voo cadastrado' : `${flights.length} ${flights.length === 1 ? 'voo' : 'voos'}`}
            </div>
          </div>

          <div className={styles.monitorCard}>
            <div className={styles.monitorTop}>
              <i className="bi bi-building" aria-hidden="true" />
              <span className={styles.monitorLabel}>Hospedagem</span>
            </div>
            <div className={styles.monitorValue}>
              {accommodations.length === 0 ? '—' : fmt(totalHospedagem, moedaHospedagem)}
            </div>
            <div className={styles.monitorMeta}>
              {accommodations.length === 0
                ? 'nenhuma hospedagem cadastrada'
                : `${accommodations.length} ${accommodations.length === 1 ? 'hospedagem' : 'hospedagens'}`}
            </div>
          </div>

          <div className={styles.monitorCard}>
            <div className={styles.monitorTop}>
              <i className="bi bi-bag" aria-hidden="true" />
              <span className={styles.monitorLabel}>Compras</span>
            </div>
            <div className={styles.monitorValue}>
              {shoppingItems.length === 0 ? '—' : fmt(totalCompras, moedaCompras)}
            </div>
            <div className={styles.monitorMeta}>
              {shoppingItems.length === 0
                ? 'nenhum item cadastrado'
                : `${shoppingItems.length} ${shoppingItems.length === 1 ? 'item' : 'itens'}`}
            </div>
          </div>
        </section>

        {/* ── Total estimado em BRL ── */}
        <div className={styles.totalBar}>
          <span className={styles.totalLabel}>Total estimado (BRL)</span>
          <span className={styles.totalValue}>{fmt(totalBRL, 'BRL')}</span>
          <span className={styles.totalHint}>passagens + hospedagem + compras + categorias manuais</span>
        </div>

        {/* ── Categorias manuais ── */}
        <h2 className={styles.sectionLabel} style={{ marginTop: 28 }}>
          Categorias personalizadas
          <button
            type="button"
            className={styles.addCatBtn}
            onClick={() => setModalCategoria(true)}
          >
            <i className="bi bi-plus" aria-hidden="true" /> Adicionar
          </button>
        </h2>

        <section className={styles.budgetGrid}>
          {budgetCards.length === 0 ? (
            <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
              <i className="bi bi-cash-stack" aria-hidden="true" />
              <p>Nenhuma categoria personalizada ainda.</p>
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={() => setModalCategoria(true)}
              >
                + Adicionar primeira categoria
              </button>
            </div>
          ) : (
            budgetCards.map(card => (
              <article
                key={card.id}
                className={`${styles.budgetCard} ${focusedCard?.id === card.id ? styles.budgetCardFocused : ''}`}
                onClick={() => setFocusedCard(card)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.budgetCardHeader}>
                  <span className={styles.budgetTitle}>{card.name}</span>
                  <span className={styles.budgetPercent}>{card.percentage}%</span>
                </div>
                <div className={styles.budgetValue}>{fmt(card.amount, card.currency || 'BRL')}</div>
              </article>
            ))
          )}
        </section>

        {/* ── Área inferior: compras + gráfico ── */}
        {budgetCards.length > 0 && (
          <section className={styles.bottomArea}>
            <aside className={styles.shoppingCard}>
              <div className={styles.shoppingHeader}>
                <span className={styles.shoppingTitle}>Compras</span>
                <span className={styles.shoppingDanger}>
                  {shoppingItems.length} itens
                </span>
              </div>

              <div className={styles.shoppingList}>
                {shoppingItems.slice(0, 7).map((item, index) => (
                  <div key={item.id} className={styles.shoppingRow}>
                    <span className={`${styles.shoppingTag} ${TAG_CLASSES[index % 3]}`}>
                      {(item.tags ?? [])[0] || 'Item'}
                    </span>
                    <span className={styles.shoppingPrice}>
                      {fmt(item.price, item.currency || 'JPY')}
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            <div className={styles.chartArea}>
              <div
                className={styles.donutChart}
                style={{
                  background: `conic-gradient(#f58a8d 0deg ${donutDeg}, #f2f2f2 ${donutDeg} 360deg)`,
                }}
              >
                <div className={styles.donutInner} />
              </div>
            </div>
          </section>
        )}
      </Container>

      {modalCategoria && (
        <ModalAdicionarCategoria
          onClose={() => setModalCategoria(false)}
          onSaved={cat => {
            setBudgetCards(prev => [...prev, cat])
            setFocusedCard(cat)
          }}
        />
      )}
    </div>
  )
}
