// ===== 1. bracket-match.tsx =====
"use client"

import { Match } from "@/types/types"
import { Trophy } from "lucide-react"

interface BracketMatchProps {
  match: Match
  onSelectMatch?: (match: Match) => void
  isSelected?: boolean
}

export default function BracketMatch({ 
  match, 
  onSelectMatch, 
  isSelected 
}: BracketMatchProps) {
  const winner = match.winner
  const hasWinner = Boolean(winner)

  return (
    <div
      onClick={() => onSelectMatch?.(match)}
      className={`
        sm:rounded-xl rounded-sm border bg-card shadow-sm sm:p-4 p-2 cursor-pointer select-none
        transition-all duration-200
        ${isSelected ? "border-primary shadow-md bg-primary/5" : "hover:bg-muted/40"}
      `}
    >
      <div className="space-y-3">
        {/* PLAYER 1 */}
        <div
          className={`
            flex items-center justify-between sm:rounded-lg rounded-sm sm:px-3 px-1 sm:py-2 py-2 text-sm transition
            ${match.player1
              ? winner?._id === match.player1._id
                ? "bg-primary/20 text-primary font-semibold"
                : "bg-muted/50 text-foreground"
              : "bg-muted/30 text-muted-foreground"
            }
          `}
        >
          <span className="truncate">{match.player1?.email ?? "Noma'lum"}</span>
          <span className="ml-2 min-w-fit font-medium">-</span>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-border" />

        {/* PLAYER 2 */}
        <div
          className={`
            flex items-center justify-between sm:rounded-lg rounded-sm px-3 py-2 text-sm transition
            ${match.player2
              ? winner?._id === match.player2._id
                ? "bg-primary/20 text-primary font-semibold"
                : "bg-muted/50 text-foreground"
              : "bg-muted/30 text-muted-foreground"
            }
          `}
        >
          <span className="truncate">{match.player2?.email ?? "Noma'lum"}</span>
          <span className="ml-2 min-w-fit font-medium">-</span>
        </div>
      </div>

      {/* STATUS */}
      {!hasWinner && match.player1 && match.player2 && (
        <div className="mt-3 text-center">
          <span className="text-xs font-semibold text-primary">PENDING</span>
        </div>
      )}

      {hasWinner && (
        <div className="mt-3 flex items-center justify-center gap-1 text-primary">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-semibold">FINISHED</span>
        </div>
      )}
    </div>
  )
}
