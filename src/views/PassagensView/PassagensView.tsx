'use client'

import { useMemo, useState, useEffect } from 'react'
import Container from '@/components/Container/Container'
import SearchBar from '@/components/SearchBar/SearchBar'
import { api, type Flight, type FlightConnection } from '@/lib/api'
import styles from './PassagensView.module.css'

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency || 'BRL' }).format(price)
}

// ─── Modal Detalhes ───────────────────────────────────────────────────────────
function ModalPassagem({ flight, onClose }: { flight: Flight; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Fechar">
          ×
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.modalBrand}>
            {flight.logo_url ? (
              <img
                src={flight.logo_url}
                alt={flight.airline}
                className={styles.modalLogo}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <span className={styles.airlineLogoFallback} style={{ backgroundColor: flight.color, width: 42, height: 42, fontSize: '1rem' }}>
                {flight.airline.charAt(0)}
              </span>
            )}
            <div>
              <h3 className={styles.modalTitle}>
                {flight.airline}{' '}
                <span className={styles.modalCategory}>({flight.category})</span>
              </h3>
              <p className={styles.modalAirport}>{flight.airport}</p>
            </div>
          </div>
          <div className={styles.modalPrice}>{formatPrice(flight.price, flight.currency)}</div>
        </div>

        <div className={styles.modalTopInfo}>
          <div>
            <div className={styles.modalSectionTitle}>Ida</div>
            <p>Partida: {flight.departure_date}</p>
            <p>Chegada: —</p>
          </div>
          <div>
            <div className={styles.modalSectionTitle}>Volta</div>
            <p>Partida: {flight.return_date}</p>
            <p>Chegada: —</p>
          </div>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.timelineWrap}>
            <div className={styles.timelineLine} />
            <div className={styles.timelineStops}>
              <div className={styles.stopItem}>
                <span className={styles.stopDot} />
                <span>Brasil</span>
              </div>
              {(flight.connections ?? []).map(c => (
                <div key={c.id} className={styles.stopItem}>
                  <span className={styles.stopDot} />
                  <span>{c.title}</span>
                </div>
              ))}
              <div className={styles.stopItem}>
                <span className={styles.stopDot} />
                <span>Japão</span>
              </div>
            </div>
            <button type="button" className={styles.editButton}>
              Editar
            </button>
          </div>

          <div className={styles.connectionsPanel}>
            {(flight.connections ?? []).map(c => (
              <div key={c.id} className={styles.connectionBox}>
                <div className={styles.connectionHeader}>
                  <span>{c.title}</span>
                  <span className={styles.connectionPlace}>{c.location} da conexão</span>
                </div>
                <div className={styles.connectionLines}>
                  <p>Chegada&nbsp;&nbsp; {c.arrival_time}</p>
                  <p>Saída&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {c.departure_time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Adicionar ──────────────────────────────────────────────────────────
interface ConnectionForm {
  title: string
  location: string
  arrival_time: string
  departure_time: string
}

interface FlightForm {
  airline: string
  category: string
  airport: string
  departure_date: string
  return_date: string
  price: string
  currency: string
  travel_duration: string
  logo_url: string
  color: string
  connections: ConnectionForm[]
}

const EMPTY_FORM: FlightForm = {
  airline: '',
  category: 'Econômica',
  airport: '',
  departure_date: '',
  return_date: '',
  price: '',
  currency: 'BRL',
  travel_duration: '',
  logo_url: '',
  color: '#6366f1',
  connections: [],
}

function ModalAdicionarVoo({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FlightForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof Omit<FlightForm, 'connections'>, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function addConn() {
    setForm(prev => ({
      ...prev,
      connections: [
        ...prev.connections,
        { title: `Conexão ${prev.connections.length + 1}`, location: '', arrival_time: '', departure_time: '' },
      ],
    }))
  }

  function updateConn(i: number, field: keyof ConnectionForm, value: string) {
    setForm(prev => {
      const conns = [...prev.connections]
      conns[i] = { ...conns[i], [field]: value }
      return { ...prev, connections: conns }
    })
  }

  function removeConn(i: number) {
    setForm(prev => ({ ...prev, connections: prev.connections.filter((_, idx) => idx !== i) }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.airline.trim()) { setError('Companhia é obrigatória.'); return }
    setSaving(true)
    setError('')
    try {
      await api.flights.create({
        airline: form.airline.trim(),
        category: form.category,
        airport: form.airport.trim(),
        departure_date: form.departure_date,
        return_date: form.return_date,
        price: Number(form.price) || 0,
        currency: form.currency,
        travel_duration: form.travel_duration.trim(),
        logo_url: form.logo_url.trim(),
        color: form.color,
        connection_count: form.connections.length,
        connections: form.connections.map((c, idx): FlightConnection => ({
          id: 0,
          flight_id: 0,
          order_index: idx + 1,
          title: c.title,
          location: c.location,
          arrival_time: c.arrival_time,
          departure_time: c.departure_time,
        })),
      })
      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar voo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar passagem"
      >
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Fechar">×</button>
        <h3 className={styles.modalAddTitle}>Adicionar Passagem</h3>

        <form onSubmit={submit} className={styles.form}>
          {error && <p className={styles.formError}>{error}</p>}

          <div className={styles.formGrid}>
            <label className={styles.formField}>
              <span>Companhia *</span>
              <input
                type="text"
                value={form.airline}
                onChange={e => set('airline', e.target.value)}
                placeholder="Ex: LATAM Airlines"
              />
            </label>
            <label className={styles.formField}>
              <span>Categoria</span>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                <option>Econômica</option>
                <option>Premium</option>
                <option>Executiva</option>
              </select>
            </label>
            <label className={`${styles.formField} ${styles.formFieldFull}`}>
              <span>Aeroporto de Partida</span>
              <input
                type="text"
                value={form.airport}
                onChange={e => set('airport', e.target.value)}
                placeholder="Ex: Aeroporto GRU (São Paulo)"
              />
            </label>
            <label className={styles.formField}>
              <span>Data de Ida</span>
              <input type="date" value={form.departure_date} onChange={e => set('departure_date', e.target.value)} />
            </label>
            <label className={styles.formField}>
              <span>Data de Volta</span>
              <input type="date" value={form.return_date} onChange={e => set('return_date', e.target.value)} />
            </label>
            <label className={styles.formField}>
              <span>Preço</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0"
              />
            </label>
            <label className={styles.formField}>
              <span>Moeda</span>
              <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option>BRL</option>
                <option>USD</option>
                <option>EUR</option>
                <option>JPY</option>
              </select>
            </label>
            <label className={styles.formField}>
              <span>Tempo de Viagem</span>
              <input
                type="text"
                value={form.travel_duration}
                onChange={e => set('travel_duration', e.target.value)}
                placeholder="Ex: 26h00"
              />
            </label>
            <label className={styles.formField}>
              <span>Cor da Companhia</span>
              <input
                type="color"
                value={form.color}
                onChange={e => set('color', e.target.value)}
                className={styles.colorInput}
              />
            </label>
            <label className={`${styles.formField} ${styles.formFieldFull}`}>
              <span>Logo URL <span className={styles.optional}>(opcional)</span></span>
              <input
                type="url"
                value={form.logo_url}
                onChange={e => set('logo_url', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <div className={styles.connSection}>
            <div className={styles.connSectionHead}>
              <span>Conexões</span>
              <button type="button" className={styles.addConnBtn} onClick={addConn}>
                <i className="bi bi-plus" aria-hidden="true" /> Adicionar
              </button>
            </div>
            {form.connections.map((c, i) => (
              <div key={i} className={styles.connRow}>
                <input
                  className={styles.connInput}
                  placeholder="Título"
                  value={c.title}
                  onChange={e => updateConn(i, 'title', e.target.value)}
                />
                <input
                  className={`${styles.connInput} ${styles.connInputWide}`}
                  placeholder="Local (ex: Lisboa, PT - LIS)"
                  value={c.location}
                  onChange={e => updateConn(i, 'location', e.target.value)}
                />
                <input
                  className={styles.connInput}
                  placeholder="Chegada"
                  value={c.arrival_time}
                  onChange={e => updateConn(i, 'arrival_time', e.target.value)}
                />
                <input
                  className={styles.connInput}
                  placeholder="Saída"
                  value={c.departure_time}
                  onChange={e => updateConn(i, 'departure_time', e.target.value)}
                />
                <button
                  type="button"
                  className={styles.removeConnBtn}
                  onClick={() => removeConn(i)}
                  aria-label="Remover conexão"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar Voo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function PassagensView() {
  const [query, setQuery] = useState('')
  const [flights, setFlights] = useState<Flight[]>([])
  const [selecionada, setSelecionada] = useState<Flight | null>(null)
  const [modalPassagem, setModalPassagem] = useState<Flight | null>(null)
  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.flights.list()
      .then(data => {
        setFlights(data)
        if (data.length > 0) setSelecionada(data[0])
      })
      .catch(() => setError('Erro ao carregar passagens.'))
      .finally(() => setLoading(false))
  }, [])

  function refreshFlights() {
    api.flights.list()
      .then(data => setFlights(data))
      .catch(() => setError('Erro ao atualizar passagens.'))
  }

  const removerVoo = async (id: number) => {
    try {
      await api.flights.delete(id)
      setFlights(prev => prev.filter(f => f.id !== id))
      if (selecionada?.id === id) setSelecionada(null)
      if (modalPassagem?.id === id) setModalPassagem(null)
    } catch {
      setError('Não foi possível remover o voo.')
    }
  }

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return flights
    return flights.filter(
      f =>
        f.airline.toLowerCase().includes(q) ||
        f.airport.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q),
    )
  }, [query, flights])

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Container>
          <p style={{ padding: '2rem', color: '#6b7280' }}>Carregando passagens...</p>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <Container>
        <div className={styles.grid}>
          <section className={styles.colLeft}>
            <div className={styles.topBar}>
              <div className={styles.searchWrap}>
                <SearchBar placeholder="Pesquisa" value={query} onChange={setQuery} />
              </div>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => setModalAdicionar(true)}
              >
                <i className="bi bi-plus-lg" aria-hidden="true" /> Adicionar
              </button>
            </div>

            <div className={styles.leftList}>
              {flights.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="bi bi-airplane" aria-hidden="true" />
                  <p>Nenhuma passagem cadastrada.</p>
                  <button
                    type="button"
                    className={styles.emptyBtn}
                    onClick={() => setModalAdicionar(true)}
                  >
                    + Adicionar primeira passagem
                  </button>
                </div>
              )}
              {flights.length > 0 && resultados.length === 0 && (
                <div className={styles.emptyState}>
                  <i className="bi bi-search" aria-hidden="true" />
                  <p>Nenhuma passagem encontrada para &ldquo;{query}&rdquo;.</p>
                </div>
              )}
              {resultados.map(item => (
                <div key={item.id} className={styles.flightRowWrap}>
                  <button
                    type="button"
                    className={`${styles.flightRow} ${selecionada?.id === item.id ? styles.flightRowActive : ''}`}
                    onClick={() => setSelecionada(item)}
                  >
                    <div className={styles.flightMain}>
                      <div className={styles.flightTop}>
                        <div>
                          <strong className={styles.companyName}>{item.airline}</strong>
                          <p className={styles.airportText}>{item.airport}</p>
                        </div>

                        <div className={styles.flightMetaGrid}>
                          <span>{item.departure_date}</span>
                          <span>{item.return_date}</span>
                          <span className={styles.metaDanger}>
                            Conexões: {item.connection_count}
                          </span>
                          <span className={styles.metaDanger}>
                            Tempo de viagem: {item.travel_duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.priceSmall}>{formatPrice(item.price, item.currency)}</div>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => removerVoo(item.id)}
                    aria-label={`Remover ${item.airline}`}
                  >
                    <i className="bi bi-trash3" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <aside className={styles.colRight}>
            <div className={styles.detailList}>
              {resultados.slice(0, 4).map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.detailCard} ${selecionada?.id === item.id ? styles.detailCardActive : ''}`}
                  onClick={() => setModalPassagem(item)}
                >
                  <div className={styles.detailInfo}>
                    <div className={styles.detailHeader}>
                      <div className={styles.detailBrand}>
                        {item.logo_url ? (
                          <img
                            src={item.logo_url}
                            alt={item.airline}
                            className={styles.airlineLogo}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <span
                            className={styles.airlineLogoFallback}
                            style={{ backgroundColor: item.color }}
                          >
                            {item.airline.charAt(0)}
                          </span>
                        )}
                        <div>
                          <div className={styles.detailCompany}>
                            {item.airline}{' '}
                            <span className={styles.detailCategory}>({item.category})</span>
                          </div>
                          <div className={styles.detailAirport}>{item.airport}</div>
                        </div>
                      </div>
                      <div className={styles.detailPrice}>{formatPrice(item.price, item.currency)}</div>
                    </div>

                    <div className={styles.detailBody}>
                      <div className={styles.detailTimes}>
                        <span>Partida (ida): {item.departure_date}</span>
                        <span>Chegada (ida): —</span>
                        <span>Partida (volta): {item.return_date}</span>
                        <span>Chegada (volta): —</span>
                      </div>
                      <div className={styles.detailConnections}>
                        {(item.connections ?? []).slice(0, 3).map(c => (
                          <span key={c.id}>{c.title}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.previewBox}>
                    <div className={styles.previewMenu}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </Container>

      {modalPassagem && (
        <ModalPassagem flight={modalPassagem} onClose={() => setModalPassagem(null)} />
      )}
      {modalAdicionar && (
        <ModalAdicionarVoo
          onClose={() => setModalAdicionar(false)}
          onSaved={refreshFlights}
        />
      )}
    </div>
  )
}
