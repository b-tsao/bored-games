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
    gravekeeper,
    crow,
    // wolves
    werewolf,
    whitewolf,
    beautywolf,
    alphawolf,
    hiddenwolf,
    gargoyle,
    // neutral
    bandit,
    cupid,
    wild,
    terrorist,
    hybrid,
    sheriff
}

export function toRole(role: string) {
    switch (role) {
        // town
        case card.prophet.id:
            return Role.prophet;
        case card.witch.id:
            return Role.witch;
        case card.hunter.id:
            return Role.hunter;
        case card.guard.id:
            return Role.guard;
        case card.idiot.id:
            return Role.idiot;
        case card.mute.id:
            return Role.mute;
        case card.gangster.id:
            return Role.gangster;
        case card.knight.id:
            return Role.knight;
        case card.tamer.id:
            return Role.tamer;
        case card.gravekeeper.id:
            return Role.gravekeeper;
        case card.crow.id:
            return Role.crow;
        // wolves
        case card.werewolf.id:
            return Role.werewolf;
        case card.whitewolf.id:
            return Role.whitewolf;
        case card.beautywolf.id:
            return Role.beautywolf;
        case card.alphawolf.id:
            return Role.alphawolf;
        case card.hiddenwolf.id:
            return Role.hiddenwolf;
        case card.gargoyle.id:
            return Role.gargoyle;
        // neutral
        case card.bandit.id:
            return Role.bandit;
        case card.cupid.id:
            return Role.cupid;
        case card.wild.id:
            return Role.wild;
        case card.terrorist.id:
            return Role.terrorist;
        case card.hybrid.id:
            return Role.hybrid;
        case card.sheriff.id:
            return Role.sheriff;
        default:
            return Role.citizen;
    }
}

export function roleToString(role: Role) {
    switch (role) {
        // town
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
        case Role.gravekeeper:
            return '守墓人';
        case Role.crow:
            return '乌鸦';
        // wolves
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
        case Role.gargoyle:
            return '石像鬼';
        // neutral
        case Role.bandit:
            return '盗贼';
        case Role.cupid:
            return '丘比特';
        case Role.wild:
            return '野孩子';
        case Role.terrorist:
            return '炸弹人';
        case Role.hybrid:
            return '混血儿';
        case Role.sheriff:
            return '警长';
        default:
            return '民';
    }
}

export function roleToCard(role: Role) {
    switch (role) {
        // town
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
        case Role.gravekeeper:
            return card.gravekeeper;
        case Role.crow:
            return card.crow;
        // wolves
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
        case Role.gargoyle:
            return card.gargoyle;
        // neutral
        case Role.bandit:
            return card.bandit;
        case Role.cupid:
            return card.cupid;
        case Role.wild:
            return card.wild;
        case Role.terrorist:
            return card.terrorist;
        case Role.hybrid:
            return card.hybrid;
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