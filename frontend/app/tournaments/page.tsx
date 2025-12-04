"use client"

import { MouseEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Trophy, Search, ArrowUpDown, Trash2, Play, Eye, PlusCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ITournament } from "@/types/types"
import { axiosClient } from "@/lib/axios"
import { format } from 'date-fns';
import useAuth from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function TournamentsPage() {
  const { user, socket } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const [tournaments, setTournaments] = useState<ITournament[]>([])
  const [sortBy, setSortBy] = useState<"date" | "participants">("date")
  const [filterStatus, setFilterStatus] = useState<"all" | "started" | "pending" | "finished">("all")
  const [load, setLoad] = useState<boolean>(true)
  const [deleteLoad, setDeleteLoad] = useState<string>("")

  const getTournaments = async () => {
    try {
        const { data } = await axiosClient.get<{ tournaments: ITournament[]}>(`/api/tournament/tournaments`)      
        setTournaments(data.tournaments)
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false)
    }
  }

  const onDeleteHandler = async(id: string) => {
    try {
      setDeleteLoad(id)
      const { data } = await axiosClient.delete<{ tourner: ITournament}>(`/api/tournament/delete/${id}`)      
      setTournaments(prev => prev.filter(item => item._id !== data.tourner._id))
      socket?.emit("deleteTournament", { tournament: data.tourner})
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoad("")
    }
  }

  const onJoinHandler = async (id: string) => {
    try {
      setDeleteLoad(id)
      const { data } = await axiosClient.put<{ updateTourner: ITournament }>(`/api/tournament/join/${id}`)      
      setTournaments(prev =>
        prev.map(item => {
          if (item._id === id) {
            return {
              ...item,
              players: user ? [...item.players, user] : item.players
            };
          }
          return item;
        })
      )
      socket?.emit("addNewParticipant", { tournament: data.updateTourner})
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoad("")
    }
  }

  const onStart = async (id: string) => {
    socket?.emit("giveLoader", true)
    setDeleteLoad(id)
    try {
      const { data } = await axiosClient.post<{ matches: string[] }>(`/api/tournament/generate/${id}`)
      setTournaments(prev => prev.map(item => {
        return { ...item, status: "started" }
      }))
      socket?.emit("changeStatus", { id, status: "started" })
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoad("")
      socket?.emit("giveLoader", true)
    }
  }
  
  useEffect(() => {
    getTournaments()
  },[])

  useEffect(() => {
    const handleUpdate = ({ tournament }: { tournament: ITournament }) => {
      setTournaments(prev =>
        prev.map(t => (t._id === tournament._id ? tournament : t))
      );
    };
  
    const handleDelete = ({ tournament }: { tournament: ITournament }) => {
      setTournaments(prev => prev.filter(t => t._id !== tournament._id));
    };
  
    const handleNew = ({ tournament }: { tournament: ITournament }) => {
      setTournaments(prev => [...prev, tournament]);
    };

    const changeStatus = ({ id, status }: { id: string, status: string }) => {
      setTournaments(prev => prev.map(tourner => {
        if(tourner._id === id){
          return {...tourner, status }
        }

        return tourner
      }))
    };
  
    socket?.on("getTournament", handleUpdate);
    socket?.on("getDeletedTournament", handleDelete);
    socket?.on("getNewTournament", handleNew);
    socket?.on("getNewStatus", changeStatus);
  
    return () => {
      socket?.off("getTournament", handleUpdate);
      socket?.off("getDeletedTournament", handleDelete);
      socket?.off("getNewTournament", handleNew);
      socket?.off("getNewStatus", changeStatus);
    };  
  
  },[socket, user])


  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.creator.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (sortBy === "participants") {
    filteredTournaments.sort((a, b) => b.players.length - a.players.length)
  } else {
    filteredTournaments.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Uyga qaytish!
          </Link>
            <Button asChild>
              <Link href="/tournaments/create">Turnir yaratish!</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Turnirlarni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={sortBy === "date" ? "default" : "outline"} onClick={() => setSortBy("date")} size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Oxirgilar
              </Button>
              <Button
                variant={sortBy === "participants" ? "default" : "outline"}
                onClick={() => setSortBy("participants")}
                size="sm"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Ommaviy
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "started", "pending", "finished"] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                size="sm"
              >
                {status === "all" ? "All Tournaments" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Tournaments List */}
        <div className="grid gap-4">
          {load ? (
            [1,2,3].map(item => (
              <TournamentSkeleton key={item} />
            ))
          ) : filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament) => (
              <div key={tournament._id}>
                <Card className="hover:shadow-2xl relative transition-all cursor-pointer rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                  {deleteLoad === tournament._id && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/80">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                    </div>
                  )}
                  <div className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xl text-gray-900">{tournament.title}</h3>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(tournament.status)}`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-4">tomonidan {tournament.creator.email}</p>
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <Button
                          variant="outline"
                          onClick={() => onJoinHandler(tournament._id)}
                          disabled={!!tournament.players.find(u => u._id === user?._id) || tournament.status !== "pending"}
                          title={tournament.players.find(u => u._id === user?._id) ? "Siz allaqachon qo'shilgansiz!" : "Qo'shilish"}
                          size="sm"
                          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r cursor-pointer hover:bg-gradient-to-l duration-300 from-green-500 to-emerald-600 text-white shadow hover:shadow-lg hover:text-white"
                        >
                          <PlusCircle size={16} />
                          Qo'shilish
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => router.push(`/tournaments/${tournament._id}`)}
                          size="sm"
                          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r cursor-pointer hover:bg-gradient-to-l duration-300 from-blue-500 to-indigo-600 text-white shadow hover:shadow-lg hover:text-white "
                        >
                          <Eye size={16} />
                          Ko'rish
                        </Button>

                        {user?._id === tournament.creator._id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => onDeleteHandler(tournament._id)}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r cursor-pointer hover:bg-gradient-to-l duration-300 from-red-500 to-rose-600 text-white shadow hover:shadow-lg hover:text-white"
                          >
                            <Trash2 size={16} />
                            O'chirish
                          </Button>
                        )}

                        {tournament.creator._id === user?._id && tournament.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onStart(tournament._id)
                            }}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r cursor-pointer hover:bg-gradient-to-l duration-300 from-yellow-400 to-orange-500 text-white shadow hover:shadow-lg hover:text-white "
                          >
                            <Play size={16} />
                            Boshlash
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Ishtirokchilar</p>
                          <p className="font-semibold text-gray-900">
                            {tournament.players.length}/16
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Boshlanish vaqti</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(tournament.time), "P hh:mm")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Jarayon</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all"
                              style={{ width: `${80}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

            ))
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No tournaments found matching your criteria.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function TournamentSkeleton() {
  return (
    <Card className="rounded-2xl p-6 animate-pulse border shadow-sm">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
      </div>
    </Card>
  )
}