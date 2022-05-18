import { INVALID_MOVE } from 'boardgame.io/core';

function systemLog(G, ctx, message) {
    const name = '系统';
    const userID = '00';
    G.chats['记录'].chat.push({ name, message, userID });
}

function gameLog(G, ctx, message) {
    const name = `${G.state === 0 ? '夜晚' : '白天'} ${Number(ctx.turn) - 1}`;
    const userID = `${ctx.turn}${G.state}`;
    G.chats['记录'].chat.push({ name, message, userID });
}

function getRandomMeowMessage(G, ctx, cid) {
    return '喵起来啦!';
}

function meowLog(G, ctx, message) {
    const name = '喵';
    const userID = '00';
    for (const cid in G.chats) {
        if (cid !== '记录') {
            const meow = getRandomMeowMessage(G, ctx, cid);
            G.chats[cid].chat.push({ name, message: `${meow} ${message}`, userID });
        }
    }
}

export function setRole(G, ctx, pid: number, pos: number, role: string) {
    G.players[pid].roles[pos] = role;
}

export function setDiscard(G, ctx, pos: number, role: string) {
    G.discards[pos] = role;
}

export function start(G, ctx) {
    ctx.events.endPhase();
    systemLog(G, ctx, '游戏开始！');
    systemLog(G, ctx, '请等待上帝的指示。');
    systemLog(G, ctx, `进入夜晚 ${Number(ctx.turn)}`);

    // unlock chats
    Object.keys(G.chats).forEach((cid) => G.chats[cid].disabled = false);
    meowLog(G, ctx, `喵晚 ${Number(ctx.turn)}。`);
}

export function next(G, ctx) {
    if (G.state === 0) { // night
        G.state = 1; // day

        // lock chats
        Object.keys(G.chats).forEach((cid) => G.chats[cid].disabled = true);

        systemLog(G, ctx, `进入白天 ${Number(ctx.turn - 1)}`);
    } else {
        ctx.events.endTurn();

        // unlock chats
        Object.keys(G.chats).forEach((cid) => G.chats[cid].disabled = false);
        meowLog(G, ctx, `喵晚 ${Number(ctx.turn)}。`);

        systemLog(G, ctx, `进入夜晚 ${Number(ctx.turn)}`);
    }
}

export function transfer(G, ctx, pid: number) {
    G.players[pid].vote = '';
    G.god = Number(pid);
    ctx.events.setActivePlayers({ all: 'player', value: { [pid]: 'god' } });
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

export function election(G, ctx) {
    for (const pid in G.players) {
        G.players[pid].vote = '';
    }
    if (G.election) {
        systemLog(G, ctx, '上帝終止上警！');
        G.election = null;
    } else {
        G.election = [];
        gameLog(G, ctx, '请上警的玩家点选上警。');
    }
}

export function reveal(G, ctx) {
    if (G.election && G.election.length === 0) {
        const voters: string[] = [];
        for (const pid in G.players) {
            if (G.players[pid].vote === pid) {
                G.election.push({ id: pid, drop: false });
            } else if (pid !== String(G.god)) {
                voters.push(pid);
            }
            G.players[pid].vote = '';
        }
        if (G.election.length > 0) {
            gameLog(G, ctx, `上警玩家: ${G.election.map((player) => player.id).join(',')}`);
            gameLog(G, ctx, `警下玩家: ${voters.join(',')}`);
            if (G.election.length === 1) {
                gameLog(G, ctx, `只有${G.election[0].id}号玩家上警！`);
                gameLog(G, ctx, '上警结束。');
                G.election = null;
            } else {
                gameLog(G, ctx, `请退水的玩家点选退水。`);
            }
        } else {
            gameLog(G, ctx, `没玩家上警，警徽流失！`);
            gameLog(G, ctx, '上警结束。');
            G.election = null;
        }
    } else {
        if (G.state === 1) {
            const votes = {};
            const forfeits: string[] = [];
            for (const pid in G.players) {
                if (pid !== String(G.god)) {
                    if (!G.election || G.election.filter((player) => pid === player.id).length === 0) {
                        // if no election or player is running for election
                        const vid = G.players[pid].vote;
                        if (vid !== '' && vid !== pid) {
                            if (votes[vid]) {
                                votes[vid].push(pid);
                            } else {
                                votes[vid] = [pid];
                            }
                        } else if (G.players[pid].alive) {
                            forfeits.push(pid);
                        }
                    }
                }
                G.players[pid].vote = '';
            }
    
            gameLog(G, ctx, `投票结果:`);
            for (const vid in votes) {
                gameLog(G, ctx, `${vid}: ${votes[vid].join(',')}`);
            }
            gameLog(G, ctx, `弃票: ${forfeits.join(',')}`);
            if (G.election) {
                gameLog(G, ctx, '上警结束。');
                G.election = null;
            }
        }
    }
}

export function vote(G, ctx, pid) {
    const player = G.players[ctx.playerID];
    if (!player.alive || pid === String(G.god)) {
        return INVALID_MOVE;
    }
    if (G.election) {
        if (G.election.length === 0) {
            if (ctx.playerID !== pid) {
                return INVALID_MOVE;
            }
        } else {
            let voteRunning = false;
            for (const player of G.election) {
                if (ctx.playerID === player.id) {
                    // player running for election
                    if (ctx.playerID === pid) {
                        // player voted for self
                        if (!player.drop) {
                            player.drop = true;
                            gameLog(G, ctx, `${ctx.playerID}号玩家退水。`);
                            for (const pid in G.players) {
                                if (G.players[pid].vote === player.id) {
                                    G.players[pid].vote = '';
                                }
                            }
                        } else {
                            player.drop = false;
                            gameLog(G, ctx, `${ctx.playerID}号玩家不退水。`);
                        }
                        return;
                    } else {
                        return INVALID_MOVE;
                    }
                } else {
                    if (pid === player.id && !player.drop) {
                        voteRunning = true;
                        // can't break here because a player running might vote
                    }
                }
            }
            if (!voteRunning && pid !== ctx.playerID) {
                return INVALID_MOVE;
            }
        }
    }
    if (player.vote === pid) {
        player.vote = '';
    } else {
        player.vote = pid;
    }
}

export function modifyChat(G, ctx, title, players) {
    // If this is an edit move old chat to new chat
    const chat = Object.prototype.hasOwnProperty.call(G.chats, title) ?
        G.chats[title].chat :
        [{ name: '喵', message: '这是喵管理的聊天室，不过喵白天睡喵觉所以喵晚上才开喵～', userID: '00' }];
    G.chats[title] = {
        participants: players,
        disabled: ctx.phase === 'setup' || G.state === 1,
        chat
    };

    players.forEach((pid) => G.players[pid].chats[title] = 0);
}

export function deleteChat(G, ctx, cid) {
    G.chats[cid].participants.forEach((pid) => delete G.players[pid].chats[cid]);
    delete G.chats[cid];
}

export function chat(G, ctx, cid, message) {
    if (G.chats[cid].participants.indexOf(ctx.playerID) < 0) {
        return INVALID_MOVE;
    } else if (G.state === 1) {
        return INVALID_MOVE;
    } else if (message.length === 0) {
        return;
    }

    const name = ctx.playerID;
    const userID = ctx.playerID;

    G.chats[cid].chat.push({ name, message, userID });
    G.chats[cid].participants.forEach((pid) => G.players[pid].chats[cid]++);
}

export function read(G, ctx, cid) {
    G.players[ctx.playerID].chats[cid] = 0;
}