import { useEffect, useRef, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import useAuth from '../store'

type Video = {
  id: number
  title: string
  filepath: string
  like_count: number
  avg_rating: number
  comment_count?: number
  creator_name: string
  genre?: string
}

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || 'U'
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full grid place-items-center ring-2 ring-white/20"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 30%, rgba(255,0,80,.9), rgba(0,242,234,.8))'
      }}
    >
      <span className="font-bold text-sm text-black">{initials(name)}</span>
    </div>
  )
}

function extractHashtags(title?: string, genre?: string): string[] {
  const tags = new Set<string>()
  const t = (title || '').match(/#[\w]+/g) || []
  t.forEach(x => tags.add(x))

  // Use genre as a tag if provided
  if (genre && genre.trim()) tags.add('#' + genre.trim().replace(/\s+/g, ''))
  // Always add a brand tag so there is at least one clickable filter
  tags.add('#TikTiny')

  return Array.from(tags).slice(0, 5)
}

export default function Feed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const { apiBase, token } = useAuth()

  useEffect(() => {
    api.get('/videos', { params: { search } }).then(r => setVideos(r.data.items))
  }, [search])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const vids = Array.from(el.querySelectorAll('video'))
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const v = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            v.play().catch(() => {})
          } else {
            v.pause()
            v.currentTime = 0
          }
        })
      },
      { threshold: 0.7 }
    )
    vids.forEach(v => io.observe(v))
    return () => io.disconnect()
  }, [videos])

  const like = async (id: number) => {
    if (!token) return alert('Login to like')
    const r = await api.post(`/videos/${id}/like`)
    setVideos(videos.map(v => (v.id === id ? { ...v, like_count: r.data.likeCount } : v)))
  }

  const onTagClick = (tag: string) => {
    const clean = tag.replace(/^#/, '')
    setSearch(clean)
  }

  const ActionButton = ({
    label,
    count,
    onClick,
    to
  }: {
    label: 'like' | 'comment'
    count?: number
    onClick?: () => void
    to?: string
  }) => {
    const isLike = label === 'like'
    const btn = (
      <button
        className="flex flex-col items-center gap-1 bg-black/40 hover:bg-black/60 backdrop-blur rounded-2xl px-3 py-2 border border-white/10 pointer-events-auto"
        onClick={onClick}
        aria-label={label}
        type="button"
      >
        {isLike ? (
          // Heart icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12.001 4.529c2.349-2.532 6.151-2.532 8.5 0 2.351 2.532 2.351 6.64 0 9.172l-7.072 7.626a2 2 0 0 1-2.856 0L3.5 13.701c-2.351-2.532-2.351-6.64 0-9.172 2.349-2.532 6.151-2.532 8.501 0z"/>
          </svg>
        ) : (
          // Comment icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
          </svg>
        )}
        <span className="text-xs text-white/80">{count ?? 0}</span>
      </button>
    )
    return to ? <Link to={to} className="pointer-events-auto">{btn}</Link> : btn
  }

  return (
    <div className="max-w-3xl mx-auto px-3 py-4">
      <div className="flex items-center gap-2 mb-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, genre or tag..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none"
        />
      </div>

      <div ref={containerRef} className="space-y-10">
        {videos.map(v => {
          const tags = extractHashtags(v.title, v.genre)
          return (
            <div key={v.id} className="video-card relative rounded-2xl overflow-hidden border border-white/10">
              {/* Video */}
              <video
                src={`${apiBase}${v.filepath}`}
                muted
                playsInline
                loop
                className="w-full max-h-[80vh] object-cover bg-black"
              />

              {/* Bottom gradient info bar */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-end justify-between gap-3">
                  {/* Left: avatar + meta */}
                  <div className="flex items-end gap-3">
                    <Avatar name={v.creator_name} />
                    <div>
                      <h3 className="text-xl font-bold">{v.title}</h3>
                      <p className="text-white/70 text-sm">by {v.creator_name} · ⭐ {v.avg_rating} · ❤️ {v.like_count}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => onTagClick(tag)}
                            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full border border-white/10"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right sticky action rail */}
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
                <ActionButton label="like" count={v.like_count} onClick={() => like(v.id)} />
                <ActionButton label="comment" count={v.comment_count ?? 0} to={`/v/${v.id}`} />
              </div>
            </div>
          )
        })}
        {videos.length === 0 && <p className="text-center text-white/60">No videos yet.</p>}
      </div>
    </div>
  )
}
