const { default: mongoose } = require('mongoose')
const Tournament = require('../models/tournament.model')
const Match = require('../models/match.model')
const User = require("../models/user.model")
const { connectToDatabase } = require('../lib/mongoose')

const createTourner = async (req, res) => {
    try {
        if(!req.body){
            return res.status(400).json({ message: "Data is not defined!"})
        }
        await connectToDatabase()
        const tourner = await Tournament.create({ ...req.body, creator: req.userId })
        if(!tourner){
            return res.status(400).json({ message: "Tournament cannot create!"})
        }

        res.status(201).json({ tourner })
    } catch (error) {
        res.status(500).json(error)
    }
}

const deleteTourner = async (req, res) => {
    try {
        const { id } = req.params
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Tournamnet not found!"})
        }

        await connectToDatabase()
        const tourner = await Tournament.findByIdAndDelete(id)
        if(!tourner){
            return res.status(400).json({ message: "Tournament cannot delete!"})
        }

        await Match.deleteMany({ tournamet: tourner._id })
        res.status(201).json({ tourner })
    } catch (error) {
        res.status(500).json(error)
    }
}

const joinUser = async (req, res) => {
    try {
        const { id } = req.params
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Tournamnet not found!"})
        }
        await connectToDatabase()
        
        const checked = await Tournament.findById(id)
        if(checked.players.find(p => p.toString() === req.userId.toString())){
            return res.status(400).json({ message: "Siz allaqachon qo'shilgansiz!" })
        }
        const updateTourner = await Tournament.findByIdAndUpdate(id, { $push: { players: req.userId }}, { new: true }).populate("creator").populate("players", "_id email")
        res.status(200).json({ updateTourner })
    } catch (error) {
        res.status(500).json(error)
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

const generateMatches = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid tournament ID" })

        await connectToDatabase()
        const tournament = await Tournament.findById(id).populate("matchs")
        if (!tournament) return res.status(404).json({ message: "Tournament not found" })
        if (tournament.status !== "pending")
            return res.status(400).json({ message: "Matches already generated or tournament started" })

        let players = [...tournament.players]
        if (players.length < 2) return res.status(400).json({ message: "Not enough players" })

        players = shuffle(players)
        let totalPlayers = players.length
        let nextPowerOfTwo = 1
        while (nextPowerOfTwo < totalPlayers) nextPowerOfTwo *= 2
        const byes = nextPowerOfTwo - totalPlayers

        for (let i = 0; i < byes; i++) players.push(null)

        const rounds = Math.log2(nextPowerOfTwo)
        const matchMatrix = []

        for (let r = 1; r <= rounds; r++) {
            const numMatches = nextPowerOfTwo / Math.pow(2, r)
            matchMatrix[r] = []
            for (let m = 0; m < numMatches; m++) {
                matchMatrix[r][m] = { player1: null, player2: null, nextMatchId: null }
            }
        }

        for (let i = 0; i < nextPowerOfTwo; i += 2) {
            matchMatrix[1][i / 2].player1 = players[i]
            matchMatrix[1][i / 2].player2 = players[i + 1]
        }

        for (let r = 1; r < rounds; r++) {
            for (let m = 0; m < matchMatrix[r].length; m += 2) {
                matchMatrix[r][m].nextIndex = Math.floor(m / 2)
                matchMatrix[r][m + 1].nextIndex = Math.floor(m / 2)
            }
        }

        const createdMatchIds = []
        const roundMatches = {}

        for (let r = 1; r <= rounds; r++) {
            roundMatches[r] = []
            for (let m = 0; m < matchMatrix[r].length; m++) {
                const data = matchMatrix[r][m]
                const match = await Match.create({
                    tournamet: tournament._id,
                    round: r,
                    player1: data.player1,
                    player2: data.player2,
                    nextMatchId: r === rounds ? null : null
                })
                createdMatchIds.push(match._id)
                roundMatches[r].push(match)
            }
        }

        for (let r = 1; r < rounds; r++) {
            for (let m = 0; m < roundMatches[r].length; m++) {
                const nextIndex = matchMatrix[r][m].nextIndex
                roundMatches[r][m].nextMatchId = roundMatches[r + 1][nextIndex]._id
                await roundMatches[r][m].save()
            }
        }

        tournament.matchs = createdMatchIds
        tournament.status = "started"
        await tournament.save() 
        const stndMatchs = await Tournament.findById(id)
        .populate({
            path: "matchs",
            populate: [
            { path: "player1", select: "_id email"},
            { path: "player2", select: "_id email"}
            ]
        });
        res.json({ message: "Matches generated successfully", matches: stndMatchs.matchs })
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e })
    }
}

const getTournament = async (req, res) => {
    try {
        const { id } = req.params
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Tournamnet not found!"})
        }
        
        await connectToDatabase()
        const matches = await Match.find({ tournamet: id })
        .populate([
            { path: "player1", select: "email _id" },
            { path: "player2", select: "email _id" },
            { path: "winner", select: "email _id" }
        ])

        const tournament = await Tournament.findById(id).select("status _id createdAt creator location time title players").populate("players", "_id email")
        res.status(200).json({ matches, tournament })
    } catch (error) {
        res.status(500).json(error)
    }
}

const getTournaments = async (req, res) => {
    try {
        await connectToDatabase()
        const tournaments = await Tournament.find().populate("players").populate("creator")
        res.status(200).json({ tournaments })
    } catch (error) {
        res.status(500).json(error)
    }
}

const changeTournerRound = async(req, res) => {
    try {
        const { id } = req.params
        const { winnerId } = req.body

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" })

        await connectToDatabase()
        const match = await Match.findById(id).populate("player1", "_id email").populate("player2", "_id email")
        if (!match) return res.status(404).json({ message: "Match not found" })
        if (match.winner) return res.status(400).json({ message: "Winner already set" })

        if (winnerId !== match.player1._id.toString() && winnerId !== match.player2._id.toString())
            return res.status(400).json({ message: "Winner must be one of the players" })

        match.winner = winnerId
        await match.save()

        if(match.nextMatchId){
            const nextmatch = await Match.findById(match.nextMatchId)
            nextmatch.player1 ? nextmatch.player2 = winnerId : nextmatch.player1 = winnerId
            await nextmatch.save()
            const populatedNextMatch = await Match.findById(nextmatch._id).populate("player1", "_id email").populate("player2", "_id email");
            const populateMatch = await Match.findById(id).populate("player1", "_id email").populate("player2", "_id email").populate("winner", "_id email")
            return res.json({ message: "Winner set and next round updated", newMatch: populatedNextMatch, match: populateMatch })
        }
        
        const populateMatch = await Match.findById(id).populate("player1", "_id email").populate("player2", "_id email").populate("winner", "_id email")
        const tournament = await Tournament.findByIdAndUpdate(match.tournamet, { status: "finished" }, { new: true })
        return res.json({ message: "Winner set and next round updated",  tournament, match: populateMatch })
    } catch (error) {
        res.status(500).json(error)   
    }
}

const myTournaments = async (req, res) => {
    try {
        await connectToDatabase()
        const tournaments = await Tournament.find({ creator: req.userId })
        const users = (await User.find()).length
        const active = (await Tournament.find({ status: "started" })).length
        const matches = (await Match.find()).length
        const stats = { users, active, matches }
        res.json({ data: { tournaments, stats }})
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = { deleteTourner, createTourner, joinUser, generateMatches, getTournament, changeTournerRound, getTournaments, myTournaments }