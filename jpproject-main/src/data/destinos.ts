export interface Destino {
  id: number
  titulo: string
  subtituloJP?: string
  descricao: string
  imagemUrl?: string
  link?: string
  categoria?: string
}

export const DESTINOS: Destino[] = [
  {
    id: 1,
    subtituloJP: '渋谷',
    titulo: 'Shibuya — Tóquio',
    descricao:
      'O cruzamento mais famoso do mundo. Milhares de pessoas cruzam simultaneamente em todas as direções, criando uma coreografia urbana única que representa o Japão moderno.',
    imagemUrl: 'https://picsum.photos/seed/shibuya/800/450',
    link: '#',
    categoria: 'Cidade',
  },
  {
    id: 2,
    subtituloJP: '伏見稲荷大社',
    titulo: 'Fushimi Inari — Kyoto',
    descricao:
      'Milhares de torii vermelhos formam um labirinto sagrado nas montanhas de Kyoto. Um dos locais mais fotografados do Japão e símbolo da espiritualidade xintoísta.',
    imagemUrl: 'https://picsum.photos/seed/fushimi/800/450',
    link: '#',
    categoria: 'Templo',
  },
  {
    id: 3,
    subtituloJP: '道頓堀',
    titulo: 'Dotonbori — Osaka',
    descricao:
      'O coração gastronômico de Osaka, famoso pelo takoyaki, ramen e pela icônica placa do Glico Man. Luzes neon refletidas no canal criam uma atmosfera inconfundível.',
    imagemUrl: 'https://picsum.photos/seed/dotonbori/800/450',
    link: '#',
    categoria: 'Gastronomia',
  },
  {
    id: 4,
    subtituloJP: '奈良公園',
    titulo: 'Parque de Nara',
    descricao:
      'Mais de 1.200 cervos sagrados vagam livremente pelo parque. Uma experiência serena e única, onde a fauna japonesa convive harmoniosamente com os visitantes.',
    imagemUrl: 'https://picsum.photos/seed/nara/800/450',
    link: '#',
    categoria: 'Natureza',
  },
  {
    id: 5,
    subtituloJP: '広島平和記念公園',
    titulo: 'Memorial da Paz — Hiroshima',
    descricao:
      'Um memorial que convida à reflexão e à esperança. O Parque Memorial da Paz de Hiroshima é um símbolo universal da resiliência humana e da busca pela paz.',
    imagemUrl: 'https://picsum.photos/seed/hiroshima/800/450',
    link: '#',
    categoria: 'História',
  },
  {
    id: 6,
    subtituloJP: '札幌',
    titulo: 'Sapporo — Hokkaido',
    descricao:
      'Capital de Hokkaido, famosa pelo Festival da Neve, pela cerveja Sapporo e por uma gastronomia única com frutos do mar frescos e ramen de manteiga.',
    imagemUrl: 'https://picsum.photos/seed/sapporo/800/450',
    link: '#',
    categoria: 'Natureza',
  },
]
