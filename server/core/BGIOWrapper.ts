import log4js from 'log4js';
import fetch from 'node-fetch';
import deepExtend from 'deep-extend';
import { changeListener, asyncChangeListener } from './lib/ImmerPlugin';
import { People, AnyFunction } from './types';

const logger = log4js.getLogger('BGIO');

// import/require is meant for loading modules;
// the recommended way to load files (including JSON) is through Node filesystem module
// const constants = JSON.parse(fs.readFileSync('server.config.json', 'utf-8'));

// API https://boardgame.io/documentation/#/api/Lobby

export default class BGIOWrapper {
    id: string;
    name: string;
    settings: object;
    state: object;
    context: object | null;

    constructor(id: string, name: string, settings: object) {
        this.id = id;
        this.name = name;
        this.settings = settings;
        this.state = {};
        this.context = null;
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
        return changeListener(this.state, state => undefined);
    }

    async createGame() {
        return fetch(`http://localhost:${process.env.REACT_APP_BGIO_PORT}/games/${this.id}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.settings)
        })
            .then(res => res.json()) // expecting a json response
            .then(json => json.gameID);
    }

    async joinGame(gameID: string, body: object) {
        return fetch(`http://localhost:${process.env.REACT_APP_BGIO_PORT}/games/${this.id}/${gameID}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json()) // expecting a json response
            .then(json => json.playerCredentials);
    }

    async getGame(gameID: string) {
        const res = await fetch(`http://localhost:${process.env.REACT_APP_BGIO_PORT}/games/${this.id}/${gameID}`);
        return await res.json();
    }

    async start(ctx: { key: string, players: People }, callback: AnyFunction) {
        const gameID = await this.createGame();
        this.context = { inProgress: true };

        const [nextCtx, ctxChanges]: any = changeListener(ctx, draft => {
            deepExtend(draft, this.context);
        });

        // Use the state to store player information for bgio
        const [nextState, stateChanges] = await asyncChangeListener(this.state, async state => {
            state.gameID = gameID;
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
                        const playerCredentials = await this.joinGame(gameID, { playerID, playerName: player.name });
                        state.players[id] = {
                            id: playerID.toString(),
                            name: player.name,
                            credentials: playerCredentials
                        };
                        playerID++;
                    }
                }
            }
        });
        const prevState = this.state;
        this.state = nextState;

        logger.info(`Room (${ctx.key}) created a game (${gameID})`);
        logger.debug(await this.getGame(gameID));

        return callback(null, ctxChanges, stateChanges, prevState);
    }

    changeSettings(settings, callback: AnyFunction) {
        return;
    }
}