import Cards from './cards';

export function roleToString(rid: string) {
    return Cards[rid].label;
}

export function roleToImg(rid: string) {
    return Cards[rid].img;
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