import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import useAuth from '../store'

export default function VideoPage() {
  const { id } = useParams()
  const { apiBase, token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [text, setText] = useState('')
  const [stars, setStars] = useState(5)

  useEffect(()=>{
    api.get(`/videos/${id}`).then(r => setData(r.data))
  }, [id])

  const comment = async ()=>{
    if (!token) return alert('Login to comment')
    await api.post(`/videos/${id}/comment`, { text })
    const res = await api.get(`/videos/${id}`)
    setData(res.data); setText('')
  }
  const rate = async ()=>{
    if (!token) return alert('Login to rate')
    await api.post(`/videos/${id}/rate`, { stars })
    const res = await api.get(`/videos/${id}`)
    setData(res.data)
  }

  if (!data) return <div className="max-w-3xl mx-auto px-3 py-6">Loading...</div>
  const v = data.video

  return (
    <div className="max-w-3xl mx-auto px-3 py-6 space-y-4">
      <video src={`${apiBase}${v.filepath}`} controls className="w-full rounded-2xl bg-black"></video>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{v.title}</h1>
          <p className="text-white/70 text-sm">by {v.creator_name} · ⭐ {v.avg_rating} · ❤️ {v.like_count}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <h3 className="font-semibold mb-2">Comments</h3>
          <div className="space-y-3">
            {data.comments.map((c:any)=>(
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <p className="text-sm">{c.text}</p>
                <p className="text-xs text-white/50 mt-1">— {c.user_name}</p>
              </div>
            ))}
            {data.comments.length===0 && <p className="text-white/60 text-sm">No comments yet.</p>}
          </div>
        </div>
        <div className="col-span-1 bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Add a comment</h4>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 h-24" value={text} onChange={e=>setText(e.target.value)} />
            <button onClick={comment} className="btn mt-2 w-full">Post</button>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Rate this video</h4>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2" value={stars} onChange={e=>setStars(parseInt(e.target.value))}>
              {[1,2,3,4,5].map(s=><option key={s} value={s}>{s} star{s>1?'s':''}</option>)}
            </select>
            <button onClick={rate} className="btn mt-2 w-full">Submit Rating</button>
          </div>
        </div>
      </div>
    </div>
  )
}
