import { redirect } from "next/navigation"

const page = async() => {
    redirect('/auth/login')
}

export default page