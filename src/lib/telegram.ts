import WebApp from '@twa-dev/sdk'

export const isTelegramMiniApp = (): boolean => {
  try {
    return Boolean(WebApp.initData)
  } catch {
    return false
  }
}

export const getMiniAppInitData = (): string => WebApp.initData

export { WebApp }
