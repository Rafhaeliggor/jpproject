'use client'

import React, { useEffect, useState } from 'react'
import Container from '@/components/Container/Container'
import SearchBar from '@/components/SearchBar/SearchBar'
import styles from './ComprasView.module.css'

type Item = {
  id: number
  nome: string
  descricao: string
  tags: string[]
  local: string
  preco: string
  imagemUrl?: string
}

const SAMPLE: Item[] = [
  {
    id: 1,
    nome: 'Kit Kat Sabor Chá Verde (Matcha)',
    descricao: 'Edição japonesa do Kit Kat com matcha premium.',
    tags: ['Doce', 'Snack'],
    local: 'Loja de Conveniência',
    preco: '¥450',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Kit_Kat_Matcha-9136.jpg',
  },
  {
    id: 2,
    nome: 'Senbei (Biscoito de Arroz) — Sorteio Omiyage',
    descricao: 'Senbei artesanal salgado, perfeito como lembrança.',
    tags: ['Snack', 'Omiyage'],
    local: 'Loja de Souvenirs',
    preco: '¥600',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Japanese_Senbeis.jpg',
  },
  {
    id: 3,
    nome: 'Sake Junmai 300ml',
    descricao: 'Garrafa pequena de sake local — degustação.',
    tags: ['Bebida', 'Alcool'],
    local: 'Loja de Bebidas',
    preco: '¥1,200',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Sake_bottles.jpg',
  },
  {
    id: 4,
    nome: 'Tenugui (Pano Tradicional)',
    descricao: 'Pano multiuso com estampa tradicional japonesa.',
    tags: ['Souvenir', 'Utensílio'],
    local: 'Mercado Local',
    preco: '¥980',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Tenugui.jpg',
  },
  {
    id: 5,
    nome: 'Omamori (Amuleto da Sorte)',
    descricao: 'Amuleto tradicional de proteção, ótimo omiyage.',
    tags: ['Cultura', 'Souvenir'],
    local: 'Templo',
    preco: '¥500',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Omamori_charm2.jpg',
  },
  {
    id: 6,
    nome: 'Matcha Cerimonial (Pacote 40g)',
    descricao: 'Matcha de qualidade para chá, sabor intenso.',
    tags: ['Bebida', 'Chá'],
    local: 'Loja de Chá',
    preco: '¥1,800',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Matcha_Scoop.jpg',
  },
  {
    id: 7,
    nome: 'Yokan (Doce de Feijão)',
    descricao: 'Doce tradicional em barra — ótimo como lembrança.',
    tags: ['Doce', 'Omiyage'],
    local: 'Confeitaria',
    preco: '¥720',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Imo-y%C5%8Dkan_001.jpg',
  },
  {
    id: 8,
    nome: 'Furoshiki (Tecido para Embalagem)',
    descricao: 'Tecido reutilizável para embrulhar presentes.',
    tags: ['Utensílio', 'Souvenir'],
    local: 'Loja de Artesanato',
    preco: '¥1,100',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Traditional_Japanese_wrapping_cloth%2Churoshiki%2Ckatori-city%2Cjapan.JPG',
  },
]

