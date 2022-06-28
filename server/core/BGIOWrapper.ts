import log4js from 'log4js';
import { LobbyClient } from 'boardgame.io/client';
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
    client: LobbyClient;

    constructor(props: any, settings: any) {
        this.id = props.id;
        this.title = props.title;
        this.settings = {
            numPlayers: 4,
            ...settings
        };
        this.state = {};
        this.context = { inProgress: false };
        this.client = new LobbyClient({ server: `http://localhost:${process.env.REACT_APP_BGIO_PORT}` });
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

    async getGame(matchID: string) {
        return await this.client.getMatch(this.id, matchID);
    }

    async createGame(body) {
        const { matchID } = await this.client.createMatch(this.id, body);
        return matchID;
    }

    async joinGame(matchID: string, body: any) {
        const { playerCredentials } = await this.client.joinMatch(this.id, matchID, body);
        return playerCredentials;
    }

    async leaveGame(matchID: string, body: any) {
        await this.client.leaveMatch(this.id, matchID, body);
    }

    async start(ctx: { key: string, players: People }, callback: AnyFunction) {
        const numPlayers = Object.keys(ctx.players).length;
        const matchID = await this.createGame({ ...this.settings, numPlayers });
        this.context = { inProgress: true };

        const [nextCtx, ctxChanges]: any = changeListener(ctx, draft => {
            deepExtend(draft, this.context);
        });

        // Use the state to store player information for bgio
        const [nextState, stateChanges] = await asyncChangeListener(this.state, async state => {
            state.matchID = matchID;
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
                        const playerCredentials = await this.joinGame(matchID, { playerID: String(playerID), playerName: player.name });
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

        logger.info(`Room (${ctx.key}) created a game (${matchID})`);
        logger.debug(await this.getGame(matchID));

        return callback(null, ctxChanges, stateChanges, prevState);
    }

    async end(ctx, callback: AnyFunction) {
        this.context = { inProgress: false };
        const [nextCtx, ctxChanges]: any = changeListener(ctx, draft => {
            deepExtend(draft, this.context);
        });

        const [nextState, stateChanges]: any = await asyncChangeListener(this.state, async state => {
            const leavePromises: any[] = [];
            for (const id in state.players) {
                const player = state.players[id];
                leavePromises.push(this.leaveGame(state.matchID, { playerID: player.id, credentials: player.credentials }));
            }
            await Promise.all(leavePromises);
            for (const key in state) {
                delete state[key];
            }
        });
        const prevState = this.state;
        this.state = nextState;

        logger.info(`Room (${ctx.key}) ending a game (${prevState.matchID})`);

        return callback(null, ctxChanges, stateChanges, prevState);
    }

    changeSettings(settings, callback: AnyFunction) {
        const ctx = {
            settings: this.settings
        };
        settings = {
            setupData: settings
        };
        const [nextCtx, changes] = changeListener(ctx, (draft) => {
            deepExtend(draft.settings, settings);
        });
        this.settings = nextCtx.settings;
        callback(null, changes);
    }
}