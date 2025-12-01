"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trophy, Users, Calendar, MapPin, ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TournamentBracket } from "@/components/tournament-bracket"
import { axiosClient } from "@/lib/axios"
import { ITournament, Match } from "@/types/types"
import { format } from "date-fns"
import { useParams } from "next/navigation"


export default function TournamentPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const [tournament, setTournament] = useState<ITournament>()
  const [matchs, setMatches] = useState<Match[]>([])
  const [winsByEmail, setWinsByEmail] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState<boolean>(true)

  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(undefined)

  const selectedMatch = matchs.flat().find((m) => m._id === selectedMatchId)

  const getMatchs = async () => {
    const wins: Record<string, number> = {}
    try {
      const { data } = await axiosClient.get<{ matches: Match[], tournament: ITournament }>(`/api/tournament/get/${tournamentId}`)      
      setTournament(data.tournament)
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

  useEffect(() => {
    getMatchs()
  },[tournamentId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "started":
        return "bg-green-400 text-white"
      case "finished":
        return "bg-gray-300 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-sky-600 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  console.log(winsByEmail);
  

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/tournaments"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Barcha turnilar!
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{tournament?.title || "Nomsiz"}</h1>
                <p className="text-sm text-muted-foreground">{tournament?.location || "Manzilsiz  "}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(tournament?.status!)}`}>
                {tournament && tournament.status.charAt(0).toUpperCase() + tournament?.status.slice(1) || "noaniq"}
              </span>
              <Button variant="destructive" size="sm">
                <Edit className="w-4 h-4 mr-2 cursor-pointer" />
                O'chirish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tournament Info */}
        {loading ? (
              <Card className="rounded-2xl p-6 animate-pulse mb-4 border shadow-sm grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center">
                <div className="h-6 bg-gray-300 rounded p-8" />
                <div className="h-4 bg-gray-200 rounded p-8" />
                <div className="h-4 bg-gray-200 rounded p-8" />
                <div className="h-4 bg-gray-200 rounded p-8" />
              </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ishtirokchilar</p>
              <p className="text-2xl font-bold text-foreground">
                {tournament?.players.length || 0}/16
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Format</p>
              <p className="text-2xl font-bold text-foreground text-balance">{tournament?.title || "Nomsiz"}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Boshlanish vaqti</p>
              </div>
                {tournament?.createdAt ? (
                  <p className="text-xl font-bold text-foreground text-balance">{format(new Date(tournament?.createdAt!), "dd/MM/Y")}</p>
                ) : <p className="text-xl font-bold text-foreground text-balance">Sana mavjud emas</p>}
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
              creator={tournament?.creator}
              title="My Tournament"
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
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ishtirokchilar va ularning o'rinlari!
              </h3>
              <div className="space-y-2">
                {Object.entries(winsByEmail).sort((a, b) => a[1] - b[1]).reverse().map(([email, count], i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                    <span className="font-medium text-foreground">{email}</span>
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
