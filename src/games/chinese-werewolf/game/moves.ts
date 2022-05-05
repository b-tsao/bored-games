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
        const stages = {};
        for (const pid in G.players) {
            const player = G.players[pid];
            if (player.alive) {
                stages[pid] = 'vote';
            }
        }
        stages[String(G.god)] = 'god';
        ctx.events.setActivePlayers({ value: stages });
    } else {
        ctx.events.endTurn();
    }
}

export function transfer(G, ctx, pid: number) {
    G.god = Number(pid);
    G.players[pid].alive = true;
    ctx.events.setActivePlayers({ value: { [pid]: 'god' } });
}

export function kill(G, ctx, pid) {
    G.players[pid].alive = !G.players[pid].alive;
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
        const stages = {};
        for (const pid in G.players) {
            const player = G.players[pid];
            if (player.alive) {
                stages[pid] = 'vote';
            }
        }
        stages[String(G.god)] = 'god';
        ctx.events.setActivePlayers({ value: stages });
    } else if (G.state === 1) {
        G.reveal = true;
        ctx.events.setActivePlayers({ value: { [String(G.god)]: 'god' } });
    }
}

export function vote(G, ctx, pid) {
    G.players[ctx.playerID].vote = pid;
}