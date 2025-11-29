const cookieParser = require('cookie-parser')
const express = require('express')
require('dotenv').config()
const cors = require('cors')

const app = express()
app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/tournament', require('./routes/tourner.route'))

app.listen(process.env.PORT, () => console.log(`Server running on localhost:${process.env.PORT}`))