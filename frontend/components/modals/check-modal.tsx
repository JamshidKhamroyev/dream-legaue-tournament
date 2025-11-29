import { Check, Trophy, X } from "lucide-react"
import { useState } from "react"

interface Player {
  _id: string
  email: string
}

interface Match {
  _id: string
  player1: Player | null
  player2: Player | null
  winner: Player | null
}

interface MatchWinnerModalProps {
  match: Match | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (matchId: string, winnerId: string) => Promise<void>
}

export default function MatchWinnerModal({
  match,
  isOpen,
  onClose,
  onSubmit,
}: MatchWinnerModalProps) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !match) return null

  const handleSubmit = async () => {
    if (!selectedWinner) return

    setIsSubmitting(true)
    try {
      await onSubmit(match._id, selectedWinner)
      setSelectedWinner(null)
    } catch (error) {
      console.error("Error submitting winner:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedWinner(null)
      onClose()
    }
  }

  if (match.winner) return

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl border max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">G'olibni tanlang</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Quyidagi o'yinchilardan birini g'olib sifatida belgilang:
          </p>

          {/* Player 1 */}
          {match.player1 && (
            <button
              onClick={() => setSelectedWinner(match.player1!._id)}
              disabled={isSubmitting}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all
                ${
                  selectedWinner === match.player1._id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${
                      selectedWinner === match.player1._id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }
                  `}
                >
                  {match.player1.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-medium">{match.player1.email}</p>
                  <p className="text-xs text-muted-foreground">O'yinchi 1</p>
                </div>
              </div>
              {selectedWinner === match.player1._id && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          )}

          {/* Player 2 */}
          {match.player2 && (
            <button
              onClick={() => setSelectedWinner(match.player2!._id)}
              disabled={isSubmitting}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all
                ${
                  selectedWinner === match.player2._id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${
                      selectedWinner === match.player2._id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }
                  `}
                >
                  {match.player2.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-medium">{match.player2.email}</p>
                  <p className="text-xs text-muted-foreground">O'yinchi 2</p>
                </div>
              </div>
              {selectedWinner === match.player2._id && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          )}

          {/* Match Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Match ID:</span> {match._id}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedWinner || isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? "Yuborilmoqda..." : "Tasdiqlash"}
          </button>
        </div>
      </div>
    </div>
  )
}