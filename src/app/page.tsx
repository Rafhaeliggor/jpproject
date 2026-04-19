'use client'

import { useState } from 'react'
import Header from '@/components/Header/Header'
import Tabs from '@/components/Tabs/Tabs'
import Container from '@/components/Container/Container'
import { Body } from '@/components/Typography/Typography'
import RoteiroView from '@/views/RoteiroView/RoteiroView'
import styles from './page.module.css'

const TABS = ['ROTEIRO', 'PASSAGENS', 'HOSPEDAGEM', 'COMPRAS', 'ORÇAMENTO'] as const

const TARGET_DATE = '2027-02-10T00:00:00'

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('ROTEIRO')

  return (
    <main className={styles.main}>
      <Header targetDate={TARGET_DATE} />

      <Tabs
        tabs={[...TABS]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className={styles.content}>
        {activeTab === 'ROTEIRO' ? (
          <RoteiroView />
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
  )
}
