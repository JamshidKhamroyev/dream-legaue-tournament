"use client"

import { ITournament, IUser, Match } from "@/types/types"
import BracketMatch from "./bracket-match"
import MatchWinnerModal from "./modals/check-modal"
import { useEffect, useState } from "react"
import { axiosClient } from "@/lib/axios"
import { useRouter } from "next/navigation"
import useAuth from "@/hooks/use-auth"
import MatchGeneratorLoader from "./ui/global-loader"
import { useSound } from "use-sound"
import WinnerDeterminationLoader from "./ui/round-loader"
import { toast } from "react-toast"

interface TournamentBracketProps {
  matches: Match[]
  creator?: IUser
  setMatches: (prev: Match[]) => void
  setSelect: (id: string) => void
  global: "start" | "round" | ""
}

export function TournamentBracket({
  matches: currentMatches,
  setSelect,
  global,
  setMatches,
  creator
}: TournamentBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [grouped, setGrouped] = useState<Match[][]>(groupByRound(currentMatches))
  const { user, socket } = useAuth()
  const [playWinSound] = useSound("/win.wav")
  const router = useRouter()

  const handleSelectMatch = (match: Match) => {
    if(creator === user?._id && !match.winner && (match.player1 || match.player2)){
      setSelectedMatch(match)
      setIsModalOpen(true)
    }
    setSelect(match._id)
  }

  const handleSubmitWinner = async (matchId: string, winnerId: string) => {
    try {
      socket?.emit("giveLoader", "round")
      const { data } = await axiosClient.put<{ tournament?: ITournament, newMatch?: Match, match?: Match }>(`/api/tournament/change-round/${matchId}`, { winnerId })
      router.refresh()
      if(data.tournament){
        socket?.emit("changeStatus", { id: data.tournament._id, status: data.tournament.status })
      }

      if(data.newMatch){
        const newData = currentMatches.map(match => {
          if(match._id === data.match?._id){
            return match = data.match
          }
          if(match._id === data.newMatch?._id){
            return match = data.newMatch
          }
          return match
        })
        setMatches(newData)
        setGrouped(groupByRound(newData))
        socket?.emit("changeMatch", { matches: newData })
      }
      const newData = currentMatches.map(match => {
        if (match._id === data.match?._id){
          return data.match
        }

        return match
      })
      
      setGrouped(groupByRound(newData))
      socket?.emit("changeMatch", { matches: newData })
      setIsModalOpen(false)
      setSelectedMatch(null)
    } catch (error) {
      console.error("Error updating winner:", error)
      throw error
    } finally {
      socket?.emit("giveLoader", "")
    }
  }

  useEffect(() => {
    socket?.on("getChangedmatch", (matches: Match[]) => {
      matches.forEach(newMatch => {
        const oldMatch = currentMatches.find(m => m._id === newMatch._id);
        if (!oldMatch) return;
        if (oldMatch.winner?._id !== newMatch.winner?._id) {
          if (newMatch.winner && newMatch.player1 && newMatch.player2) {
            toast.success(`${newMatch.player1.email} va ${newMatch.player2.email} o‘yinida ${newMatch.winner.email} g‘olib bo‘ldi!`);
            playWinSound();
          }
        }
      });

      setMatches(matches)
      setGrouped(groupByRound(matches))
    })
  },[socket, user])

  useEffect(() => {
    setGrouped(groupByRound(currentMatches))
  },[currentMatches])

  const BracketSkeleton = () => (
    <div className="flex flex-col gap-6 min-w-[230px]">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-4 animate-pulse"></div>
      {[1,2,3].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse mb-6"></div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl font-bold text-foreground">{user?._id === creator ? "Mening turnirim!" :  "Turnir!"}</h2>

      <div className="overflow-x-auto pb-6 relative">
        {global === "start" ? (
          <MatchGeneratorLoader />
        ) : global === "" ? (
          <div className="flex sm:gap-16 gap-7 min-w-min sm:p-6 p-2 bg-muted/20 rounded-lg transition-all">
            {currentMatches && currentMatches.length > 0 ? (
              grouped.map((roundMatches, roundIndex) => {
                const isFinal = roundIndex === grouped.length - 1
                return (
                  <div
                    key={roundIndex}
                    className="flex flex-col gap-6 justify-evenly sm:min-w-[230px] relative"
                  >
                    <h3 className="text-sm font-bold text-muted-foreground text-center">
                      {isFinal ? "Final" : `Round ${roundMatches[0].round}`}
                    </h3>

                    <div className="flex flex-col sm:gap-10 gap-y-5">
                      {roundMatches.map((match, index) => {
                        const direction = index % 2 === 0 ? "down" : "up"
                        return (
                          <div key={match._id} className="relative">
                            <BracketMatch
                              match={match}
                              onSelectMatch={handleSelectMatch}
                              isSelected={selectedMatch?._id === match._id}
                            />
                            {!isFinal && <BracketLine direction={direction} height={80} />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            ) : (
              <p>O'yinlar mavjud emas!</p>
            )}
          </div>
        ) : (
          <WinnerDeterminationLoader />
        ) }
      </div>

      <MatchWinnerModal
        match={selectedMatch}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMatch(null)
        }}
        onSubmit={handleSubmitWinner}
      />
    </div>
  )
}


function BracketLine({
  direction,
  height = 60,
}: {
  direction: "up" | "down"
  height?: number
}) {
  const half = height / 2
  const isDown = direction === "down"

  return (
    <div className="absolute top-1/2 left-full -translate-y-1/2">
      <div className="sm:w-10 w-5 border-b border-border"></div>
      <div
        className="border-r border-border mx-auto"
        style={{
          height: `${half}px`,
          marginTop: isDown ? "0px" : `-${half}px`,
          marginBottom: isDown ? `-${half}px` : "0px",
        }}
      ></div>
    </div>
  )
}

function groupByRound(matches: Match[]) {
  const rounds: Record<number, Match[]> = {}

  for (const m of matches) {
    if (!rounds[m.round]) rounds[m.round] = []
    rounds[m.round].push(m)
  }

  return Object.values(rounds).sort((a, b) => a[0].round - b[0].round)
}