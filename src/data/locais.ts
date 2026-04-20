export interface Local {
  id: number
  nome: string
  endereco: string
  cidade: string
  tempoMedio: string
  tempoMinutos: number
  tags: string[]
  descricao: string
  imagemUrl: string
  coordenadas: [number, number]
  votanteIds: number[]
}

export const LOCAIS_DISPONIVEIS: Local[] = [
  {
    id: 1,
    nome: 'Templo Sensoji',
    endereco: 'Asakusa, Taito City, Tóquio',
    cidade: 'Tóquio',
    tempoMedio: '1h30',
    tempoMinutos: 90,
    tags: ['História', 'Templo', 'Cultura'],
    descricao:
      'O Sensoji é o templo mais antigo de Tóquio, fundado em 645 d.C. Sua imponente pagode e o portão Kaminarimon são pontos icônicos da capital japonesa. As ruelas do Nakamise-dori, repletas de lojas de souvenirs, conduzem à entrada principal.',
    imagemUrl: 'https://picsum.photos/seed/sensoji-poc/400/240',
    coordenadas: [35.7147, 139.7967],
    votanteIds: [1, 2],
  },
  {
    id: 2,
    nome: 'Torii de Miyajima',
    endereco: 'Ilha de Miyajima, Hatsukaichi, Hiroshima',
    cidade: 'Hiroshima',
    tempoMedio: '2h',
    tempoMinutos: 120,
    tags: ['Natureza', 'Mar', 'Xintoísmo'],
    descricao:
      'O grande torii vermelho erguido sobre as águas do Mar Interior de Seto é um dos cenários mais fotografados do Japão. A ilha de Miyajima abriga também o Santuário de Itsukushima, Patrimônio Mundial da UNESCO.',
    imagemUrl: 'https://picsum.photos/seed/miyajima-poc/400/240',
    coordenadas: [34.2953, 132.319],
    votanteIds: [1, 3, 5],
  },
  {
    id: 3,
    nome: 'Shibuya Sky',
    endereco: 'Shibuya Scramble Square 47F–49F, Shibuya, Tóquio',
    cidade: 'Tóquio',
    tempoMedio: '1h',
    tempoMinutos: 60,
    tags: ['Mirante', 'Urbano', 'Vista'],
    descricao:
      'O mirante ao ar livre do Shibuya Sky oferece uma das vistas mais espetaculares de Tóquio, incluindo o famoso cruzamento lá embaixo. À noite, o skyline iluminado é simplesmente inesquecível.',
    imagemUrl: 'https://picsum.photos/seed/shibuya-sky-poc/400/240',
    coordenadas: [35.6585, 139.7025],
    votanteIds: [2, 4],
  },
  {
    id: 4,
    nome: 'Fushimi Inari',
    endereco: 'Fushimi Ward, Kyoto',
    cidade: 'Kyoto',
    tempoMedio: '2h30',
    tempoMinutos: 150,
    tags: ['Templo', 'Trilha', 'Xintoísmo', 'Natureza'],
    descricao:
      'Milhares de torii vermelhos formam um labirinto sagrado nas montanhas de Kyoto. O percurso completo até o cume leva de 2 a 3 horas, atravessando florestas e pequenos santuários dedicados ao deus Inari.',
    imagemUrl: 'https://picsum.photos/seed/fushimi-poc/400/240',
    coordenadas: [34.9671, 135.7727],
    votanteIds: [1, 3, 4, 5],
  },
  {
    id: 5,
    nome: 'Arashiyama Bamboo',
    endereco: 'Sagano, Arashiyama, Kyoto',
    cidade: 'Kyoto',
    tempoMedio: '1h',
    tempoMinutos: 60,
    tags: ['Natureza', 'Bambu', 'Fotografia'],
    descricao:
      'O bosque de bambu de Arashiyama é uma das experiências mais singulares do Japão. Caminhar entre os colmos que filtram a luz e criam um ambiente sonoro único é uma experiência quase meditativa.',
    imagemUrl: 'https://picsum.photos/seed/bamboo-poc/400/240',
    coordenadas: [35.0095, 135.6717],
    votanteIds: [2, 3],
  },
  {
    id: 6,
    nome: 'Parque de Nara',
    endereco: 'Nara Park, Nara',
    cidade: 'Nara',
    tempoMedio: '2h',
    tempoMinutos: 120,
    tags: ['Natureza', 'Animais', 'Família'],
    descricao:
      'O Parque de Nara abriga mais de 1.200 cervos que foram declarados tesouros nacionais. O Grande Buda (Daibutsu) no Tōdai-ji é uma das estátuas de bronze mais imponentes do mundo e vale cada segundo.',
    imagemUrl: 'https://picsum.photos/seed/nara-poc/400/240',
    coordenadas: [34.6851, 135.8048],
    votanteIds: [1, 4, 5],
  },
  {
    id: 7,
    nome: 'Dotonbori',
    endereco: 'Dotonbori, Chuo Ward, Osaka',
    cidade: 'Osaka',
    tempoMedio: '2h',
    tempoMinutos: 120,
    tags: ['Gastronomia', 'Urbano', 'Noturno'],
    descricao:
      'O coração gastronômico de Osaka, com o icônico homem Glico e letreiros neon refletidos no canal. Provar takoyaki, okonomiyaki e ramen aqui é obrigatório para qualquer viajante no Japão.',
    imagemUrl: 'https://picsum.photos/seed/dotonbori-poc/400/240',
    coordenadas: [34.6687, 135.5008],
    votanteIds: [2, 5],
  },
]
