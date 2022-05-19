export default class Player {
    secret: string;
    alive: boolean;
    vote: string;
    know: string[];

    constructor() {
        this.secret = '';
        this.alive = true;
        this.vote = '';
        this.know = [];
    }
}