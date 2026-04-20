'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Header from '@/components/Header/Header'
import Tabs from '@/components/Tabs/Tabs'
import Container from '@/components/Container/Container'
import { Body } from '@/components/Typography/Typography'
import RoteiroView from '@/views/RoteiroView/RoteiroView'
import ComprasView from '@/views/ComprasView/ComprasView'
<<<<<<< HEAD
import OrcamentoView from '@/views/orcamentoView/orcamentoView'
=======
>>>>>>> bd2c0d1c1f8f249e610d57b58cfce3dd83acd4d2
import styles from './page.module.css'

const TABS = ['ROTEIRO', 'PASSAGENS', 'HOSPEDAGEM', 'COMPRAS', 'ORÇAMENTO'] as const

const TARGET_DATE = '2027-02-10T00:00:00'

export default function Home() {
  const pathname = usePathname()
  const search = useSearchParams()

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

  return (
    <main className={styles.main}>
      <Header targetDate={TARGET_DATE} />

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
<<<<<<< HEAD
        ) : activeTab === 'ORÇAMENTO' ? (
          <OrcamentoView />
        ) :(
=======
        ) : (
>>>>>>> bd2c0d1c1f8f249e610d57b58cfce3dd83acd4d2
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
  )
}
