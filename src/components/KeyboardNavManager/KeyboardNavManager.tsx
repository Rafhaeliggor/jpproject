'use client'

import { useEffect } from 'react'

export default function KeyboardNavManager() {
  useEffect(() => {
    const saved = localStorage.getItem('settings-keyboard-nav')
    const enabled = saved !== 'false'
    document.documentElement.setAttribute('data-keyboard-nav', enabled ? 'true' : 'false')

    function handleSettingsChange(e: Event) {
      const { enabled } = (e as CustomEvent<{ enabled: boolean }>).detail
      document.documentElement.setAttribute('data-keyboard-nav', enabled ? 'true' : 'false')
    }

    function handleArrowScroll(e: KeyboardEvent) {
      if (document.documentElement.getAttribute('data-keyboard-nav') === 'false') return
      const target = e.target as HTMLElement
      const tag = target.tagName
      const role = target.getAttribute('role')
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (role === 'tab') return
      const scrollable = document.scrollingElement || document.body
      if (e.key === 'ArrowDown') { scrollable.scrollTop += 100; e.preventDefault() }
      else if (e.key === 'ArrowUp') { scrollable.scrollTop -= 100; e.preventDefault() }
    }

    window.addEventListener('keyboard-nav-settings-change', handleSettingsChange)
    window.addEventListener('keydown', handleArrowScroll)

    return () => {
      window.removeEventListener('keyboard-nav-settings-change', handleSettingsChange)
      window.removeEventListener('keydown', handleArrowScroll)
    }
  }, [])

  return null
}
