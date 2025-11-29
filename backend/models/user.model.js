const { model, Schema } = require("mongoose")

const userSchema = new Schema({
    email: { type: String, unique: true },
    password: { type: String },
    username: { type: String },
    avatar: { type: String },
}, { timestamps: true })

module.exports = model("User", userSchema)