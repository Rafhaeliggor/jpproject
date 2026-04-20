export interface Usuario {
  id: number
  nome: string
  iniciais: string
  avatarUrl: string
  cor: string
  locaisAdicionados: number
}

export const USUARIOS: Usuario[] = [
  {
    id: 1,
    nome: 'Marcello Catchau',
    iniciais: 'MC',
    avatarUrl: 'https://picsum.photos/seed/mc-avatar/64/64',
    cor: '#6F1C1C',
    locaisAdicionados: 3,
  },
  {
    id: 2,
    nome: 'Iggor Rafhael',
    iniciais: 'IR',
    avatarUrl: 'https://picsum.photos/seed/ir-avatar/64/64',
    cor: '#1C3D6F',
    locaisAdicionados: 2,
  },
  {
    id: 3,
    nome: 'Livia No-Gueira',
    iniciais: 'LN',
    avatarUrl: 'https://picsum.photos/seed/ln-avatar/64/64',
    cor: '#2A6F1C',
    locaisAdicionados: 4,
  },
  {
    id: 4,
    nome: 'Paulo Fighter',
    iniciais: 'PF',
    avatarUrl: 'https://picsum.photos/seed/pf-avatar/64/64',
    cor: '#6F5A1C',
    locaisAdicionados: 1,
  },
  {
    id: 5,
    nome: 'Bia',
    iniciais: 'B',
    avatarUrl: 'https://picsum.photos/seed/bia-avatar/64/64',
    cor: '#6F1C6A',
    locaisAdicionados: 2,
  },
]
