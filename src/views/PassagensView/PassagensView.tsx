'use client'

import { useMemo, useState } from 'react'
import Container from '@/components/Container/Container'
import SearchBar from '@/components/SearchBar/SearchBar'
import { USUARIOS } from '@/data/usuarios'
import styles from './PassagensView.module.css'

type Passagem = {
  id: number
  companhia: string
  categoria: string
  aeroporto: string
  saida: string
  volta: string
  conexoes: number
  tempo: string
  preco: string
  cor: string
  logoUrl: string
  conexoesDetalhes: {
    titulo: string
    local: string
    chegada: string
    saida: string
  }[]
}

const PASSAGENS: Passagem[] = [
  {
    id: 1,
    companhia: 'TAP Air Portugal',
    categoria: 'Executiva',
    aeroporto: 'Aeroporto Internacional de Guarulhos',
    saida: '12/08/2026',
    volta: '29/08/2026',
    conexoes: 3,
    tempo: '33h',
    preco: '$15.000,00',
    cor: '#8EDCFA',
    logoUrl:
      'https://play-lh.googleusercontent.com/npqgU0wsILV7afp3ss0Jk82xiOLGNUo6X568jDaZJN9ptreNOuu6_8IoQ7BwW9Ykyw',
    conexoesDetalhes: [
      {
        titulo: 'Conexão 1',
        local: 'Barcelona',
        chegada: '13/08/2026 - 08:30',
        saida: '13/08/2026 - 11:10',
      },
      {
        titulo: 'Conexão 2',
        local: 'Doha',
        chegada: '13/08/2026 - 14:00',
        saida: '13/08/2026 - 17:20',
      },
      {
        titulo: 'Conexão 3',
        local: 'Osaka',
        chegada: '13/08/2026 - 14:00',
        saida: '13/08/2026 - 17:20',
      },
    ],
  },
  {
    id: 2,
    companhia: 'LATAN Airlines',
    categoria: 'Premium',
    aeroporto: 'Aeroporto Internacional de Viracopos',
    saida: '13/08/2026',
    volta: '28/08/2026',
    conexoes: 3,
    tempo: '31h',
    preco: '$22.500,00',
    cor: '#9CF2A4',
    logoUrl:
      'https://passageirodeprimeira.com/wp-content/uploads/2015/08/LATAM-LOGO-FONDO-INDIGO.jpg',
    conexoesDetalhes: [
      {
        titulo: 'Conexão 1',
        local: 'Paris',
        chegada: '14/08/2026 - 06:15',
        saida: '14/08/2026 - 08:10',
      },
      {
        titulo: 'Conexão 2',
        local: 'Frankfurt',
        chegada: '14/08/2026 - 10:40',
        saida: '14/08/2026 - 12:20',
      },
      {
        titulo: 'Conexão 3',
        local: 'Tóquio',
        chegada: '15/08/2026 - 05:45',
        saida: '15/08/2026 - 07:00',
      },
    ],
  },
  {
    id: 3,
    companhia: 'Emirates Airlines',
    categoria: 'Econômica',
    aeroporto: 'Aeroporto Internacional do Recife',
    saida: '10/08/2026',
    volta: '27/08/2026',
    conexoes: 3,
    tempo: '35h',
    preco: '$12.000,00',
    cor: '#d9d9d9',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Emirates_banner_logo.svg/3840px-Emirates_banner_logo.svg.png',
    conexoesDetalhes: [
      {
        titulo: 'Conexão 1',
        local: 'Lisboa',
        chegada: '11/08/2026 - 05:10',
        saida: '11/08/2026 - 07:00',
      },
      {
        titulo: 'Conexão 2',
        local: 'Dubai',
        chegada: '11/08/2026 - 16:30',
        saida: '11/08/2026 - 18:10',
      },
      {
        titulo: 'Conexão 3',
        local: 'Seul',
        chegada: '12/08/2026 - 08:00',
        saida: '12/08/2026 - 09:30',
      },
    ],
  },
  {
    id: 4,
    companhia: 'Qatar Airways',
    categoria: 'Economica',
    aeroporto: 'Aeroporto de Maceió',
    saida: '11/08/2026',
    volta: '30/08/2026',
    conexoes: 3,
    tempo: '32h',
    preco: '$18.000,00',
    cor: '#f1e78a',
    logoUrl:
      'https://d21buns5ku92am.cloudfront.net/69647/images/634084-QR-Logo-Full-Colour-Horizontal-bd9477-medium-1765966477.jpg',
    conexoesDetalhes: [
      {
        titulo: 'Conexão 1',
        local: 'São Paulo',
        chegada: '11/08/2026 - 09:40',
        saida: '11/08/2026 - 11:20',
      },
      {
        titulo: 'Conexão 2',
        local: 'Doha',
        chegada: '12/08/2026 - 02:00',
        saida: '12/08/2026 - 05:00',
      },
      {
        titulo: 'Conexão 3',
        local: 'Nagoya',
        chegada: '12/08/2026 - 18:10',
        saida: '12/08/2026 - 20:10',
      },
    ],
  },
]

