"use client"

import { IUser, Match } from "@/types/types"
import BracketMatch from "./bracket-match"
import MatchWinnerModal from "./modals/check-modal"
import { useState } from "react"
import { axiosClient } from "@/lib/axios"
import { useRouter } from "next/navigation"
import useAuth from "@/hooks/use-auth"

interface TournamentBracketProps {
  matches: Match[]
  title?: string
  creator?: IUser
  setSelect: (id: string) => void
}

export function TournamentBracket({
  matches,
  title = "Tournament Bracket",
  setSelect,
  creator
}: TournamentBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const grouped = matches ? groupByRound(matches) : []

  const handleSelectMatch = (match: Match) => {
    if(creator?._id === user?._id && !match.winner){
      setSelectedMatch(match)
      setIsModalOpen(true)
    }
    setSelect(match._id)
  }

  const handleSubmitWinner = async (matchId: string, winnerId: string) => {
    try {
      await axiosClient.put(`/api/tournament/change-round/${matchId}`, { winnerId })
      router.refresh()
      setIsModalOpen(false)
      setSelectedMatch(null)
    } catch (error) {
      console.error("Error updating winner:", error)
      throw error
    }
  }

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
      <h2 className="text-xl font-bold text-foreground">{title}</h2>

      <div className="overflow-x-auto pb-6">
        <div className="flex gap-16 min-w-min p-6 bg-muted/20 rounded-lg transition-all">
          {matches && matches.length > 0 ? (
            grouped.map((roundMatches, roundIndex) => {
              const isFinal = roundIndex === grouped.length - 1
              return (
                <div
                  key={roundIndex}
                  className="flex flex-col gap-6 justify-evenly min-w-[230px] relative"
                >
                  <h3 className="text-sm font-bold text-muted-foreground text-center">
                    {isFinal ? "Final" : `Round ${roundMatches[0].round}`}
                  </h3>

                  <div className="flex flex-col gap-10">
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
            [1,2,3].map((_, i) => <BracketSkeleton key={i} />)
          )}
        </div>
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
      <div className="w-10 border-b border-border"></div>
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