import { INVALID_MOVE } from 'boardgame.io/core';
import { Role } from './player';

function systemLog(G, ctx, message) {
    const name = '系统';
    const userID = '0';
    G.log.push({ name, message, userID });
}

function gameLog(G, ctx, message) {
    const name = `${G.state === 0 ? '夜晚' : '白天'} ${Number(ctx.turn) - 1}`;
    const userID = `${ctx.turn}${G.state}`;
    G.log.push({ name, message, userID });
}

export function setRole(G, ctx, pid: number, pos: number, role: Role) {
    G.players[pid].roles[pos] = role;
}

export function setDiscard(G, ctx, pos: number, role: Role) {
    G.discards[pos] = role;
}

export function start(G, ctx) {
    ctx.events.endPhase();
    systemLog(G, ctx, '游戏开始！');
    systemLog(G, ctx, '请等待上帝的指示。');
    systemLog(G, ctx, `进入夜晚 ${Number(ctx.turn)}`);
}

export function next(G, ctx) {
    if (G.state === 0) { // night
        G.state = 1; // day
        ctx.events.setActivePlayers({ all: 'vote', value: { [String(G.god)]: 'god' } });
        systemLog(G, ctx, `进入白天 ${Number(ctx.turn - 1)}`);

        if (!G.election) {
            gameLog(G, ctx, '请上警的玩家投自己一票。');
        }
    } else {
        ctx.events.endTurn();
        systemLog(G, ctx, `进入夜晚 ${Number(ctx.turn)}`);
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
    if (player.alive) {
        gameLog(G, ctx, `${pid}号玩家复活。`);
    } else {
        gameLog(G, ctx, `${pid}号玩家死亡。`);
    }
}

export function badge(G, ctx, pid) {
    if (G.badge === pid) {
        G.badge = null;
        gameLog(G, ctx, `${pid}号玩家撕掉警徽。`);
    } else if (!G.players[pid].alive) {
        return INVALID_MOVE;
    } else {
        if (G.badge === null) {
            gameLog(G, ctx, `${pid}号玩家当选警长！`);
        } else {
            gameLog(G, ctx, `${G.badge}号玩家移交警徽给${pid}号玩家。`);
        }
        G.badge = pid;
    }
}

export function lover(G, ctx, pid: number) {
    G.players[pid].lover = !G.players[pid].lover;
}

export function reveal(G, ctx) {
    if (!G.election) {
        const electors: string[] = [];
        for (const pid in G.players) {
            if (G.players[pid].vote === pid) {
                electors.push(pid);
            }
            G.players[pid].vote = '';
        }
        gameLog(G, ctx, `上警的玩家: ${electors.join(',')}`);
        G.election = true;
    } else {
        if (G.reveal) {
            G.reveal = false;
            ctx.events.setActivePlayers({ all: 'vote', value: { [String(G.god)]: 'god' } });
        } else if (G.state === 1) {
            G.reveal = true;
            ctx.events.setActivePlayers({ value: { [String(G.god)]: 'god' } });
    
            const votes = {};
            const forfeits: string[] = [];
            for (const pid in G.players) {
                const vid = G.players[pid].vote;
                if (vid) {
                    if (votes[vid]) {
                        votes[vid].push(pid);
                    } else {
                        votes[vid] = [pid];
                    }
                } else {
                    forfeits.push(pid);
                }
            }
    
            gameLog(G, ctx, `投票结果:`);
            for (const vid in votes) {
                gameLog(G, ctx, `${vid}: ${votes[vid].join(',')}`);
            }
            gameLog(G, ctx, `弃票: ${forfeits.join(',')}`);
        }
    }
}

export function vote(G, ctx, pid) {
    const player = G.players[ctx.playerID];
    if (!player.alive) {
        return INVALID_MOVE;
    }
    player.vote = pid;
}