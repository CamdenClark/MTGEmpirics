import { map, random } from 'lodash'
import * as R from 'ramda'

export interface Card {
    name: string
    colors: string[]
    cmc?: number
    imageUrl: string
    pick?: boolean
}

export function filterPicked(booster: Card[]): Card[] {
    return R.filter(
        (card) => R.prop('pick', card) == 0,
        booster
    )
}

export function pickRandom(booster: Card[]): Card[] {
    return R.adjust(R.assoc('pick', true), random(0, booster.length - 1), booster)
}