# Viagem Colaborativa — POC

Prova de conceito de um design de viagem colaborativo.  
Construída com **Next.js 15 + TypeScript + CSS Modules**.

---

## Instalação e execução

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx          # Root layout (fontes, metadata, Bootstrap Icons CDN)
│   ├── page.tsx            # Página principal — gerencia activeTab
│   ├── page.module.css     # Grid de cards, placeholder de abas
│   └── globals.css         # CSS reset + todos os design tokens (variáveis CSS)
│
├── components/
│   ├── ContadorRegressivo/ # Timer regressivo — "297日04時22分"
│   ├── Header/             # Header da aplicação (fundo #6F1C1C)
│   ├── Tabs/               # Navegação por abas (totalmente controlada)
│   ├── CardViagem/         # Card de destino turístico
│   ├── Container/          # Container responsivo com margens do design system
│   └── Typography/         # H1, H2, H3, H4, Body, Label, Caption
│
└── data/
    └── destinos.ts         # Dados mockados dos destinos (substituir por API)
```

---

## Componentes reutilizáveis

### `ContadorRegressivo`
Exibe um cronômetro regressivo no formato japonês. Atualiza a cada minuto.

```tsx
import ContadorRegressivo from '@/components/ContadorRegressivo/ContadorRegressivo'

<ContadorRegressivo targetDate="2027-02-10T00:00:00" />
// Exibe: 297日04時22分
```

**Props:**
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `targetDate` | `Date \| string` | ✅ | Data alvo (ISO string ou objeto Date) |
| `className` | `string` | — | Classe CSS adicional |

---

### `Tabs`
Componente controlled de navegação por abas. O pai gerencia o estado.

```tsx
import Tabs from '@/components/Tabs/Tabs'

const [activeTab, setActiveTab] = useState('ROTEIRO')

<Tabs
  tabs={['ROTEIRO', 'PASSAGENS', 'HOSPEDAGEM', 'COMPRAS', 'ORÇAMENTO']}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Props:**
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `tabs` | `string[]` | ✅ | Array de rótulos na ordem de exibição |
| `activeTab` | `string` | ✅ | Rótulo da aba ativa |
| `onTabChange` | `(tab: string) => void` | ✅ | Callback ao clicar numa aba |
| `className` | `string` | — | Classe CSS adicional |

---

### `CardViagem`
Card de destino turístico com imagem, título, descrição e link.

```tsx
import CardViagem from '@/components/CardViagem/CardViagem'

<CardViagem
  titulo="Shibuya — Tóquio"
  subtituloJP="渋谷"
  descricao="O cruzamento mais famoso do mundo..."
  imagemUrl="https://picsum.photos/seed/shibuya/800/450"
  categoria="Cidade"
  link="/roteiro/shibuya"
/>
```

**Props:**
| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `titulo` | `string` | ✅ | Nome do destino (H4 — Noto Sans JP) |
| `subtituloJP` | `string` | — | Subtítulo em japonês |
| `descricao` | `string` | ✅ | Descrição (Body — Inter) |
| `imagemUrl` | `string` | — | URL da imagem (800×450 recomendado) |
| `link` | `string` | — | Rota ou URL para detalhes |
| `categoria` | `string` | — | Badge de categoria |

---

### `Container`
Aplica margens laterais responsivas e max-width conforme design system.

```tsx
import Container from '@/components/Container/Container'

<Container>               {/* max-width 1280px, centralizado */}
  <MyContent />
</Container>

<Container variant="fluid">  {/* largura total com margens */}
  <MyFullWidthContent />
</Container>
```

---

### `Typography`
Componentes tipográficos pré-estilizados conforme o style guide.

```tsx
import { H1, H2, H3, H4, Body, Label, Caption } from '@/components/Typography/Typography'

<H1>Título Principal</H1>          {/* 32px · Bold · Noto Sans JP */}
<H2>Seção</H2>                     {/* 24px · Semibold · Inter */}
<H3>Subtítulo</H3>                 {/* 20px · Medium · Inter */}
<H4>Nome do Lugar</H4>             {/* 18px · Medium · Noto Sans JP */}
<Body>Descrição do lugar...</Body> {/* 16px · Regular · Inter */}
<Label>BOTÃO</Label>               {/* 14px · Medium · Inter */}
<Caption>12 fev 2027</Caption>     {/* 12px · Regular · Inter */}
```

Todos aceitam a prop `as` para trocar a tag HTML sem alterar o estilo:
```tsx
<H2 as="h3">Visualmente H2, semanticamente h3</H2>
```

---

## Design System

Todas as variáveis CSS ficam em `src/app/globals.css`.

### Paleta de cores
| Variável | Valor | Uso |
|----------|-------|-----|
| `--color-bg` | `#0B1622` | Fundo geral |
| `--color-header` | `#6F1C1C` | Fundo do header |
| `--color-surface` | `#151F2E` | Cards, tabs nav |
| `--color-surface-alt` | `#262626` | Elementos alternativos |
| `--color-accent` | `#8C2323` | Destaque / acento |
| `--color-tab-active` | `#CDCDCD` | Tab ativa, textos principais |
| `--color-tab-inactive` | `#A0ADBD` | Tabs inativas, textos secundários |

### Espaçamento
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` px  
Acessar via `--space-1` → `--space-16`.

### Border radius
| Variável | Valor | Uso |
|----------|-------|-----|
| `--radius-lg` | `8px` | Container externo |
| `--radius-md` | `6px` | Elemento intermediário |
| `--radius-sm` | `4px` | Elemento mais interno |

### Breakpoints
| Nome | Intervalo |
|------|-----------|
| Mobile | ≤ 640px |
| Tablet | 641px – 1024px |
| Desktop | > 1024px |

---

## Criando novas telas (PR guidelines)

1. Crie a rota em `src/app/<nome-da-aba>/page.tsx`
2. Reutilize `Container`, `Typography`, `CardViagem` e `Tabs`
3. Use apenas as variáveis CSS definidas em `globals.css`
4. Respeite os breakpoints e tokens de espaçamento
5. Componentes com estado (`useState`, `useEffect`) devem ter `'use client'`
