import { INVALID_MOVE, Stage } from 'boardgame.io/core';

function systemLog(G, ctx, message) {
    const name = '系统';
    const userID = '0';
    G.chat.push({ name, message, userID });
}

function gameLog(G, ctx, message) {
    const name = `${G.state === 0 ? '夜晚' : '白天'} ${Number(ctx.turn) - 1}`;
    const userID = `${ctx.turn}${G.state}`;
    G.chat.push({ name, message, userID });
}

function eliminate(G, ctx) {
    ctx.events.setActivePlayers({});

    const votes = {};
    for (const pid in G.players) {
        const vid = G.players[pid].vote;
        if (vid !== '') {
            if (votes[vid]) {
                votes[vid].push(pid);
            } else {
                votes[vid] = [pid];
            }
        }
        G.players[pid].vote = '';
    }

    const max = Object.keys(votes).reduce((max, vid) => Math.max(max, votes[vid].length), 0);
    const idx = Object.keys(votes).filter((vid) => votes[vid].length === max);

    gameLog(G, ctx, `投票结果:`);
    for (const vid in votes) {
        gameLog(G, ctx, `${vid}: ${votes[vid].join(',')}`);
    }

    if (idx.length === 1) {
        G.pk = null;
        const pid = idx[0];
        gameLog(G, ctx, `出局: ${pid}号玩家 (${max}票)`);
        reveal(G, ctx, pid);
    } else {
        gameLog(G, ctx, `平票 PK: ${idx.join(',')}号玩家 (${max}票)`);
        G.pk = idx;
        ctx.events.setPhase('day');
    }
}

export function setSecret(G, ctx, secret) {
    G.players[ctx.playerID].secret = secret;
}

export function wolf(G, ctx) {
    G.wolf = ctx.random.Die(ctx.numPlayers) - 1;
    systemLog(G, ctx, `狼人 XP: ${G.players[G.wolf].secret}`);
}

export function vote(G, ctx, pid) {
    if (!ctx.playerID) {
        return INVALID_MOVE;
    }
    if (G.pk && G.pk.indexOf(pid) < 0) {
        return INVALID_MOVE;
    }
    const player = G.players[ctx.playerID];
    if (!player.alive) {
        return INVALID_MOVE;
    }
    if (player.vote === pid) {
        player.vote = '';
    } else {
        player.vote = pid;
    }

    if (Object.keys(G.players).filter((pid) => G.players[pid].vote !== '').length === Object.keys(G.players).filter((pid) => G.players[pid].alive).length) {
        eliminate(G, ctx);
    }
}

export function reveal(G, ctx, pid) {
    if (!G.players[pid]?.alive) {
        return INVALID_MOVE;
    }
    gameLog(G, ctx, `${pid}号玩家死亡。`);
    gameLog(G, ctx, `公布 XP: ${G.players[pid].secret}`);
    G.players[pid].alive = false;
    if (pid === String(G.wolf)) {
        gameLog(G, ctx, '游戏结束，好人胜利！');
        ctx.events.endGame();
    } else if (Object.keys(G.players).filter((pid) => G.players[pid].alive).length <= 2) {
        gameLog(G, ctx, '游戏结束，狼人胜利！');
        ctx.events.endGame();
    } else {
        ctx.events.endPhase();
    }
}