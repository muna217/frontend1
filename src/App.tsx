import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuth from './store'
import { useEffect } from 'react'

export default function App() {
  const { user } = useAuth()
  const loc = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // redirect to login if trying to upload without auth
    if (loc.pathname === '/upload' && !user) navigate('/login')
  }, [loc.pathname, user])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur bg-darkbg/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-2xl font-extrabold tracking-tight" style={{background: 'var(--accent)', WebkitBackgroundClip: 'text', color: 'transparent'}}>TikTiny</Link>
          <nav className="flex items-center gap-2">
            <Link to="/" className="btn-outline">Feed</Link>
            {user?.role === 'creator' && <Link to="/upload" className="btn">Upload</Link>}
            {!user && <Link to="/login" className="btn-outline">Login</Link>}
            {!user && <Link to="/signup" className="btn-outline">Sign up</Link>}
            {user && <span className="text-white/70 text-sm">Hi, {user.display_name || user.displayName}</span>}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-white/40 text-sm">
        Built for Scalable Advanced Software Systems – TikTok-like MVP
      </footer>
    </div>
  )
}
