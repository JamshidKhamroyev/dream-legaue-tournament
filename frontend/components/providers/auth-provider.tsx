"use client"

import useAuth from "@/hooks/use-auth"
import { axiosClient } from "@/lib/axios"
import { ChildProps, IUser } from "@/types/types"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import Loader from "../ui/loader"

const AuthProvider: FC<ChildProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { user, login } = useAuth()
  const { push } = useRouter()

  useEffect(() => {
    const getMe = async () => {
      setLoading(true)
      try {
        if(!user){
          const { data } = await axiosClient.get<{ user: IUser}>(`/api/auth/me`)
          if(data.user) login(data.user)
        }
      } catch {
        push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    getMe()
  }, [user])  
  if (loading) return <Loader />
  return (
    <div>{children}</div>
  )
}

export default AuthProvider