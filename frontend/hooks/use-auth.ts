import { IUser } from "@/types/types"
import { create } from "zustand"

interface Store {
    user: IUser | null
    login: (user: IUser) => void
    logout: () => void 
}

const useAuth = create<Store>()((set) => ({
    user: null,
    login(user) { set({ user })},
    logout() { set({ user: null })},
}))

export default useAuth