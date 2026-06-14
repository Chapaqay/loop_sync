/**
 * telegram-auth — Supabase Edge Function (Deno)
 *
 * Accepts two payload shapes:
 *   POST { type: "miniapp", initData: "<raw initData string>" }
 *   POST { type: "widget",  ...Telegram Login Widget fields + hash }
 *
 * Both verify the HMAC using TELEGRAM_BOT_TOKEN, then upsert a profile
 * and return a Supabase JWT.
 *
 * Verification references:
 *   Mini App:  https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *   Widget:    https://core.telegram.org/widgets/login#checking-authorization
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN secret not set')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const body = await req.json()
    const type: string = body.type ?? 'miniapp'

    let telegramUser: TelegramUser

    if (type === 'miniapp') {
      telegramUser = await verifyMiniApp(body.initData, botToken)
    } else if (type === 'widget') {
      telegramUser = await verifyWidget(body, botToken)
    } else {
      return error(400, 'Unknown type — must be "miniapp" or "widget"')
    }

    const jwt = await upsertAndIssueJwt(admin, telegramUser)
    return new Response(JSON.stringify({ access_token: jwt }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const status = msg.startsWith('Invalid') || msg.startsWith('Expired') ? 401 : 500
    return error(status, msg)
  }
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  language_code?: string
}

// ---------------------------------------------------------------------------
// Mini App flow
// HMAC-SHA256(data_check_string, HMAC-SHA256("WebAppData", bot_token))
// data_check_string = sorted key=value pairs (excluding hash), joined by \n
// ---------------------------------------------------------------------------

async function verifyMiniApp(initData: string | undefined, botToken: string): Promise<TelegramUser> {
  if (!initData) throw new Error('Invalid request: missing initData')

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) throw new Error('Invalid initData: missing hash')

  // Reject if older than 24 hours
  const authDate = Number(params.get('auth_date') ?? 0)
  if (!authDate || Date.now() / 1000 - authDate > 86400) {
    throw new Error('Expired initData: auth_date too old or missing')
  }

  // Build data-check string (all fields except hash, sorted, joined by \n)
  params.delete('hash')
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  const enc = new TextEncoder()

  // secret_key = HMAC-SHA256("WebAppData", bot_token)
  const botKeyRaw = await crypto.subtle.importKey('raw', enc.encode(botToken), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const secretKey = await crypto.subtle.sign('HMAC', botKeyRaw, enc.encode('WebAppData'))

  // expected = HMAC-SHA256(data_check_string, secret_key)
  const hmacKey = await crypto.subtle.importKey('raw', secretKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', hmacKey, enc.encode(dataCheckString))
  const expected = bufToHex(sig)

  if (!timingSafeEqual(expected, hash)) throw new Error('Invalid initData: HMAC mismatch')

  const userJson = params.get('user')
  if (!userJson) throw new Error('Invalid initData: missing user field')
  const user = JSON.parse(userJson)

  return {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    language_code: user.language_code,
  }
}

// ---------------------------------------------------------------------------
// Login Widget flow
// HMAC-SHA256(data_check_string, SHA256(bot_token))
// data_check_string = sorted key=value pairs (excluding hash), joined by \n
// ---------------------------------------------------------------------------

async function verifyWidget(
  payload: Record<string, string | number>,
  botToken: string,
): Promise<TelegramUser> {
  const { hash, ...rest } = payload
  if (!hash || typeof hash !== 'string') throw new Error('Invalid widget payload: missing hash')

  // Reject if older than 24 hours
  const authDate = Number(rest.auth_date ?? 0)
  if (!authDate || Date.now() / 1000 - authDate > 86400) {
    throw new Error('Expired widget payload: auth_date too old or missing')
  }

  const dataCheckString = Object.entries(rest)
    .filter(([k]) => k !== 'type') // strip our own "type" field
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  const enc = new TextEncoder()

  // secret_key = SHA256(bot_token)
  const secretKey = await crypto.subtle.digest('SHA-256', enc.encode(botToken))

  // expected = HMAC-SHA256(data_check_string, secret_key)
  const hmacKey = await crypto.subtle.importKey('raw', secretKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', hmacKey, enc.encode(dataCheckString))
  const expected = bufToHex(sig)

  if (!timingSafeEqual(expected, hash)) throw new Error('Invalid widget payload: HMAC mismatch')

  return {
    id: Number(rest.id),
    username: rest.username as string | undefined,
    first_name: rest.first_name as string | undefined,
    language_code: undefined, // widget doesn't supply language_code
  }
}

// ---------------------------------------------------------------------------
// Upsert profile and return a Supabase JWT for that user
// ---------------------------------------------------------------------------

async function upsertAndIssueJwt(
  // deno-lint-ignore no-explicit-any
  admin: any,
  tg: TelegramUser,
): Promise<string> {
  // Find existing profile by telegram_id
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('telegram_id', tg.id)
    .maybeSingle()

  let userId: string

  if (existing) {
    userId = existing.id
    // Keep profile fields fresh
    await admin.from('profiles').update({
      telegram_username: tg.username ?? null,
      first_name: tg.first_name ?? null,
      ...(tg.language_code ? { language_code: tg.language_code } : {}),
    }).eq('id', userId)
  } else {
    // Create auth.users row via admin API
    const email = `tg_${tg.id}@loop-sync.internal`
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { telegram_id: tg.id },
    })
    if (createErr) throw new Error(`Failed to create user: ${createErr.message}`)
    userId = created.user.id

    // Insert profile (trigger could do this too, but we do it explicitly)
    const { error: profileErr } = await admin.from('profiles').insert({
      id: userId,
      telegram_id: tg.id,
      telegram_username: tg.username ?? null,
      first_name: tg.first_name ?? null,
      language_code: tg.language_code ?? 'en',
    })
    if (profileErr) throw new Error(`Failed to create profile: ${profileErr.message}`)
  }

  // Issue a short-lived JWT (1 hour) for the user
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: `tg_${tg.id}@loop-sync.internal`,
  })
  if (linkErr) throw new Error(`Failed to generate JWT: ${linkErr.message}`)

  // Exchange the magic link token for a session
  const { data: session, error: sessionErr } = await admin.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })
  if (sessionErr) throw new Error(`Failed to create session: ${sessionErr.message}`)

  return session.session!.access_token
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function error(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
