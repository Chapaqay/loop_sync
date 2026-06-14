import { supabase } from './supabase'

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`

/**
 * Sign in using Telegram Mini App initData.
 * Called automatically on app load when window.Telegram.WebApp.initData exists.
 */
export async function signInWithMiniApp(initData: string): Promise<void> {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'miniapp', initData }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'telegram-auth failed')

  const { error } = await supabase.auth.setSession({
    access_token: json.access_token,
    refresh_token: json.access_token, // edge fn only returns access_token; use it as refresh placeholder
  })
  if (error) throw error
}

/**
 * Sign in using a Telegram Login Widget callback payload.
 * The widget calls window.onTelegramAuth(user) with the verified fields.
 */
export async function signInWithWidget(
  widgetPayload: Record<string, string | number>,
): Promise<void> {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'widget', ...widgetPayload }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'telegram-auth failed')

  const { error } = await supabase.auth.setSession({
    access_token: json.access_token,
    refresh_token: json.access_token,
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
