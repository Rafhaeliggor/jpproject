'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Header from '@/components/Header/Header'
import Tabs from '@/components/Tabs/Tabs'
import Container from '@/components/Container/Container'
import { Body } from '@/components/Typography/Typography'
import RoteiroView from '@/views/RoteiroView/RoteiroView'
import ComprasView from '@/views/ComprasView/ComprasView'
import OrcamentoView from '@/views/orcamentoView/orcamentoView'
import PassagensView from '@/views/PassagensView/PassagensView'
import HospedagemView from '@/views/HospedagemView/HospedagemView'
import AuthGuard from '@/components/AuthGuard/AuthGuard'
import GroupSetup from '@/components/GroupSetup/GroupSetup'
import { useAuth } from '@/contexts/AuthContext'
import styles from './page.module.css'

const TABS = ['ROTEIRO', 'PASSAGENS', 'HOSPEDAGEM', 'COMPRAS', 'ORÇAMENTO'] as const

export default function Home() {
  const pathname = usePathname()
  const search = useSearchParams()
  const { group, loading } = useAuth()

  const [activeTab, setActiveTab] = useState<string>('ROTEIRO')

  useEffect(() => {
    if (!pathname) return
    const tabParam = search?.get('tab')
    if (tabParam) return setActiveTab(tabParam.toUpperCase())
    if (pathname.startsWith('/compras')) return setActiveTab('COMPRAS')
    if (pathname.startsWith('/passagens')) return setActiveTab('PASSAGENS')
    if (pathname.startsWith('/hospedagem')) return setActiveTab('HOSPEDAGEM')
    if (pathname.startsWith('/orcamento')) return setActiveTab('ORÇAMENTO')
    return setActiveTab('ROTEIRO')
  }, [pathname, search])

  if (loading) return null

  return (
    <AuthGuard>
      {!group ? (
        <GroupSetup />
      ) : (
        <main className={styles.main}>
          <Header />

          <Tabs
            tabs={[...TABS]}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            tabLinks={{
              ROTEIRO: '/?tab=ROTEIRO',
              PASSAGENS: '/?tab=PASSAGENS',
              HOSPEDAGEM: '/?tab=HOSPEDAGEM',
              COMPRAS: '/?tab=COMPRAS',
              'ORÇAMENTO': '/?tab=ORÇAMENTO',
            }}
          />

          <div className={styles.content}>
            {activeTab === 'ROTEIRO' ? (
              <RoteiroView />
            ) : activeTab === 'COMPRAS' ? (
              <ComprasView />
            ) : activeTab === 'ORÇAMENTO' ? (
              <OrcamentoView />
            ) : activeTab === 'PASSAGENS' ? (
              <PassagensView />
            ) : activeTab === 'HOSPEDAGEM' ? (
              <HospedagemView />
            ) : (
              <Container>
                <section className={styles.placeholder}>
                  <span className={styles.placeholderIcon}>
                    <i className="bi bi-compass" aria-hidden="true" />
                  </span>
                  <Body>Conteúdo de <strong>{activeTab}</strong> em breve.</Body>
                  <Body as="p" className={styles.placeholderHint}>
                    Esta seção será implementada em uma próxima PR.
                  </Body>
                </section>
              </Container>
            )}
          </div>
        </main>
      )}
    </AuthGuard>
  )
}
