import { LogIn, Plus, ShieldCheck, Sparkles } from 'lucide-react'

export default function Navbar({ user, onAuth, onNavigate, onSignOut, isAdmin }) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <button className="group flex items-center gap-3" onClick={() => onNavigate('feed')} aria-label="Go to home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-lime shadow-soft transition-transform group-hover:rotate-6">
            <Sparkles size={20} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">glowing<span className="text-coral">.</span></span>
        </button>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink/65 md:flex">
          <button className="transition-colors hover:text-ink" onClick={() => onNavigate('feed')}>Explore</button>
          <button className="transition-colors hover:text-ink" onClick={() => onNavigate('submit')}>How it works</button>
          {isAdmin && <button className="flex items-center gap-1.5 text-coral transition-colors hover:text-ink" onClick={() => onNavigate('admin')}><ShieldCheck size={15} /> Review</button>}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('submit')} className="hidden items-center gap-2 rounded-full bg-lime px-4 py-2.5 text-sm font-bold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft sm:flex"><Plus size={17} /> Submit meme</button>
          {user ? <button onClick={onSignOut} className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-ink text-xs font-bold text-lime shadow-sm" title="Sign out">{user.email?.slice(0, 2).toUpperCase()}</button> : <button onClick={onAuth} className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white"><LogIn size={16} /> Sign in</button>}
        </div>
      </div>
    </header>
  )
}
