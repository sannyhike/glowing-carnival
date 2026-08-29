import { useState } from 'react'
import { X, Mail, LockKeyhole, ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault(); setMessage('')
    if (!isSupabaseConfigured) { setMessage('Add Supabase keys to .env to enable authentication.'); return }
    setLoading(true)
    const result = mode === 'signin' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (result.error) setMessage(result.error.message)
    else { setMessage(mode === 'signup' ? 'Check your email to confirm your account.' : 'Welcome back.'); onSuccess?.(result.data.user) }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-5 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="relative w-full max-w-md rounded-[2rem] bg-cream p-7 shadow-2xl sm:p-10">
      <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink" aria-label="Close"><X size={19} /></button>
      <div className="mb-8"><span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-ink text-lime"><LockKeyhole size={19} /></span><h2 className="font-display text-3xl font-bold tracking-tight">{mode === 'signin' ? 'Welcome back.' : 'Join the glow.'}</h2><p className="mt-2 text-sm text-ink/55">{mode === 'signin' ? 'Your daily dose of internet joy awaits.' : 'Make the feed a little brighter.'}</p></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-bold">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input mt-2" /></label>
        <label className="block text-sm font-bold">Password<input required minLength="6" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Six characters minimum" className="input mt-2" /></label>
        {message && <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral">{message}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-bold text-lime transition-transform hover:-translate-y-0.5 disabled:opacity-60">{loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button>
      </form>
      <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }} className="mt-6 w-full text-center text-sm font-semibold text-ink/55 hover:text-ink">{mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
    </section>
  </div>
}
