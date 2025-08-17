import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import useAuth from '../store'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { setAuth } = useAuth()

  const submit = async (e:any)=>{
    e.preventDefault()
    setLoading(true)
    try {
      const r = await api.post('/auth/register', { email, password, displayName })
      setAuth(r.data.user, r.data.token)
      nav('/')
    } catch (e:any) {
      alert(e?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Create your account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3" placeholder="Display name" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn w-full" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
      </form>
      <p className="text-sm text-white/60 mt-4">Have an account? <Link to="/login" className="underline">Login</Link></p>
    </div>
  )
}
