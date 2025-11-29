const { model, Schema } = require("mongoose")

const matchSchema = new Schema({
    tournamet: { type: Schema.Types.ObjectId, ref: "Tournament", required: true },
    round: { type: Number, required: true },
    player1: { type: Schema.Types.ObjectId, ref: "User", default: null },
    player2: { type: Schema.Types.ObjectId, ref: "User", default: null },
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
    nextMatchId: { type: Schema.Types.ObjectId, ref: "Match", default: null }
}, { timestamps: true })

module.exports = model("Match", matchSchema)
