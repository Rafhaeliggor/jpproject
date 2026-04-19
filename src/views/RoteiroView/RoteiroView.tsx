'use client'

import { useState, useMemo } from 'react'
import Container from '@/components/Container/Container'
import SearchBar from '@/components/SearchBar/SearchBar'
import MiniCard from '@/components/MiniCard/MiniCard'
import RoteiroItem from '@/components/RoteiroItem/RoteiroItem'
import ModalDetalhesLocal from '@/components/ModalDetalhesLocal/ModalDetalhesLocal'
import InfoCard from '@/components/InfoCard/InfoCard'
import UserRankingItem from '@/components/UserRankingItem/UserRankingItem'
import { LOCAIS_DISPONIVEIS, type Local } from '@/data/locais'
import { USUARIOS } from '@/data/usuarios'
import styles from './RoteiroView.module.css'

function minutesToTime(total: number): string {
  if (total === 0) return '—'
  const h = Math.floor(total / 60)
  const m = total % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}


export default function RoteiroView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [rightOpen, setRightOpen] = useState(false)

  const [roteiro, setRoteiro] = useState<Local[]>(() =>
    LOCAIS_DISPONIVEIS.slice(0, 3),
  )

  const [modalLocal, setModalLocal] = useState<Local | null>(null)

  const resultados = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return LOCAIS_DISPONIVEIS.filter((l) =>
      l.nome.toLowerCase().includes(q),
    )
  }, [searchQuery])

  const adicionarAoRoteiro = (local: Local) => {
    if (roteiro.find((r) => r.id === local.id)) return
    setRoteiro((prev) => [...prev, local])
    setSearchQuery('')
  }

  const removerDoRoteiro = (id: number) => {
    setRoteiro((prev) => prev.filter((r) => r.id !== id))
  }

  const tempoTotalMin = roteiro.reduce((sum, l) => sum + l.tempoMinutos, 0)
  const tempoTotal = minutesToTime(tempoTotalMin)
  const cidades = [...new Set(roteiro.map((l) => l.cidade))]

  return (
    <div className={styles.wrapper}>
      <span className={styles.decoText} aria-hidden="true">
        日程
      </span>

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
                    {resultados.map((local) => (
                      <MiniCard
                        key={local.id}
                        nome={local.nome}
                        endereco={local.endereco}
                        imagemUrl={local.imagemUrl}
                        onClick={() => adicionarAoRoteiro(local)}
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
              {roteiro.length === 0 ? (
                <div className={styles.roteiroVazio}>
                  <i className="bi bi-map" aria-hidden="true" />
                  <span>
                    Pesquise locais à esquerda e clique para adicioná-los.
                  </span>
                </div>
              ) : (
                roteiro.map((local) => {
                  const votantes = USUARIOS.filter((u) =>
                    local.votanteIds.includes(u.id),
                  )
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
              onClick={() => setRightOpen((o) => !o)}
              aria-expanded={rightOpen}
            >
              <span>Resumo &amp; Participantes</span>
              <i
                className={[
                  'bi bi-chevron-down',
                  styles.colChevron,
                  rightOpen ? styles.colChevronOpen : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
            </button>

            <div
              className={[
                styles.colBody,
                rightOpen ? styles.colBodyOpen : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <InfoCard
                tempoTotal={tempoTotal}
                totalLocais={roteiro.length}
                cidades={cidades}
              />

              <div className={styles.participantes}>
                <h3 className={styles.participantesTitle}>Participantes</h3>
                <div className={styles.participantesList}>
                  {USUARIOS.map((u) => (
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
          votantes={USUARIOS.filter((u) =>
            modalLocal.votanteIds.includes(u.id),
          )}
          onClose={() => setModalLocal(null)}
        />
      )}
    </div>
  )
}
