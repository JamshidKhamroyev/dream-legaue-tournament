const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    const token = req.cookies && req.cookies.token
    if (!token) return res.status(401).json({ message: "Token not provided" })

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" })
        }
        req.userId = decoded.userId
        next()
    })
}