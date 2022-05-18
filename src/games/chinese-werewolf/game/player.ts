export default class Player {
    roles: string[];
    alive: boolean;
    lover: boolean;
    vote: string;
    chats: { [key: string]: number };

    constructor() {
        this.roles = [];
        this.alive = true;
        this.lover = false;
        this.vote = '';
        this.chats = {};
    }

    addRole(role) {
        this.roles.push(role);
    }
}