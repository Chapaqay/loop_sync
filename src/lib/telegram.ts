// Read directly from window.Telegram.WebApp at call time, not at import time.
// @twa-dev/sdk captures initData when the module is first parsed — before
// telegram-web-app.js finishes injecting into window — so it always returns "".

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string
        ready?: () => void
        close?: () => void
        expand?: () => void
      }
    }
  }
}

export const isTelegramMiniApp = (): boolean => {
  return Boolean(window.Telegram?.WebApp?.initData)
}

export const getMiniAppInitData = (): string => {
  return window.Telegram?.WebApp?.initData ?? ''
}

export const expandMiniApp = (): void => {
  window.Telegram?.WebApp?.expand?.()
  window.Telegram?.WebApp?.ready?.()
}
