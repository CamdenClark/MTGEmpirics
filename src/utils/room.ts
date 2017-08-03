import { Card, filterPicked, pickRandom } from "./booster";

import { filter, map, random } from "lodash";
import * as R from "ramda";

export interface Player {
    boostersToGo: Card[][];
    currentBooster: Card[];
    picks: Card[][];
    human: boolean;
}

export interface Room {
    players: Player[];
    session: string;
    boosterNum: number;
}

const draftFormats = {
    hou: ["hou", "hou", "akh"]
};

export const isAI = (player: Player): boolean =>
    R.propSatisfies((x) => x === false, "human", player);

const replaceHumanWithPicked         = (booster: Card[]) => (player: Player): Player => {
    if (!isAI(player)) {
        return R.assoc("currentBooster", booster, player);
    }
    return player;
};

const handleAIPick              = (player: Player): Player => {
    if (isAI(player)) {
        return R.assoc("currentBooster", pickRandom(R.prop("currentBooster", player)), player);
    }
    return player;
};

// Formally pick the card.
const pushCurrentBoosterToPicks = (player: Player): Player => {
    return R.assoc("picks", R.append(R.prop("currentBooster", player), R.prop("picks", player)), player);
};

// Remove the card that was picked by the user or AI from current booster
const removePickedCard          = (player: Player): Player => {
    return R.assoc("currentBooster", filterPicked(R.prop("currentBooster", player)), player);
};

// Pass a booster [util]
const passBooster = (previousPlayer: Player, nextPlayer: Player): Player => {
    if (R.prop("currentBooster", previousPlayer) === []) {
        return nextPlayer;
    } else {
        return R.assoc("boostersToGo",
            R.append(R.prop("currentBooster", previousPlayer), R.prop("boostersToGo", nextPlayer)),
            nextPlayer);
    }
};

// Passes a booster from the last player to the next [Util, not part of handling pipeline]
const passBoosterAndAppend      = (previousPlayers: Player[], nextPlayer: Player): Player[] =>
    R.append(passBooster(R.last(previousPlayers), nextPlayer), previousPlayers);

// Pass all the boosters!
const passAllBoosters           = (players: Player[]): Player[] =>
    R.reduce(passBoosterAndAppend, [passBooster(R.last(players), R.head(players))], players.slice(1));

// deletes current booster
const deleteCurrentBooster      = (player: Player): Player =>
    R.assoc("currentBooster", [], player);

// transfer top boosterToGo to current booster
const grabCurrentBooster        = (player: Player): Player =>
    R.assoc("currentBooster", R.head(R.prop("boostersToGo", player)), player);

// deletes first boosterToGo
const deleteFirstBoosterToGo    = (player: Player): Player =>
    R.assoc("boostersToGo", R.tail(R.prop("boostersToGo", player)), player);

// We are getting the player booster and current DB room data in.
const handlePick = (player: Player): Player =>
    R.pipe(
        pushCurrentBoosterToPicks,
        removePickedCard,
    )(player);

export const handleReq = (humanBooster: Card[], draft: Room): Room => {
    return R.assoc("players",
        R.pipe(
            R.map(handleAIPick),
            R.map(replaceHumanWithPicked(humanBooster)),
            R.map(handlePick),
            passAllBoosters,
            R.map(deleteCurrentBooster),
            R.map(grabCurrentBooster),
            R.map(deleteFirstBoosterToGo)
        )(R.prop("players", draft)), draft);
};
