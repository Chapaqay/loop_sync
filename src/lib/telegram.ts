// TODO: Step 4 — Telegram WebApp SDK helpers (initData, theme, back button, haptics)
import WebApp from '@twa-dev/sdk'

export const isTelegramMiniApp = (): boolean => {
  return Boolean(WebApp.initData)
}

export { WebApp }
