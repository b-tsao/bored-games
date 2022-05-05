export enum Role {
    werewolf,
    prophet,
    witch,
    hunter,
    bodyguard,
    citizen
}

export function toRole(role: string) {
    switch (role) {
        case 'werewolf':
            return Role.werewolf;
        case 'prophet':
            return Role.prophet;
        case 'witch':
            return Role.witch;
        case 'hunter':
            return Role.hunter;
        case 'bodyguard':
            return Role.bodyguard;
        default:
            return Role.citizen;
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