import { create } from 'zustand'

type User = { id:number; email:string; role:string; display_name?: string; displayName?: string } | null

interface State {
  user: User
  token: string | null
  setAuth: (u:User, t:string)=>void
  logout: ()=>void
  apiBase: string
}

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const useAuth = create<State>((set)=> ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  setAuth: (u, t) => {
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('token', t)
    set({ user: u, token: t })
  },
  logout: ()=> {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
  apiBase
}))

export default useAuth
