import { useState } from 'react'
import useAuth from '../store'
import api from '../api'

export default function Upload() {
  const [file, setFile] = useState<File|null>(null)
  const [title, setTitle] = useState('')
  const [publisher, setPublisher] = useState('')
  const [producer, setProducer] = useState('')
  const [genre, setGenre] = useState('')
  const [ageRating, setAgeRating] = useState('PG')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const submit = async (e:any)=>{
    e.preventDefault()
    if (!file) return alert('Choose a video file (.mp4 recommended)')
    const form = new FormData()
    form.append('video', file)
    form.append('title', title)
    form.append('publisher', publisher)
    form.append('producer', producer)
    form.append('genre', genre)
    form.append('ageRating', ageRating)
    setLoading(true)
    try {
      await api.post('/videos', form, { headers: { 'Content-Type':'multipart/form-data' } })
      alert('Uploaded! Go to feed to view it.')
      setTitle(''); setPublisher(''); setProducer(''); setGenre(''); setAgeRating('PG'); setFile(null)
    } catch (e:any) {
      alert(e?.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'creator') return <div className="max-w-xl mx-auto px-4 py-10">Only creators can upload.</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Upload a video</h1>
      <form onSubmit={submit} className="space-y-3">
        <input type="file" accept="video/*" onChange={e=> setFile(e.target.files?.[0] || null)} className="w-full" />
        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-3" placeholder="Publisher" value={publisher} onChange={e=>setPublisher(e.target.value)} />
          <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-3" placeholder="Producer" value={producer} onChange={e=>setProducer(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-3" placeholder="Genre" value={genre} onChange={e=>setGenre(e.target.value)} />
          <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-3" value={ageRating} onChange={e=>setAgeRating(e.target.value)}>
            <option>PG</option><option>12</option><option>15</option><option>18</option>
          </select>
        </div>
        <button className="btn" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      </form>
    </div>
  )
}
