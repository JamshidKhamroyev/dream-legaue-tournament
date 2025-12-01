import { IUser } from "@/types/types"
import { io } from "socket.io-client"
import { create } from "zustand"

interface Store {
    user: IUser | null
    login: (user: IUser) => void
    logout: () => void 
    socket: ReturnType<typeof io> | null
    connect: (socket: ReturnType<typeof io>) => void
}

const useAuth = create<Store>()((set) => ({
    user: null,
    login(user) { set({ user })},
    logout() { set({ user: null })},
    socket: null,
    connect(socket){ set({ socket })}
}))

export default useAuth