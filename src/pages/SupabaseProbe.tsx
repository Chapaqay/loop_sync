import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type ProbeResult = { ok: boolean; message: string }

export default function SupabaseProbe() {
  const [result, setResult] = useState<ProbeResult | null>(null)

  useEffect(() => {
    supabase
      .from('habits')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (!error) {
          setResult({ ok: true, message: 'Connected — query returned (authenticated user).' })
        } else if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          setResult({ ok: true, message: `Connected — got expected auth error: ${error.message}` })
        } else if (error.code === '42501' || error.message.includes('row-level security')) {
          // RLS blocked the anon key — means the table exists and RLS is active. Success.
          setResult({ ok: true, message: `Connected — RLS active (${error.message})` })
        } else {
          setResult({ ok: false, message: `Unexpected error [${error.code}]: ${error.message}` })
        }
      })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-8">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 font-mono text-sm">
        <p className="mb-4 text-lg font-bold text-white">Supabase connectivity probe</p>
        <p className="mb-1 text-gray-400">
          URL: <span className="text-gray-200">{import.meta.env.VITE_SUPABASE_URL}</span>
        </p>
        {result === null && <p className="text-yellow-400">Probing…</p>}
        {result && (
          <p className={result.ok ? 'text-green-400' : 'text-red-400'}>
            {result.ok ? '✓' : '✗'} {result.message}
          </p>
        )}
      </div>
    </div>
  )
}
