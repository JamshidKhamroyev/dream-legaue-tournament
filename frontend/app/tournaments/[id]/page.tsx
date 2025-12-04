"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trophy, Users, Calendar, MapPin, ArrowLeft, Edit, Loader2, Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TournamentBracket } from "@/components/tournament-bracket"
import { axiosClient } from "@/lib/axios"
import { ITournament, Match } from "@/types/types"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import useAuth from "@/hooks/use-auth"


export default function TournamentPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const { user, socket } = useAuth()
  const [tournament, setTournament] = useState<ITournament>()
  const [matchs, setMatches] = useState<Match[]>([])
  const [load, setLoad] = useState(false)
  const router = useRouter()
  const [isStarting, setIsStarting] = useState<boolean>(false)
  const [winsByEmail, setWinsByEmail] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [global, setGlobal] = useState<"round" | "start" | "">("")
  const [startDate, setStartDate] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(new Date(startDate).getTime() - Date.now());

  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(undefined)

  const selectedMatch = matchs.flat().find((m) => m._id === selectedMatchId)
  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const getMatchs = async () => {
    const wins: Record<string, number> = {}
    try {
      const { data } = await axiosClient.get<{ matches: Match[], tournament: ITournament }>(`/api/tournament/get/${tournamentId}`)      
      setTournament(data.tournament)
      setStartDate(data.tournament.time)
      setMatches(data.matches)

      for (const user of data.tournament.players) {
        wins[user.email] = 0;
      }
      
      for (const match of data.matches) {
        if (match.winner) {
          const email = match.winner.email;
          wins[email] = (wins[email] || 0) + 1;
        }
      }
      
      setWinsByEmail(wins)  
    } catch (error) {
      console.log(error);
    }finally {
      setLoading(false)
    }
  }

  const onStart = async (id: string) => {
    setIsStarting(true)
    socket?.emit("giveLoader", "start")
    try {
      const { data } = await axiosClient.post<{ matches: Match[] }>(`/api/tournament/generate/${id}`)
      socket?.emit("changeStatus", { id, status: "started" })
      setTournament(prev => {
        if (!prev) return prev
        return { ...prev, status: "started" };
      })
      setMatches(data.matches)
      socket?.emit("changeMatch", data.matches)
    } catch (error) {
      console.log(error);
    } finally {
      setIsStarting(false)
      socket?.emit("giveLoader", "")
    }
  }

  const onDeleteHandler = async(id: string) => {
    setLoad(true)
    try {
      const { data } = await axiosClient.delete<{ tourner: ITournament}>(`/api/tournament/delete/${id}`)      
      socket?.emit("deleteTournament", { tournament: data.tourner})
      router.push('/tournaments')
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => {
    getMatchs()
  },[tournamentId])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(new Date(startDate).getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  useEffect(() => {
    socket?.on("showLoader", (load: "start" | "round" | "") => {
      setGlobal(load)
    })
    
    socket?.on("getNewStatus", ({ id, status }: { id: string, status: string }) => {
      setTournament(prev => {
        if (prev){ return ({ ...prev, status: status }) }
      })
    })

  },[socket, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "started":
        return `
          bg-green-500 text-white
          hover:bg-green-600 
          dark:hover:bg-green-500/80
          transition-colors
        `
  
      case "finished":
        return `
          bg-red-100 text-red-700 
          dark:bg-green-900 dark:text-green-300
          hover:bg-red-200 
          dark:hover:bg-green-800
          transition-colors
        `
  
      case "pending":
        return `
          bg-sky-600 text-white
          hover:bg-sky-700
          dark:hover:bg-sky-600/80
          transition-colors
        `
  
      default:
        return `
          bg-muted text-muted-foreground
          hover:bg-muted/90 hover:text-black
          transition-colors
        `
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/tournaments"
            className="flex items-center justify-between w-full gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-3"
          >
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Barcha turnilar!
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(tournament?.status!)}`}>
                {tournament && tournament.status.charAt(0).toUpperCase() + tournament?.status.slice(1) || "noaniq"}
              </span>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <h1 className="sm:text-2xl text-lg font-bold text-foreground">{tournament?.title.slice(0, 10) || "Nomsiz"}</h1>
                <p className="text-sm text-muted-foreground">{tournament?.location.slice(0, 17) || "Manzilsiz  "}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {tournament?.creator === user?._id && (
                <Button variant="destructive" className="cursor-pointer" size="sm" onClick={() => onDeleteHandler(tournamentId)}>
                  {load ? (
                    <div className="flex opacity-80 items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin"/>
                      <span className="max-sm:hidden">O'chirilmoqda...</span>
                    </div>  
                  ) : (
                    <>
                      <Edit className="w-4 h-4 sm:mr-2 cursor-pointer" />
                      <span className="max-sm:hidden">O'chirish</span>
                    </>
                  )}
                </Button>
              )}

              {tournament?.creator === user?._id && tournament?.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStart(tournament._id)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r cursor-pointer hover:bg-gradient-to-l duration-300 from-yellow-400 to-orange-500 text-white shadow hover:shadow-lg hover:text-white "
                >
                  {isStarting ? (
                    <div className="flex opacity-80 items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Boshlanmoqda...</span>
                    </div>  
                  ) : (
                    <>
                       <Play size={16} />
                        <span className="max-sm:hidden">Boshlash</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 max-sm:px-1 sm:px-6 lg:px-8 py-8">
        {/* Tournament Info */}
        {loading ? (
              <Card className="rounded-2xl p-6 animate-pulse mb-4 border shadow-sm grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center">
                <div className="h-6 bg-gray-300 rounded p-8" />
                <div className="h-4 bg-gray-200 rounded p-8" />
                <div className="h-4 bg-gray-200 rounded p-8" />
                <div className="h-4 bg-gray-200 rounded p-8" />
              </Card>
        ) : (
          <div className="grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-4 sm:gap-4 gap-1 mb-8">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ishtirokchilar</p>
              <p className="sm:text-2xl text-lg font-bold text-foreground">
                {tournament?.players.length || 0}/16
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Format</p>
              <p className="sm:text-2xl text-lg font-bold text-foreground text-balance">{tournament?.title || "Nomsiz"}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Boshlanish vaqti</p>
              </div>
                {tournament?.status !== "finished" && timeLeft >= 0 ? (
                   <p className="text-xl font-bold text-foreground text-balance">
                   {days > 0 && `${days} kun `}
             
                   {hours.toString().padStart(2, "0")}:
                   {minutes.toString().padStart(2, "0")}:
                   {seconds.toString().padStart(2, "0")}
                 </p>
                ) : <p className="text-xl font-semibold text-green-600 flex gap-x-1"><span>Vaqt bo'ldi</span> <Clock /></p>}
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Manzil</p>
              </div>
              <p className="font-semibold text-foreground text-sm text-balance">{tournament?.location || "Manzil yo'q"}</p>
            </Card>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bracket */}
          <div className="lg:col-span-2">
            <Card className="p-6">
            <TournamentBracket
              matches={matchs}
              global={global}
              setMatches={setMatches}
              creator={tournament?.creator}
              setSelect={setSelectedMatchId}
            />
            </Card>
          </div>

          <div className="space-y-6">
            {selectedMatch && (
              <Card className="p-6 border-primary/30 bg-primary/5">
                <h3 className="font-bold text-foreground mb-4">O'yin detallari</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">O'yin ID</p>
                    <p className="font-mono text-sm text-foreground">{selectedMatch._id}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">1-O'yinchi</p>
                      <p className="font-semibold text-foreground">{selectedMatch.player1?.email ? selectedMatch.player1?.email : `Bot-${(Math.random() * 100000000).toFixed(0)}` }</p>
                      <p className="text-sm text-primary font-bold mt-1">Score: {winsByEmail[selectedMatch.player1?.email!] || 0} g'alaba</p>
                    </div>

                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">2-O'yinchi</p>
                      <p className="font-semibold text-foreground">{selectedMatch.player2?.email ? selectedMatch.player2?.email : `Bot-${(Math.random() * 100000000).toFixed(0)}` }</p>
                      <p className="text-sm font-bold mt-1">Score: {winsByEmail[selectedMatch.player2?.email!] || 0} g'alaba</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Participants */}
            <Card className="sm:p-6 p-2">
              <h3 className="font-bold text-foreground max-sm:text-xs p-2 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ishtirokchilar va ularning o'rinlari!
              </h3>
              <div className="space-y-2">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">O‘yinchi</th>
                    <th className="py-3 px-4 text-left font-medium">G‘alabalar</th>
                    <th className="py-3 px-4 text-left font-medium">Reyting</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(winsByEmail)
                    .sort((a, b) => b[1] - a[1])
                    .map(([email, count], i) => {
                      const rank = i + 1

                      const rankColor =
                        rank === 1
                          ? "text-yellow-500 font-bold"
                          : rank === 2
                          ? "text-gray-400 font-semibold"
                          : rank === 3
                          ? "text-amber-700 font-semibold"
                          : "text-muted-foreground"

                      return (
                        <tr
                          key={i}
                          className="border-t border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 sm:px-4 px-2 font-medium text-foreground">
                            <span className="max-sm:hidden">{email}</span>
                            <span className="sm:hidden capitalize">{email.split("@")[0]}</span>
                          </td>

                          <td className="py-3 sm:px-4 px-2 text-center">{count}</td>

                          <td className="py-3 sm:px-4 px-2 text-center">
                            <span className={`text-sm ${rankColor}`}>
                              #{rank}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
