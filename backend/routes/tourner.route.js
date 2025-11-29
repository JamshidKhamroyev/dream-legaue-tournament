const router = require("express").Router()
const { createTourner, deleteTourner, joinUser, generateMatches, getTournament, changeTournerRound, getTournaments, myTournaments } = require("../controller/tourner.controller")
const authMidlewere = require("../middlewere/auth.midlewere")

router.post('/create', authMidlewere, createTourner)
router.get('/my-tournaments', authMidlewere, myTournaments)
router.get('/tournaments', authMidlewere, getTournaments)
router.delete('/delete/:id', authMidlewere, deleteTourner)
router.put('/join/:id', authMidlewere, joinUser)
router.put('/change-round/:id', authMidlewere, changeTournerRound)
router.post('/generate/:id', authMidlewere, generateMatches)
router.get('/get/:id', authMidlewere, getTournament)

module.exports = router