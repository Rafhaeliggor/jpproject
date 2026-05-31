'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown }
  }
}

const CONTAINER_ID = 'vlibras-container'
const SCRIPT_ID = 'vlibras-script'

/** Cria a estrutura DOM que o VLibras procura no documento. */
function createVLibrasDOM() {
  const el = document.createElement('div')
  el.id = CONTAINER_ID
  // innerHTML é necessário: VLibras busca atributos customizados (vw, vw-access-button…)
  el.innerHTML = `
    <div vw class="enabled">
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  `
  document.body.appendChild(el)
}

/**
 * O VLibras registra sua inicialização em window.onload.
 * Em apps SPA (React/Next.js) o onload já disparou antes do useEffect rodar,
 * por isso precisamos chamá-lo manualmente logo após new VLibras.Widget().
 */
function initVLibras() {
  new window.VLibras!.Widget('https://vlibras.gov.br/app')
  if (document.readyState === 'complete' && typeof window.onload === 'function') {
    window.onload(new Event('load'))
  }
}

/** Carrega o script do VLibras (uma única vez) e chama onReady quando pronto. */
function loadVLibrasScript(onReady: () => void) {
  if (document.getElementById(SCRIPT_ID)) {
    if (window.VLibras) onReady()
    return
  }
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
  script.onload = () => { if (window.VLibras) onReady() }
  document.body.appendChild(script)
}

/** Clica no botão de acesso do VLibras para abrir o painel do intérprete. */
function openPanel() {
  let tries = 0
  const id = setInterval(() => {
    const btn = document.querySelector('[vw-access-button]') as HTMLElement | null
    const panelActive = document.querySelector('[vw-plugin-wrapper].active') !== null
    if (btn && !panelActive) {
      btn.click()
      clearInterval(id)
      return
    }
    if (++tries > 20) clearInterval(id)
  }, 300)
}

export default function VLibrasWidget() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(localStorage.getItem('settings-vlibras') === 'true')
  }, [])

  useEffect(() => {
    const handler = (e: Event) =>
      setEnabled((e as CustomEvent<{ enabled: boolean }>).detail.enabled)
    window.addEventListener('vlibras-settings-change', handler)
    return () => window.removeEventListener('vlibras-settings-change', handler)
  }, [])

  useEffect(() => {
    const existing = document.getElementById(CONTAINER_ID)

    if (enabled) {
      if (!existing) {
        createVLibrasDOM()
        loadVLibrasScript(() => {
          initVLibras()
          openPanel()
        })
      } else {
        existing.style.display = ''
        openPanel()
      }
    } else {
      if (existing) existing.style.display = 'none'
    }
  }, [enabled])

  // Ao tocar um som na plataforma, abre o painel para sinalizar o texto
  useEffect(() => {
    const handler = (e: Event) => {
      if (!enabled) return
      const text = (e as CustomEvent<{ text: string }>).detail?.text
      if (text) openPanel()
    }
    window.addEventListener('vlibras-speak', handler)
    return () => window.removeEventListener('vlibras-speak', handler)
  }, [enabled])

  return null
}