export default function ComprasView() {
  const [query, setQuery] = useState('')

  const [items, setItems] = useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem('compras_items')
      if (raw) {
        const stored = JSON.parse(raw) as Item[]

        // map any stored item name to the new Wikimedia URLs when possible
        const mapToNew = (nome: string) => {
          const n = nome.toLowerCase()
          if (n.includes('kit kat') || n.includes('kitkat')) return 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Kit_Kat_Matcha-9136.jpg'
          if (n.includes('senbei')) return 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Japanese_Senbeis.jpg'
          if (n.includes('sake')) return 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Sake_bottles.jpg'
          if (n.includes('tenugui')) return 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Tenugui.jpg'
          if (n.includes('omamori')) return 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Omamori_charm2.jpg'
          if (n.includes('matcha')) return 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Matcha_Scoop.jpg'
          if (n.includes('yokan')) return 'https://upload.wikimedia.org/wikipedia/commons/9/99/Imo-y%C5%8Dkan_001.jpg'
          if (n.includes('furoshiki')) return 'https://upload.wikimedia.org/wikipedia/commons/7/79/Traditional_Japanese_wrapping_cloth%2Churoshiki%2Ckatori-city%2Cjapan.JPG'
          return undefined
        }

        const migrated = stored.map((s) => ({
          ...s,
          imagemUrl: mapToNew(s.nome) ?? s.imagemUrl,
        }))

        // ensure SAMPLE items appear first (merge without duplicates by nome)
        const names = new Set(migrated.map((s) => s.nome))
        const missing = SAMPLE.filter((s) => !names.has(s.nome))
        return [...missing, ...migrated]
      }
    } catch (e) {
      // ignore
    }
    return SAMPLE
  })

  useEffect(() => {
    try {
      localStorage.setItem('compras_items', JSON.stringify(items))
    } catch (e) {
      // ignore
    }
  }, [items])

  // utility: format price strings like "¥1,200" into localized currency
  const formatPrice = (raw: string) => {
    if (!raw) return raw
    // try to extract number
    const digits = raw.replace(/[¥,\s]/g, '')
    const n = Number(digits)
    if (!Number.isFinite(n)) return raw
    try {
      return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n)
    } catch (e) {
      return raw
    }
  }

  const parsePrice = (raw: string) => {
    if (!raw) return 0
    // remove non-digit, non-dot, non-dash chars
    const digits = String(raw).replace(/[^0-9.-]+/g, '')
    const n = Number(digits)
    return Number.isFinite(n) ? n : 0
  }



  const resultados = items.filter((it) =>
    it.nome.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const totalValue = items.reduce((sum, it) => sum + parsePrice(it.preco), 0)
  const formattedTotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(totalValue)

  // form state
  const [nome, setNome] = useState('')
  const [localField, setLocalField] = useState('')
  const [valor, setValor] = useState('')
  const [tagsField, setTagsField] = useState('')
  const [descricao, setDescricao] = useState('')

  const clearForm = () => {
    setNome('')
    setLocalField('')
    setValor('')
    setTagsField('')
    setDescricao('')
  }

  const handleCreate = () => {
    if (!nome.trim()) return
    const newItem: Item = {
      id: Date.now(),
      nome: nome.trim(),
      descricao: descricao.trim() || '—',
      tags: tagsField
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      local: localField || 'Local',
      preco: valor || '$0',
    }
    setItems((prev) => [newItem, ...prev])
    clearForm()
    setQuery('')
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null)

  const confirmRemove = () => {
    if (pendingRemoveId == null) return
    removeItem(pendingRemoveId)
    setPendingRemoveId(null)
  }

  


  return (
    <div className={styles.wrapper}>
      <span className={styles.decoText} aria-hidden>
        買い物
      </span>

      <Container>
        <div className={styles.grid}>
          <aside className={styles.colLeft}>
            <div className={styles.card}>
              <h2 style={{ marginTop: 0 }}>Adicionar</h2>

              <label>
                Nome do item
                <input className={styles.input} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do item" />
              </label>

              <div className={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label>
                    Local
                    <input className={styles.input} value={localField} onChange={(e) => setLocalField(e.target.value)} placeholder="Local" />
                  </label>
                </div>
                <div style={{ width: 140 }}>
                  <label>
                    Valor
                    <input className={styles.input} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Valor" />
                  </label>
                </div>
              </div>

              <label>
                Tags (separe por vírgula)
                <input className={styles.input} value={tagsField} onChange={(e) => setTagsField(e.target.value)} placeholder="ex: tag1, tag2" />
              </label>

              <label style={{ display: 'block', marginTop: 8 }}>
                Descrição
                <input className={styles.input} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" />
              </label>

              <div style={{ height: 80, marginTop: 12, background: 'rgba(0,0,0,0.05)', borderRadius: 6 }} />

              <div className={styles.leftButtons}>
                <button className={styles.btnClear} onClick={clearForm} type="button">LIMPAR</button>
                <button className={styles.btnCreate} onClick={handleCreate} type="button">CRIAR</button>
              </div>

              
            </div>
          </aside>

          <section className={styles.colCenter}>
            <SearchBar placeholder="Pesquisa" value={query} onChange={setQuery} />

            <div className={styles.list}>
              {resultados.map((it) => (
                <div key={it.id} className={styles.item}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {it.imagemUrl ? (
                      it.imagemUrl.startsWith('http') ? (
                        <img src={it.imagemUrl} alt={it.nome} width={72} height={72} style={{ borderRadius: 6, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: 6, overflow: 'hidden' }}>
                          <img src={it.imagemUrl} alt={it.nome} width={72} height={72} style={{ objectFit: 'cover' }} />
                        </div>
                      )
                    ) : (
                      <div className={styles.avatar}>I</div>
                    )}

                    <div>
                      <div style={{ fontWeight: 600 }}>{it.nome}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{it.descricao}</div>
                      <div className={styles.tags}>
                        {it.tags.map((t, idx) => (
                          <span key={idx} className={styles.tag}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                    <div style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>{it.local}</div>
                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setPendingRemoveId(it.id)}
                        type="button"
                        title="Remover item"
                        style={{ border: 'none', background: 'transparent', color: '#c0392b', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        REMOVER
                      </button>
                    </div>
                    <div className={styles.priceBox}>{formatPrice(it.preco)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className={styles.colRight}>
            <div className={styles.summary}>
              <h3 style={{ margin: 0 }}>Resumo</h3>
              <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>Total de itens: {items.length}</p>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>Valor total: {formattedTotal}</p>
            </div>
          </aside>
        </div>
      </Container>

      {pendingRemoveId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1200,
          }}
        >
          <div style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', padding: 20, borderRadius: 8, width: 'min(480px, 92%)' }}>
            <h4 style={{ marginTop: 0 }}>Confirmar remoção</h4>
            <p style={{ marginTop: 4 }}>Tem certeza que deseja remover este item do carrinho?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className={styles.btnClear} onClick={() => setPendingRemoveId(null)} type="button">Cancelar</button>
              <button className={styles.btnCreate} onClick={confirmRemove} type="button">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
