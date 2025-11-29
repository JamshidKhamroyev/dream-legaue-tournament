const { register, login, logout, me } = require("../controller/auth.controller")
const authMidlewere = require("../middlewere/auth.midlewere")

const router = require("express").Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMidlewere, me)
router.post('/logout', authMidlewere, logout)

module.exports = router