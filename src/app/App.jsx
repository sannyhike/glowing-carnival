import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'
import MemeFeed from '../components/MemeFeed'
import SubmitMeme from '../components/SubmitMeme'
import AdminDashboard from '../components/AdminDashboard'
import { supabase } from '../lib/supabase'

export default function App() {
  const [view, setView] = useState('feed')
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  
  const isAdmin = user?.app_metadata?.role === 'admin'

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  async function signOut() {
    await supabase?.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 text-ink dark:text-cream transition-colors">
      <Navbar
        user={user}
        isAdmin={isAdmin}
        onAuth={() => setAuthOpen(true)}
        onNavigate={setView}
        onSignOut={signOut}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
      />
      {view === 'feed' && <MemeFeed user={user} onAuth={() => setAuthOpen(true)} />}
      {view === 'submit' && <SubmitMeme user={user} onAuth={() => setAuthOpen(true)} onNavigate={setView} />}
      {view === 'admin' && <AdminDashboard user={user} isAdmin={isAdmin} onNavigate={setView} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={(nextUser) => { setUser(nextUser); setAuthOpen(false) }} />}
      <footer className="mx-auto flex max-w-7xl justify-between border-t border-ink/10 dark:border-cream/10 px-5 py-7 text-xs font-bold text-ink/35 dark:text-cream/35 lg:px-10">
        <span>© 2026 glowing.</span>
        <span>made for the group chat</span>
      </footer>
    </div>
  )
}
