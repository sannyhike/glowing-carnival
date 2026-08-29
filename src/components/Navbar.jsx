import { LogIn, Plus, ShieldCheck, Sparkles, Moon, Sun } from 'lucide-react'

export default function Navbar({ user, onAuth, onNavigate, onSignOut, isAdmin, isDark, onThemeToggle }) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 dark:border-cream/10 bg-cream/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <button className="group flex items-center gap-3" onClick={() => onNavigate('feed')} aria-label="Go to home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink dark:bg-cream text-lime dark:text-slate-950 shadow-soft transition-transform group-hover:rotate-6">
            <Sparkles size={20} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-cream">glowing<span className="text-coral">.</span></span>
        </button>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink/65 dark:text-cream/65 md:flex">
          <button className="transition-colors hover:text-ink dark:hover:text-cream" onClick={() => onNavigate('feed')}>Explore</button>
          <button className="transition-colors hover:text-ink dark:hover:text-cream" onClick={() => onNavigate('submit')}>How it works</button>
          {isAdmin && <button className="flex items-center gap-1.5 text-coral transition-colors hover:text-ink dark:hover:text-cream" onClick={() => onNavigate('admin')}><ShieldCheck size={15} /> Review</button>}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={onThemeToggle}
            className="relative h-10 w-16 rounded-full bg-ink/10 dark:bg-cream/10 border border-ink/20 dark:border-cream/20 transition-colors hover:bg-ink/15 dark:hover:bg-cream/15 flex items-center px-1 gap-1"
            aria-label="Toggle dark mode"
          >
            <div className={`absolute w-7 h-7 rounded-full bg-ink dark:bg-cream flex items-center justify-center transition-all duration-300 ${isDark ? 'translate-x-8' : 'translate-x-0.5'}`}>
              {isDark ? (
                <Moon size={16} className="text-slate-950 animate-spin" />
              ) : (
                <Sun size={16} className="text-lime animate-spin" />
              )}
            </div>
          </button>
          <button onClick={() => onNavigate('submit')} className="hidden items-center gap-2 rounded-full bg-lime px-4 py-2.5 text-sm font-bold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft sm:flex"><Plus size={17} /> Submit meme</button>
          {user ? <button onClick={onSignOut} className="h-10 w-10 overflow-hidden rounded-full border-2 border-white dark:border-slate-800 bg-ink dark:bg-cream text-xs font-bold text-lime dark:text-slate-950 shadow-sm" title="Sign out">{user.email?.slice(0, 2).toUpperCase()}</button> : <button onClick={onAuth} className="flex items-center gap-2 rounded-full border border-ink/15 dark:border-cream/15 px-4 py-2.5 text-sm font-bold text-ink dark:text-cream transition-colors hover:bg-white dark:hover:bg-slate-900"><LogIn size={16} /> Sign in</button>}
        </div>
      </div>
    </header>
  )
}
