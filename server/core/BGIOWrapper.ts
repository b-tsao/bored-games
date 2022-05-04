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
    title: string;
    settings: any;
    state: any;
    context: object;

    constructor(props: any, settings: any) {
        this.id = props.id;
        this.title = props.title;
        this.settings = {
            numPlayers: 4,
            ...settings
        };
        this.state = {};
        this.context = { inProgress: false };
    }

    get ctx() {
        return {
            id: this.id,
            title: this.title,
            settings: this.settings,
            ...this.context
        };
    }

    serialize() {
        // Dummy the modification of state (due to playerView)
        return changeListener(this.state, state => undefined);
    }

    async createGame(body) {
        return fetch(`http://localhost:${process.env.REACT_APP_BGIO_PORT}/games/${this.id}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json()) // expecting a json response
            .then(json => json.gameID);

        // return new Promise((resolve) => {
        //     const payload = JSON.stringify(body);
        //     const options = {
        //         hostname: 'localhost',
        //         port: process.env.REACT_APP_BGIO_PORT,
        //         path: `/games/${this.id}/create`,
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     };
            
        //     let data = '';
        //     https.request(options, (res) => {
        //         res.on('data', (chunk) => { data += chunk });
        //         res.on('end', () => {
        //            resolve(data);
        //         });
        //     }) 
        // });
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

    async leaveGame(gameID: string, body: object) {
        await fetch(`http://localhost:${process.env.REACT_APP_BGIO_PORT}/games/${this.id}/${gameID}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
    }

    async getGame(gameID: string) {
        const res = await fetch(`http://localhost:${process.env.REACT_APP_BGIO_PORT}/games/${this.id}/${gameID}`);
        if (res.status === 200) {
            return await res.json();
        } else {
            throw new Error(res.statusText);
        }
    }

    async start(ctx: { key: string, players: People }, callback: AnyFunction) {
        const numPlayers = Object.keys(ctx.players).length;
        const gameID = await this.createGame({ ...this.settings, numPlayers });
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

    async end(ctx, callback: AnyFunction) {
        this.context = { inProgress: false };
        const [nextCtx, ctxChanges]: any = changeListener(ctx, draft => {
            deepExtend(draft, this.context);
        });

        const [nextState, stateChanges]: any = await asyncChangeListener(this.state, async state => {
            for (const id in state.players) {
                const player = state.players[id];
                await this.leaveGame(state.gameID, { playerID: player.id, credentials: player.credentials });
            }
            for (const key in state) {
                delete state[key];
            }
        });
        const prevState = this.state;
        this.state = nextState;

        logger.info(`Room (${ctx.key}) ending a game (${prevState.gameID})`);

        return callback(null, ctxChanges, stateChanges, prevState);
    }

    changeSettings(settings, callback: AnyFunction) {
        const ctx = {
            settings: this.settings
        };
        if (settings.numPlayers) {
            const numPlayers = settings.numPlayers;
            delete settings.numPlayers;
            settings = {
                numPlayers,
                setupData: settings
            };
        } else {
            settings = {
                setupData: settings
            };
        }
        const [nextCtx, changes] = changeListener(ctx, (draft) => {
            deepExtend(draft.settings, settings);
        });
        this.settings = nextCtx.settings;
        callback(null, changes);
    }
}