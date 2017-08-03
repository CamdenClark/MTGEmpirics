import { Request, Response } from "express";
import { filter, map, pick } from "lodash";
import * as R from "ramda";

import { roomModel } from "../models/room";

import { Card } from "../utils/booster";
import { boosterJSON } from "../utils/mtgAPI";
import { handleReq, isAI, Player, Room } from "../utils/room";

export let getBooster = async (setName: string): Promise<Card[]> => {
    const genBooster: Card[] = await boosterJSON(setName);
    return await map(genBooster, (item) => pick(item, ["cmc", "colors", "imageUrl", "name"]) as Card);
};

export let newRoom = async (req: Request, res: Response) => {
    const promises: Array<Promise<Card[]>> = [];
    for (let i: number = 0; i < 8; i++) {
        promises.push(getBooster("hou"));
    }
    let boosters: Card[][] = await Promise.all(promises) as Card[][];
    console.log(boosters);
    boosters = map(boosters, (booster) => map(booster, (card) => R.assoc("pick", true, card)));
    const players = map(boosters, (boost: Card[]): Player => ({
        boostersToGo: [],
        currentBooster: boost,
        human: false,
        picks: [],
    }));
    players[0].human = true;
    const room = new roomModel({
        boosterNum: 1,
        players,
        session: req.session.id,
    });
    await room.save();
    res.json(room.players[0].currentBooster);
};

export let registerPick = async (req: Request, res: Response) => {
    try {
        const retrievedRoom = await roomModel.findOne({session: req.session.id});
        if (retrievedRoom === null) {
            res.json({error: "No session with that id.", session: req.session});
            return;
        }
        const transformedRoom: Room = handleReq(req.body, retrievedRoom.toObject() as Room);
        try {
            await roomModel.findOneAndUpdate({_id: retrievedRoom._id}, transformedRoom);
            console.log(R.prop("currentBooster", R.filter((player: Player): boolean =>
                R.not(isAI(player)), R.prop("players", transformedRoom))[0]));
            res.json(R.prop("currentBooster", R.filter((player: Player): boolean =>
                R.not(isAI(player)), R.prop("players", transformedRoom))[0]));
        } catch (err) {
            res.json({error: "Unspecified error occurred.", session: req.session});
            console.log(`${req.session.id}: ${err}`);
        }
        // res.json(transformedRoom);
    } catch (err) {
        res.json({error: "Unspecified error occurred.", session: req.session});
        console.log(`${req.session.id}: ${err}`);
    }

};

export let cancelDraft = async (req: Request, res: Response) => {
    await roomModel
        .remove({session: req.session.id});
    res.json({session: req.session.id});
};
