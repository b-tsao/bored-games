import { INVALID_MOVE } from 'boardgame.io/core';
import { Role } from './player';

export function setRole(G, ctx, pid: number, pos: number, role: Role) {
    G.players[pid].roles[pos] = role;
}

export function setDiscard(G, ctx, pos: number, role: Role) {
    G.discards[pos] = role;
}

export function start(G, ctx) {
    ctx.events.endPhase();
}

export function next(G, ctx) {
    if (G.state === 0) { // night
        G.state = 1; // day
        ctx.events.setActivePlayers({ all: 'vote', value: { [String(G.god)]: 'god' } });
    } else {
        ctx.events.endTurn();
    }
}

export function transfer(G, ctx, pid: number) {
    G.god = Number(pid);
    ctx.events.setActivePlayers({ value: { [pid]: 'god' } });
}

export function kill(G, ctx, pid) {
    const player = G.players[pid];
    player.vote = '';
    player.alive = !player.alive;
}

export function badge(G, ctx, pid) {
    if (G.badge === pid) {
        G.badge = null;
    } else {
        G.badge = pid;
    }
}

export function lover(G, ctx, pid: number) {
    G.players[pid].lover = !G.players[pid].lover;
}

export function reveal(G, ctx) {
    if (G.reveal) {
        G.reveal = false;
        ctx.events.setActivePlayers({ all: 'vote', value: { [String(G.god)]: 'god' } });
    } else if (G.state === 1) {
        G.reveal = true;
        ctx.events.setActivePlayers({ value: { [String(G.god)]: 'god' } });
    }
}

export function vote(G, ctx, pid) {
    const player = G.players[ctx.playerID];
    if (!player.alive) {
        return INVALID_MOVE;
    }
    player.vote = pid;
}