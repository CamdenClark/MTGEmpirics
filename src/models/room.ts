import * as mongoose from 'mongoose'
import { Player, Room } from '../utils/room'

interface IPlayerModel extends Player, mongoose.Document { }

interface IRoomModel extends Room, mongoose.Document {}

var cardSchema = new mongoose.Schema({
    name: String,
    colors: [String],
    cmc: Number,
    imageUrl: String,
    pick: Boolean
})

var playerSchema = new mongoose.Schema({
    boostersToGo: [[cardSchema]],
    currentBooster: [cardSchema],
    picks: [[cardSchema]],
    human: Boolean
})

var roomSchema = new mongoose.Schema({
    players: [playerSchema],
    session: String,
    boosterNum: Number
})

export var roomModel = mongoose.model<IRoomModel>("Room", roomSchema);