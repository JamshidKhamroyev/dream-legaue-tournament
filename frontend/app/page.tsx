"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trophy, Plus, Users, Zap, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { axiosClient } from "@/lib/axios"
import { ITournament, IUser } from "@/types/types"
import { redirect, useRouter } from "next/navigation"
import useAuth from "@/hooks/use-auth"
import DashboardLoader from "@/components/ui/dashboard-loader"

interface Props {
  tournaments: ITournament[]
  stats: {
    users: number
    active: number
    matches: number
  }
}

export default function Dashboard() {
  const { logout } = useAuth()
  const [stat, setStat] = useState<{ users: number, active: number, matches: number }>()
  const [tournaments, setTournaments] = useState<ITournament[]>([])
  const [loading, setLoading] = useState(true)


  const getMyTournaments = async () => {
    try {
      const { data } = await axiosClient.get<{ data: Props }>("/api/tournament/my-tournaments")      
      setTournaments(data.data.tournaments)
      setStat(data.data.stats)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const logoutHandler = async () => {
    try {
      logout()
      const { data } = await axiosClient.post(`/api/auth/logout`)      
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getMyTournaments()
  },[])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "started":
        return "bg-primary/10 text-primary"
      case "finished":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-secondary/10 text-secondary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if(loading) return <DashboardLoader />

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Turnirlar yarating!</h1>
            </div>
            <nav className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/tournaments">Hammmasini ko'rish!</Link>
              </Button>
              <Button asChild>
                <Link href="/tournaments/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Yangi turnir
                </Link>
              </Button>

                <Button asChild className="bg-red-800 hover:bg-red-950 cursor-pointer" onClick={logoutHandler}>
                  <div>
                    <LogOut className="w-4 h-4 mr-2" />
                    Chiqish
                  </div>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-border p-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Tournament Managerga xush kelibsiz</h2>
            <p className="text-muted-foreground mb-6">
              Real vaqt rejimida braket vizualizatsiyasi va peshqadamlar jadvali yordamida raqobatbardosh turnirlarni yarating, boshqaring va kuzatib boring.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Barcha foydalanuvchilar</p>
                  <p className="text-2xl font-bold text-foreground">{stat?.users || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Faol turnirlar</p>
                  <p className="text-2xl font-bold text-foreground">{stat?.active || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Barcha o'yinlar</p>
                  <p className="text-2xl font-bold text-foreground">{stat?.matches || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">Sizning turnirlaringiz!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.length > 0 ? tournaments.map((tournament) => (
              <Link key={tournament._id} href={`/tournaments/${tournament._id}`}>
                <Card className="hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-foreground flex-1 text-balance">{tournament.title}</h3>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusColor(tournament.status)}`}
                      >
                        {getStatusLabel(tournament.status)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ishtirokchilar</span>
                        <span className="font-semibold text-foreground">{tournament.players.length}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Barcha o'yinlar</span>
                        <span className="font-semibold text-foreground">{tournament.matchs.length}</span>
                      </div>
                      <Button className="w-full mt-4 bg-transparent" variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            )) : (
              <div className="w-[80vw] flex items-center justify-center py-4">
                  <span>Hozircha turnirlar o'tkazmagansiz!</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Oxirgi o'yinlar</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Player {i} vs Player {i + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">Summer Champions League</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {2 + i} - {1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Rating</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold w-6 text-primary">#{i}</span>
                    <span className="text-sm font-semibold text-foreground">Player {i}</span>
                  </div>
                  <span className="text-sm font-bold text-accent">{100 - i * 10} pts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
