const User = require("../models/user.model")
const { connectToDatabase } = require('../lib/mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
    try {
        const { email, password } = req.body
        if(!email || !password){
            return res.status(400).json({ message: "Data is not enough!"})
        }

        await connectToDatabase()
        const existUser = await User.findOne({ email })
        if(existUser){
            return res.status(400).json({ message: "User already exist in this email!"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({ email, password: hashedPassword })

        res.status(201).json({ user: newUser })
    } catch (error) {
        res.status(500).json(error)
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if(!email || !password){
            return res.status(400).json({ message: "Data is not enough!"})
        }

        await connectToDatabase()
        const existUser = await User.findOne({ email })
        if(!existUser){
            return res.status(400).json({ message: "User is not defined in this email!"})
        }

        const isVerify = await bcrypt.compare(password, existUser.password)

        if(!isVerify){
            return res.status(400).json({ message: "Password is incorrect!"})
        } 
        const token = jwt.sign({ userId: existUser._id }, process.env.JWT_SECRET_KEY)
        return res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none", maxAge: 1000 * 60 * 60 * 24 * 7, path: '/' }).json({ user: existUser })
    } catch (error) {
        res.status(500).json(error)
    }
}

const me = async (req, res) => {
    try {
        await connectToDatabase()
        const user = await User.findById(req.userId)
        res.json({ user })  
    } catch (error) {
        res.status(500).json(error)
    }
}


const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/"
        });
        res.json({ message: "Logged out successfully" });    
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = { login, register, logout, me }