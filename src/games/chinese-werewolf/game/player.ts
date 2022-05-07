import card from './cards';

export function roleToString(rid: string) {
    return card[rid].label;
}

export function roleToImg(rid: string) {
    return card[rid].img;
}

export default class Player {
    roles: string[];
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
        this.roles.push(role);
    }
}