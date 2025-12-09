"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarClock, Loader2, MapPin, Type } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { axiosClient } from "@/lib/axios"
import { ITournament } from "@/types/types"
import useAuth from "@/hooks/use-auth"
import { toast } from "react-toast"

export default function CreateTournamentPage() {
  const router = useRouter()
  const { socket } = useAuth()
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({ title: "", location: "", time: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axiosClient.post<{ tourner: ITournament }>(`/api/tournament/create`, formData)  
      socket?.emit("addNewTournament", { tournament: data.tourner })
      toast.success(`${data.tourner.title} muvaffaqiyatli yaratilindi!`)
      router.push("/tournaments")
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/tournaments"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>
          <h1 className="text-2xl max-sm:hidden font-bold text-foreground">Create Tournament</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 max-sm:px-1 sm:py-8 py-4">
        <Card className="sm:p-8 p-3">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <Label htmlFor="title" className="block text-sm font-semibold mb-2">
                Turnir nomi *
              </Label>
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Summer Cup 2025"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="block text-sm font-semibold mb-2">
                Manzili *
              </Label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., Tashkent Arena"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="time" className="block text-sm font-semibold mb-2">
                Vaqti *
              </Label>
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  name="time"
                  type="datetime-local"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/tournaments">Bekor qilish</Link>
              </Button>
              <Button disabled={loading} type="submit" className="bg-primary text-primary-foreground">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>Yaratilinmoqda...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : "Yaratish"}
              </Button>
            </div>

          </form>
        </Card>
      </main>
    </div>
  )
}
