import { Response, Request } from 'express'
import { boosterJSON } from '../utils/mtgAPI'
import { map, pick, filter } from 'lodash'
import { roomModel } from '../models/room'
import { Player, Room, handleReq, isAI } from '../utils/room'
import { Card } from '../utils/booster'
import * as R from 'ramda'

export let getBooster = async (setName: string): Promise<Card[]> => {
    const genBooster: object[] = await boosterJSON(setName)
    return await map(genBooster['cards'], (item) => <Card> pick(item, ['name', 'colors', 'cmc', 'imageUrl']))
};

export let newRoom = async (req: Request, res: Response) => {
    var promises: Promise<Card[]>[] = []
    for (var i: number = 0; i < 8; i++) {
        promises.push(getBooster("hou"))
    }
    var boosters: Card[][] = <Card[][]> await Promise.all(promises)
    console.log(boosters)
    boosters = map(boosters, (booster) => map(booster, card => { card['pick'] = false; return card}))
    var players = map(await boosters, (boost: Card[]): Player => ({
        boostersToGo: [],
        currentBooster: boost,
        picks: [],
        human: false
    }))
    players[0]['human'] = true
    var room = new roomModel({
        players: await players,
        session: req.session.id,
        boosterNum: 1
    })
    room.save()
    console.log(room['players'][0]['currentBooster'])
    res.json(room['players'][0]['currentBooster'])
}


export let registerPick = async (req: Request, res: Response) => {
    try {
        const retrievedRoom = await roomModel.findOne({'session': req.session.id});
        if (retrievedRoom === null) {
            res.json({error: 'No session with that id.', session: req.session});
            return;
        }
        const transformedRoom: Room = handleReq(req.body, <Room> retrievedRoom.toObject());
        try {
            await roomModel.findOneAndUpdate({_id: retrievedRoom._id}, transformedRoom);
            console.log(R.prop('currentBooster', R.filter((player: Player): boolean => R.not(isAI(player)), R.prop('players', transformedRoom))[0]));
            res.json(R.prop('currentBooster', R.filter((player: Player): boolean => R.not(isAI(player)), R.prop('players', transformedRoom))[0]));
        } catch(err) {
            res.json({error: 'Unspecified error occurred.', session: req.session});
            console.log(`${req.session.id}: ${err}`);
        }
        //res.json(transformedRoom);
    } catch(err) {
        res.json({error: 'Unspecified error occurred.', session: req.session});
        console.log(`${req.session.id}: ${err}`)
    }



}

export let cancelDraft = async (req: Request, res: Response) => {
    await roomModel
        .remove({'session': req.session.id})
    res.json({'session': req.session.id})
}