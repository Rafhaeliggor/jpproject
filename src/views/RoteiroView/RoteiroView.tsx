'use client'

import { useState, useMemo, useEffect } from 'react'
import Container from '@/components/Container/Container'
import SearchBar from '@/components/SearchBar/SearchBar'
import MiniCard from '@/components/MiniCard/MiniCard'
import RoteiroItem from '@/components/RoteiroItem/RoteiroItem'
import ModalDetalhesLocal from '@/components/ModalDetalhesLocal/ModalDetalhesLocal'
import InfoCard from '@/components/InfoCard/InfoCard'
import UserRankingItem from '@/components/UserRankingItem/UserRankingItem'
import { type Local } from '@/data/locais'
import { type Usuario } from '@/data/usuarios'
import { api, type Location, type User } from '@/lib/api'
import styles from './RoteiroView.module.css'

function minutesToTime(total: number): string {
  if (total === 0) return '—'
  const h = Math.floor(total / 60)
  const m = total % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function toLocal(loc: Location): Local {
  return {
    id: loc.id,
    nome: loc.name,
    endereco: loc.address,
    cidade: loc.city,
    tempoMedio: loc.duration_label,
    tempoMinutos: loc.duration_minutes,
    tags: loc.tags ?? [],
    descricao: loc.description,
    imagemUrl: loc.image_url,
    coordenadas: [loc.lat, loc.lng],
    votanteIds: loc.voter_ids ?? [],
  }
}

function toUsuario(u: User): Usuario {
  return {
    id: u.id,
    nome: u.name,
    iniciais: u.initials,
    avatarUrl: u.avatar_url || `https://picsum.photos/seed/${u.initials}/64/64`,
    cor: u.color,
    locaisAdicionados: 0,
  }
}

const EMPTY_LOCAL_FORM = { name: '', address: '', city: '', duration_label: '', duration_minutes: '', description: '' }

function ModalAdicionarLocal({ onClose, onSaved }: { onClose: () => void; onSaved: (loc: Location) => void }) {
  const [form, setForm] = useState(EMPTY_LOCAL_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof typeof EMPTY_LOCAL_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      const created = await api.locations.create({
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        duration_label: form.duration_label.trim(),
        duration_minutes: parseInt(form.duration_minutes) || 0,
        description: form.description.trim(),
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
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--color-surface)', borderRadius: 10, padding: 24, width: 'min(480px,92%)', position: 'relative' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" onClick={onClose} aria-label="Fechar" style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>×</button>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-text-primary)' }}>Adicionar Local</h3>
        <form onSubmit={submit}>
          {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 8 }}>{error}</p>}
          {[
            { label: 'Nome *', field: 'name' as const, placeholder: 'Ex: Templo Sensoji' },
            { label: 'Endereço', field: 'address' as const, placeholder: 'Ex: 2 Chome-3-1 Asakusa' },
            { label: 'Cidade', field: 'city' as const, placeholder: 'Ex: Tokyo' },
            { label: 'Duração (label)', field: 'duration_label' as const, placeholder: 'Ex: 2h' },
            { label: 'Duração (minutos)', field: 'duration_minutes' as const, placeholder: 'Ex: 120' },
          ].map(({ label, field, placeholder }) => (
            <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              {label}
              <input
                style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}
                value={form[field]}
                onChange={e => set(field, e.target.value)}
                placeholder={placeholder}
                type={field === 'duration_minutes' ? 'number' : 'text'}
              />
            </label>
          ))}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Descrição
            <textarea
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)', fontSize: '0.9rem', resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Descrição do local…"
            />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'rgba(99,102,241,0.85)', color: '#fff', cursor: 'pointer' }}>{saving ? 'Salvando…' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RoteiroView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [rightOpen, setRightOpen] = useState(false)
  const [modalLocal2, setModalLocal2] = useState(false)

  const [allLocations, setAllLocations] = useState<Location[]>([])
  const [itinerary, setItinerary] = useState<Location[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [modalLocal, setModalLocal] = useState<Local | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.locations.list(), api.itinerary.list(), api.users.list()])
      .then(([locs, itin, usrs]) => {
        setAllLocations(locs)
        setItinerary(itin)
        setUsers(usrs)
      })
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  const resultados = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return allLocations.filter(l =>
      l.name.toLowerCase().includes(q) && !itinerary.find(i => i.id === l.id),
    )
  }, [searchQuery, allLocations, itinerary])

  const adicionarAoRoteiro = async (loc: Location) => {
    try {
      const updated = await api.itinerary.add(loc.id)
      setItinerary(updated)
      setSearchQuery('')
    } catch {
      setError('Não foi possível adicionar ao roteiro.')
    }
  }

  const removerDoRoteiro = async (id: number) => {
    try {
      const updated = await api.itinerary.remove(id)
      setItinerary(updated)
    } catch {
      setError('Não foi possível remover do roteiro.')
    }
  }

  const votarNoLocal = async (id: number) => {
    try {
      const updated = await api.locations.vote(id)
      setItinerary(prev => prev.map(l => (l.id === updated.id ? updated : l)))
      setAllLocations(prev => prev.map(l => (l.id === updated.id ? updated : l)))
      if (modalLocal?.id === updated.id) setModalLocal(toLocal(updated))
    } catch {
      setError('Não foi possível registrar o voto.')
    }
  }

  const roteiro = itinerary.map(toLocal)
  const locaisLocais = allLocations.map(toLocal)
  const usuarios = users.map(toUsuario)

  const tempoTotal = minutesToTime(itinerary.reduce((s, l) => s + l.duration_minutes, 0))
  const cidades = [...new Set(itinerary.map(l => l.city))]

  const participantesComContagem = users.map(u => ({
    ...toUsuario(u),
    locaisAdicionados: itinerary.filter(l => (l.voter_ids ?? []).includes(u.id)).length,
  }))

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Container>
          <p style={{ padding: '2rem', color: '#6b7280' }}>Carregando roteiro...</p>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.decoText} aria-hidden="true">日程</span>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <Container>
        <div className={styles.grid}>

          <aside className={styles.colLeft}>
            <div className={styles.colCard}>
              <SearchBar
                placeholder="Pesquisa"
                value={searchQuery}
                onChange={setSearchQuery}
                showAdd
              />

              {resultados.length > 0 && (
                <div className={styles.resultados}>
                  {resultados.map(loc => (
                    <MiniCard
                      key={loc.id}
                      nome={loc.name}
                      endereco={loc.address}
                      imagemUrl={loc.image_url}
                      onClick={() => adicionarAoRoteiro(loc)}
                    />
                  ))}
                </div>
              )}

              {searchQuery.trim() !== '' && resultados.length === 0 && (
                <p className={styles.semResultados}>
                  Nenhum local encontrado para &ldquo;{searchQuery}&rdquo;.
                </p>
              )}

              {searchQuery.trim() === '' && (
                <p className={styles.hint}>
                  <i className="bi bi-search" aria-hidden="true" />{' '}
                  Digite para pesquisar locais e adicioná-los ao roteiro.
                </p>
              )}
            </div>
          </aside>

          <section className={styles.colCenter}>
            <SearchBar
              placeholder="Filtrar roteiro…"
              value=""
              onChange={() => {}}
              className={styles.roteiroSearch}
            />

            <div className={styles.roteiroList}>
              {roteiro.length === 0 && allLocations.length === 0 ? (
                <div className={styles.roteiroVazio}>
                  <i className="bi bi-map" aria-hidden="true" />
                  <span>Nenhum local cadastrado ainda.</span>
                  <button
                    type="button"
                    onClick={() => setModalLocal2(true)}
                    style={{ marginTop: 8, padding: '8px 18px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.12)', color: 'rgba(180,185,255,0.9)', fontSize: '0.875rem', cursor: 'pointer' }}
                  >
                    + Adicionar primeiro local
                  </button>
                </div>
              ) : roteiro.length === 0 ? (
                <div className={styles.roteiroVazio}>
                  <i className="bi bi-map" aria-hidden="true" />
                  <span>Pesquise locais à esquerda e clique para adicioná-los.</span>
                </div>
              ) : (
                roteiro.map(local => {
                  const votantes = usuarios.filter(u => local.votanteIds.includes(u.id))
                  return (
                    <RoteiroItem
                      key={local.id}
                      local={local}
                      votantes={votantes}
                      onClick={() => setModalLocal(local)}
                      onRemove={() => removerDoRoteiro(local.id)}
                    />
                  )
                })
              )}
            </div>
          </section>

          <aside className={styles.colRight}>
            <button
              className={styles.colToggle}
              onClick={() => setRightOpen(o => !o)}
              aria-expanded={rightOpen}
            >
              <span>Resumo &amp; Participantes</span>
              <i
                className={[
                  'bi bi-chevron-down',
                  styles.colChevron,
                  rightOpen ? styles.colChevronOpen : '',
                ].filter(Boolean).join(' ')}
                aria-hidden="true"
              />
            </button>

            <div
              className={[styles.colBody, rightOpen ? styles.colBodyOpen : ''].filter(Boolean).join(' ')}
            >
              <InfoCard
                tempoTotal={tempoTotal}
                totalLocais={roteiro.length}
                cidades={cidades}
              />

              <div className={styles.participantes}>
                <h3 className={styles.participantesTitle}>Participantes</h3>
                <div className={styles.participantesList}>
                  {participantesComContagem.map(u => (
                    <UserRankingItem key={u.id} usuario={u} />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {modalLocal && (
        <ModalDetalhesLocal
          local={modalLocal}
          votantes={usuarios.filter(u => modalLocal.votanteIds.includes(u.id))}
          onClose={() => setModalLocal(null)}
        />
      )}
      {modalLocal2 && (
        <ModalAdicionarLocal
          onClose={() => setModalLocal2(false)}
          onSaved={loc => setAllLocations(prev => [...prev, loc])}
        />
      )}
    </div>
  )
}
