import * as mongoose from "mongoose";
import { Player, Room } from "../utils/room";

interface IPlayerModel extends Player, mongoose.Document { }

interface IRoomModel extends Room, mongoose.Document {}

const cardSchema = new mongoose.Schema({
    cmc: Number,
    colors: [String],
    imageUrl: String,
    name: String,
    pick: Boolean
});

const playerSchema = new mongoose.Schema({
    boostersToGo: [[cardSchema]],
    currentBooster: [cardSchema],
    human: Boolean,
    picks: [[cardSchema]],
});

const roomSchema = new mongoose.Schema({
    boosterNum: Number,
    players: [playerSchema],
    session: String,
});

export const roomModel = mongoose.model<IRoomModel>("Room", roomSchema);