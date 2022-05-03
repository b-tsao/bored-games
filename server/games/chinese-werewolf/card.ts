// town

import { localize, text } from "../language"

const label = localize(text.games.chineseWerewolf, 'cn/simplified');

export const prophet = {
    id: 'prophet',
    label: label.cards.town.prophet
}

export const witch = {
    id: 'witch',
    label: label.cards.town.witch
}

export const bodyguard = {
    id: 'bodyguard',
    label: label.cards.town.bodyguard
}

export const civilian = {
    id: 'civilian',
    label: label.cards.town.civilian
}

export const hunter = {
    id: 'hunter',
    label: label.cards.town.hunter
}

// wolves

export const werewolf = {
    id: 'werewolf',
    label: label.cards.wolves.werewolf
}