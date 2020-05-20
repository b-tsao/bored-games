'use strict';

const log4js = require('log4js');
const fetch = require('node-fetch');
const deepExtend = require('deep-extend');
const { changeListener, asyncChangeListener } = require('./lib/ImmerPlugin');

const logger = log4js.getLogger('BGIO');

// API https://boardgame.io/documentation/#/api/Lobby
const SERVER_URL = "http://localhost:8000";

module.exports = class BGIOWrapper {
    constructor(id, name, settings) {
        this.id = id;
        this.name = name;
        this.settings = settings;
        this.state = {};
    }

    get ctx() {
        return {
            id: this.id,
            name: this.name,
            settings: this.settings,
            ...this.context
        };
    }

    serialize() {
        // Dummy the modification of state (due to playerView)
        return changeListener(this.state, state => { });
    }

    createGame() {
        return fetch(SERVER_URL + `/games/${this.id}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.settings)
        })
            .then(res => res.json()) // expecting a json response
            .then(json => json.gameID);
    }

    getGame() {
        return fetch(SERVER_URL + `/games/${this.id}/${this.context.gameID}`)
            .then(res => res.json());
    }

    joinGame(body) {
        return fetch(SERVER_URL + `/games/${this.id}/${this.context.gameID}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json()) // expecting a json response
            .then(json => json.playerCredentials);
    }

    async start(ctx, callback = () => { }) {
        const gameID = await this.createGame();
        this.context = { inProgress: true, gameID };

        const [nextCtx, ctxChanges] = changeListener(ctx, draft => {
            deepExtend(draft, this.context);
        });

        // Use the state to store player information for bgio
        const [nextState, stateChanges] = await asyncChangeListener(this.state, async state => {
            state.players = {};
            // Do a round robin to assign game ID to all players starting from host.
            let playerID = -1;
            const numPlayers = Object.keys(ctx.players).length;
            while (playerID < numPlayers) {
                for (const id in ctx.players) {
                    const player = ctx.players[id];
                    if (player.host) {
                        if (playerID < 0) {
                            playerID = 0;
                        } else {
                            break;
                        }
                    }
                    if (playerID >= 0) {
                        const playerCredentials = await this.joinGame({ playerID, playerName: player.name });
                        state.players[id] = {
                            id: playerID.toString(),
                            name: player.name,
                            credentials: playerCredentials
                        }
                        playerID++;
                    }
                }
            }
        });
        const prevState = this.state;
        this.state = nextState;

        logger.info(`Room (${ctx.key}) created a game (${gameID})`);
        logger.debug(await this.getGame());

        return callback(null, ctxChanges, stateChanges, prevState);
    }
}