import { useEffect, useRef, useState } from 'react'
import { signInWithWidget } from '../lib/auth'

// Telegram Login Widget injects a script that calls window.onTelegramAuth
declare global {
  interface Window {
    onTelegramAuth: (user: Record<string, string | number>) => void
  }
}

export default function SignIn() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string

  useEffect(() => {
    // Register global callback before injecting the widget script
    window.onTelegramAuth = async (user) => {
      setSigningIn(true)
      setError(null)
      try {
        await signInWithWidget(user)
        // AuthProvider's onAuthStateChange will update session automatically
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign-in failed')
        setSigningIn(false)
      }
    }

    if (!containerRef.current) return

    // Inject the Telegram Login Widget script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    containerRef.current.appendChild(script)

    return () => {
      // Clean up script on unmount
      containerRef.current?.removeChild(script)
      delete (window as Partial<Window>).onTelegramAuth
    }
  }, [botUsername])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Loop Sync</h1>
        <p className="mt-1 text-sm text-gray-400">Sign in with your Telegram account</p>
      </div>

      {signingIn ? (
        <p className="text-sm text-gray-400">Signing in…</p>
      ) : (
        <div ref={containerRef} />
      )}

      {error && (
        <p className="max-w-xs text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
