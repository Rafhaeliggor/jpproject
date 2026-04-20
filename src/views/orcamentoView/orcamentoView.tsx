'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Container from '@/components/Container/Container'
import styles from './orcamentoView.module.css'

type Item = {
  id: number
  nome: string
  descricao: string
  tags: string[]
  local: string
  preco: string
  imagemUrl?: string
}

type BudgetCard = {
  titulo: string
  valor: string
  percentual: number
}

const SAMPLE: Item[] = [
  {
    id: 1,
    nome: 'Kit Kat Sabor Chá Verde (Matcha)',
    descricao: 'Edição japonesa do Kit Kat com matcha premium.',
    tags: ['Tag'],
    local: 'Loja de Conveniência',
    preco: '2000',
  },
  {
    id: 2,
    nome: 'Senbei',
    descricao: 'Biscoito de arroz tradicional.',
    tags: ['Tag'],
    local: 'Loja de Souvenirs',
    preco: '150',
  },
  {
    id: 3,
    nome: 'Sake Junmai',
    descricao: 'Garrafa pequena de sake local.',
    tags: ['Tag'],
    local: 'Loja de Bebidas',
    preco: '700',
  },
  {
    id: 4,
    nome: 'Tenugui',
    descricao: 'Pano tradicional japonês.',
    tags: ['Tag'],
    local: 'Mercado Local',
    preco: '205',
  },
  {
    id: 5,
    nome: 'Omamori',
    descricao: 'Amuleto tradicional da sorte.',
    tags: ['Tag'],
    local: 'Templo',
    preco: '1524',
  },
  {
    id: 6,
    nome: 'Matcha',
    descricao: 'Matcha de qualidade cerimonial.',
    tags: ['Tag'],
    local: 'Loja de Chá',
    preco: '4053',
  },
  {
    id: 7,
    nome: 'Furoshiki',
    descricao: 'Tecido reutilizável para presentes.',
    tags: ['Tag'],
    local: 'Loja de Artesanato',
    preco: '2503',
  },
]

const BUDGET_CARDS: BudgetCard[] = [
  { titulo: 'Passagem', valor: 'R$12030', percentual: 12 },
  { titulo: 'Alimentação', valor: '$5000', percentual: 38 },
  { titulo: 'Transporte', valor: '$2400', percentual: 20 },
  { titulo: 'Hospedágem', valor: '$5200', percentual: 5 },
  { titulo: 'Ingressos', valor: '$1500', percentual: 10 },
  { titulo: 'Reservas', valor: '$170', percentual: 25 },
]

const MENU_ITEMS = [
  'ROTEIRO',
  'PASSAGENS',
  'HOSPEDAGEM',
  'COMPRAS',
  'ORÇAMENTO',
]

export default function OrcamentoView() {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem('compras_items')
      if (raw) {
        const stored = JSON.parse(raw) as Item[]
        return stored.length ? stored : SAMPLE
      }
    } catch {
      /* ignore */
    }
    return SAMPLE
  })

  useEffect(() => {
    try {
      localStorage.setItem('compras_items', JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])

  const totalCompras = useMemo(() => {
    return items.reduce((acc, item) => {
      const n = Number(String(item.preco).replace(/[^\d.-]/g, ''))
      return acc + (Number.isFinite(n) ? n : 0)
    }, 0)
  }, [items])

  const donutPercent = 12
  const donutDeg = `${Math.round((donutPercent / 100) * 360)}deg`

  return (
    <div className={styles.wrapper}>
      <span className={styles.topTime}>180日22時11分</span>

      <div className={styles.userBox}>
        <span className={styles.userName}>Iggor Raphael</span>
        <span className={styles.userAvatar} />
      </div>

      <span className={styles.decoText} aria-hidden>
        予算
      </span>

      <Container>
        <nav className={styles.topNav}>
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={`${styles.navItem} ${
                item === 'ORÇAMENTO' ? styles.navItemActive : ''
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <section className={styles.budgetGrid}>
          {BUDGET_CARDS.map((card) => (
            <article key={card.titulo} className={styles.budgetCard}>
              <div className={styles.budgetCardHeader}>
                <span className={styles.budgetTitle}>{card.titulo}</span>
                <span className={styles.budgetPercent}>{card.percentual}%</span>
              </div>

              <div className={styles.budgetValue}>{card.valor}</div>
            </article>
          ))}
        </section>

        <section className={styles.bottomArea}>
          <aside className={styles.shoppingCard}>
            <div className={styles.shoppingHeader}>
              <span className={styles.shoppingTitle}>Compras</span>
              <span className={styles.shoppingDanger}>x%</span>
            </div>

            <div className={styles.shoppingList}>
              {items.slice(0, 7).map((item, index) => (
                <div key={item.id} className={styles.shoppingRow}>
                  <span
                    className={`${styles.shoppingTag} ${
                      index % 3 === 0
                        ? styles.tagPink
                        : index % 3 === 1
                        ? styles.tagYellow
                        : styles.tagBlue
                    }`}
                  >
                    {item.tags[0] || 'Tag'}
                  </span>

                  <span className={styles.shoppingPrice}>{item.preco}R$</span>
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

            <div className={styles.chartValue}>12%</div>
            <div className={styles.chartLabel}>Passagem</div>
            <div className={styles.chartTotal}>Compras: R${totalCompras}</div>
          </div>
        </section>
      </Container>
    </div>
  )
}