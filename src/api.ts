import axios from 'axios'
import useAuth from './store'

const instance = axios.create()

instance.interceptors.request.use((config)=>{
  const { token, apiBase } = useAuth.getState()
  config.baseURL = apiBase + '/api'
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default instance
