export default class Player {
    secret: string;
    alive: boolean;
    vote: string;

    constructor() {
        this.secret = '';
        this.alive = true;
        this.vote = '';
    }
}