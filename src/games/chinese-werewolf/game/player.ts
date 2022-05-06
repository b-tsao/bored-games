import * as card from './card';

export enum Role {
    // town
    prophet,
    witch,
    hunter,
    guard,
    citizen,
    idiot,
    mute,
    gangster,
    knight,
    tamer,
    // wolves
    werewolf,
    whitewolf,
    beautywolf,
    alphawolf,
    hiddenwolf,
    // neutral
    bandit,
    cupid,
    wild,
    terrorist,
    sheriff
}

export function toRole(role: string) {
    switch (role) {
        case 'prophet':
            return Role.prophet;
        case 'witch':
            return Role.witch;
        case 'hunter':
            return Role.hunter;
        case 'guard':
            return Role.guard;
        case 'idiot':
            return Role.idiot;
        case 'mute':
            return Role.mute;
        case 'gangster':
            return Role.gangster;
        case 'knight':
            return Role.knight;
        case 'tamer':
            return Role.tamer;
        case 'werewolf':
            return Role.werewolf;
        case 'whitewolf':
            return Role.whitewolf;
        case 'beautywolf':
            return Role.beautywolf;
        case 'alphawolf':
            return Role.alphawolf;
        case 'hiddenwolf':
            return Role.hiddenwolf;
        case 'bandit':
            return Role.bandit;
        case 'cupid':
            return Role.cupid;
        case 'wild':
            return Role.wild;
        case 'terrorist':
            return Role.terrorist;
        case 'sheriff':
            return Role.sheriff;
        default:
            return Role.citizen;
    }
}

export function roleToString(role: Role) {
    switch (role) {
        case Role.prophet:
            return '预言家';
        case Role.witch:
            return '女巫';
        case Role.hunter:
            return '猎人';
        case Role.guard:
            return '守卫';
        case Role.idiot:
            return '白痴';
        case Role.mute:
            return '禁言长老';
        case Role.gangster:
            return '老流氓';
        case Role.knight:
            return '骑士';
        case Role.tamer:
            return '驯熊师';
        case Role.werewolf:
            return '狼人';
        case Role.whitewolf:
            return '白狼王';
        case Role.beautywolf:
            return '狼美人';
        case Role.alphawolf:
            return '狼王';
        case Role.hiddenwolf:
            return '隐狼';
        case Role.bandit:
            return '盗贼';
        case Role.cupid:
            return '丘比特';
        case Role.wild:
            return '野孩子';
        case Role.terrorist:
            return '炸弹人';
        case Role.sheriff:
            return '警长';
        default:
            return '民';
    }
}

export function roleToCard(role: Role) {
    switch (role) {
        case Role.prophet:
            return card.prophet;
        case Role.witch:
            return card.witch;
        case Role.hunter:
            return card.hunter;
        case Role.guard:
            return card.guard;
        case Role.idiot:
            return card.idiot;
        case Role.mute:
            return card.mute;
        case Role.gangster:
            return card.gangster;
        case Role.knight:
            return card.knight;
        case Role.tamer:
            return card.tamer;
        case Role.werewolf:
            return card.werewolf;
        case Role.whitewolf:
            return card.whitewolf;
        case Role.beautywolf:
            return card.beautywolf;
        case Role.alphawolf:
            return card.alphawolf;
        case Role.hiddenwolf:
            return card.hiddenwolf;
        case Role.bandit:
            return card.bandit;
        case Role.cupid:
            return card.cupid;
        case Role.wild:
            return card.wild;
        case Role.terrorist:
            return card.terrorist;
        case Role.sheriff:
            return card.sheriff
        default:
            return card.citizen;
    }
}

export default class Player {
    roles: Role[];
    alive: boolean;
    lover: boolean;
    vote: string;

    constructor() {
        this.roles = [];
        this.alive = true;
        this.lover = false;
        this.vote = '';
    }

    addRole(role) {
        this.roles.push(toRole(role));
    }
}