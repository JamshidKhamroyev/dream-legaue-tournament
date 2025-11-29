const { model, Schema } = require("mongoose")

const tournametSchema = new Schema({
    title: { type: String },
    time: { type: Date, default: new Date().getDay() + 1 },
    location: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending" ,"started", "finished"], default: "pending" },
    players: [{ type: Schema.Types.ObjectId, ref: "User" }],
    matchs: [{ type: Schema.Types.ObjectId, ref: "Match" }],
    winner: { type: Schema.Types.ObjectId, ref: "User" } || null
}, { timestamps: true })

module.exports = model("Tournament", tournametSchema)