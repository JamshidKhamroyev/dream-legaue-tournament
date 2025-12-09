"use client"

import useAuth from "@/hooks/use-auth"
import { axiosClient } from "@/lib/axios"
import { ChildProps, IUser } from "@/types/types"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import Loader from "../ui/loader"
import { io } from "socket.io-client";
import { ToastContainer } from 'react-toast'

const AuthProvider: FC<ChildProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { user, login, connect, socket } = useAuth()
  const { push } = useRouter()

  useEffect(() => {
    const getMe = async () => {
      setLoading(true)
      try {
        if(!user){
          const { data } = await axiosClient.get<{ user: IUser}>(`/api/auth/me`)
          if(data.user) login(data.user)
        }
        socket?.emit("addOnlineUser", user);
      } catch {
        push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    getMe()
  }, [user])
  
  useEffect(() => {
    connect(io('https://dream-legaue-tournament.onrender.com'))
    // connect(io('http://localhost:4000'))
  },[])

  if (loading) return <Loader />
  return (
    <div>
      {children}
      <ToastContainer delay={5000} />
    </div>
  )
}

export default AuthProvider