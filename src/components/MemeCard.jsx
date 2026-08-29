import { useState } from 'react'
import { Heart, MessageCircle, Share2, Send, Check } from 'lucide-react'
import { shareMeme } from '../lib/share'

export default function MemeCard({ meme, user, onAuth, onLike, onComment }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(meme.likes || 0)
  const [commentOpen, setCommentOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [shared, setShared] = useState(false)
  const isVideo = meme.media_type === 'video'
  async function like() { if (!user) return onAuth(); setLiked(!liked); setLikeCount(likeCount + (liked ? -1 : 1)); onLike?.(meme.id, !liked) }
  async function share() { try { await shareMeme(meme); setShared(true); setTimeout(() => setShared(false), 1800) } catch {} }
  function submitComment(event) { event.preventDefault(); if (!user) return onAuth(); if (!comment.trim()) return; onComment?.(meme.id, comment.trim()); setComment('') }
  return <article className="group overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
    <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
      {isVideo ? (
        <video src={meme.video_url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" controls muted autoPlay loop preload="metadata" />
      ) : (
        <img src={meme.image_url} alt={meme.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      )}
      <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-ink backdrop-blur">{meme.accent || 'fresh'}</span>
    </div>
    <div className="p-5"><h3 className="font-display text-lg font-bold leading-snug text-ink dark:text-dark-text">{meme.title}</h3><p className="mt-2 text-xs font-semibold text-ink/45 dark:text-dark-text/55">shared by <span className="text-ink/70 dark:text-dark-text/85">{meme.author_credit || 'anonymous'}</span></p>
      <div className="mt-5 flex items-center justify-between border-t border-ink/8 dark:border-dark-text/10 pt-4"><div className="flex items-center gap-1"><button onClick={like} className={`icon-button ${liked ? 'text-coral' : 'text-ink/50 dark:text-dark-text/50'}`} aria-label="Like meme"><Heart size={19} fill={liked ? 'currentColor' : 'none'} /></button><span className="mr-3 text-xs font-bold text-ink/50 dark:text-dark-text/50">{likeCount}</span><button onClick={() => setCommentOpen(!commentOpen)} className="icon-button text-ink/50 dark:text-dark-text/50 hover:text-ink dark:hover:text-dark-text" aria-label="Show comments"><MessageCircle size={19} /></button><span className="text-xs font-bold text-ink/50 dark:text-dark-text/50">{meme.comments || 0}</span></div><button onClick={share} className="icon-button text-ink/50 dark:text-dark-text/50 hover:text-ink dark:hover:text-dark-text" aria-label="Share meme">{shared ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}</button></div>
      {commentOpen && <form onSubmit={submitComment} className="mt-4 flex gap-2"><input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a thought..." className="input min-w-0 py-2.5 text-xs bg-white dark:bg-dark-bg text-ink dark:text-dark-text placeholder-ink/40 dark:placeholder-dark-text/40" /><button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink dark:bg-dark-text text-lime dark:text-dark-bg" aria-label="Post comment"><Send size={15} /></button></form>}
    </div>
  </article>
}
