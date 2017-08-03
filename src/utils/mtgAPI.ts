import { map, pick } from "lodash";
import * as request from "request-promise-native";

import { Card } from "../utils/booster";

export let boosterJSON = async (setName: string): Promise<Card[]> => {
    try {
        const rawBooster =
            await request({uri: "https://api.magicthegathering.io/v1/sets/" + setName + "/booster", json: true});
        return map(rawBooster.cards, (item) => pick(item, ["cmc", "colors", "imageUrl", "name"]) as Card);
    } catch (error) {
        return Promise.reject(error);
    }
};