function ModalPassagem({
  passagem,
  onClose,
}: {
  passagem: Passagem
  onClose: () => void
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>

          <div className={styles.modalHeader}>
    <div className={styles.modalBrand}>
      <img
        src={passagem.logoUrl}
        alt={passagem.companhia}
        className={styles.modalLogo}
      />
      <div>
        <h3 className={styles.modalTitle}>
          {passagem.companhia}{' '}
          <span className={styles.modalCategory}>
            ({passagem.categoria})
          </span>
        </h3>
        <p className={styles.modalAirport}>{passagem.aeroporto}</p>
      </div>
    </div>

    <div className={styles.modalPrice}>{passagem.preco}</div>
  </div>

  <div className={styles.modalTopInfo}>
    <div>
      <div className={styles.modalSectionTitle}>Ida</div>
      <p>Partida: {passagem.saida}</p>
      <p>Chegada: —</p>
    </div>

    <div>
      <div className={styles.modalSectionTitle}>Volta</div>
      <p>Partida: {passagem.volta}</p>
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
              <div className={styles.stopItem}>
                <span className={styles.stopDot} />
                <span>Conexão 1</span>
              </div>
              <div className={styles.stopItem}>
                <span className={styles.stopDot} />
                <span>Conexão 2</span>
              </div>
              <div className={styles.stopItem}>
                <span className={styles.stopDot} />
                <span>Conexão 3</span>
              </div>
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
            {passagem.conexoesDetalhes.map((conexao) => (
              <div key={conexao.titulo} className={styles.connectionBox}>
                <div className={styles.connectionHeader}>
                  <span>{conexao.titulo}</span>
                  <span className={styles.connectionPlace}>
                    {conexao.local} da conexão
                  </span>
                </div>
                <div className={styles.connectionLines}>
                  <p>Chegada&nbsp;&nbsp; {conexao.chegada}</p>
                  <p>Saída&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {conexao.saida}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PassagensView() {
  const [query, setQuery] = useState('')
  const [selecionada, setSelecionada] = useState<Passagem | null>(PASSAGENS[0])
  const [modalPassagem, setModalPassagem] = useState<Passagem | null>(null)

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PASSAGENS

    return PASSAGENS.filter(
      (item) =>
        item.companhia.toLowerCase().includes(q) ||
        item.aeroporto.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className={styles.wrapper}>
      <Container>
        <div className={styles.grid}>
          <section className={styles.colLeft}>
            <div className={styles.searchWrap}>
              <SearchBar
                placeholder="Pesquisa"
                value={query}
                onChange={setQuery}
              />
            </div>

            <div className={styles.leftList}>
              {resultados.map((item, index) => {
                const usuario = USUARIOS[index % USUARIOS.length]

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.flightRow} ${
                      selecionada?.id === item.id ? styles.flightRowActive : ''
                    }`}
                    onClick={() => setSelecionada(item)}
                  >
                    <div className={styles.userAvatarWrap}>
                      <img
                        src={usuario.avatarUrl}
                        alt={usuario.nome}
                        className={styles.userAvatar}
                      />
                      <span
                        className={styles.userAvatarGhost}
                        style={{ backgroundColor: usuario.cor }}
                      />
                    </div>

                    <div className={styles.flightMain}>
                      <div className={styles.flightTop}>
                        <div>
                          <strong className={styles.companyName}>
                            {item.companhia}
                          </strong>
                          <p className={styles.airportText}>{item.aeroporto}</p>
                        </div>

                        <div className={styles.flightMetaGrid}>
                          <span>{item.saida}</span>
                          <span>{item.volta}</span>
                          <span className={styles.metaDanger}>
                            Conexões: {item.conexoes}
                          </span>
                          <span className={styles.metaDanger}>
                            Tempo de viagem: {item.tempo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.priceSmall}>{item.preco}</div>
                  </button>
                )
              })}
            </div>
          </section>

          <aside className={styles.colRight}>
            <div className={styles.detailList}>
              {resultados.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.detailCard} ${
                    selecionada?.id === item.id ? styles.detailCardActive : ''
                  }`}
                  onClick={() => setModalPassagem(item)}
                >
                  <div className={styles.detailInfo}>
                    <div className={styles.detailHeader}>
                      <div className={styles.detailBrand}>
                        <img
                          src={item.logoUrl}
                          alt={item.companhia}
                          className={styles.airlineLogo}
                        />

                        <div>
                          <div className={styles.detailCompany}>
                            {item.companhia}{' '}
                            <span className={styles.detailCategory}>
                              ({item.categoria})
                            </span>
                          </div>
                          <div className={styles.detailAirport}>Aeroporto</div>
                        </div>
                      </div>

                      <div className={styles.detailPrice}>{item.preco}</div>
                    </div>

                    <div className={styles.detailBody}>
                      <div className={styles.detailTimes}>
                        <span>Partida (ida): {item.saida}</span>
                        <span>Chegada (ida): —</span>
                        <span>Partida (volta): {item.volta}</span>
                        <span>Chegada (volta): —</span>
                      </div>

                      <div className={styles.detailConnections}>
                        <span>Conexão 1</span>
                        <span>Conexão 2</span>
                        <span>Conexão 3</span>
                        <span>...</span>
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
        <ModalPassagem
          passagem={modalPassagem}
          onClose={() => setModalPassagem(null)}
        />
      )}
    </div>
  )
}