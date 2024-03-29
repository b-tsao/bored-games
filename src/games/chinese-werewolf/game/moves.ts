import { INVALID_MOVE } from 'boardgame.io/core';

const FORFEIT_VOTE = '-';

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
    return '喵起来啦！';
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

function clearVotesFor(G, ctx, pid) {
    for (const ppid in G.players) {
        if (G.players[ppid].vote === pid) {
            G.players[ppid].vote = '';
        }
    }
}

export function setRole(G, ctx, pid, pos, role) {
    G.players[pid].roles[pos] = role;
}

export function setDiscard(G, ctx, pos, role) {
    G.discards[pos] = role;
}

export function start(G, ctx) {
    ctx.events.endPhase();
    systemLog(G, ctx, '游戏开始！');
    systemLog(G, ctx, '请等待上帝的指示。');
    // systemLog(G, ctx, `进入夜晚 ${ctx.turn}`);

    // unlock chats
    Object.keys(G.chats).forEach((cid) => G.chats[cid].disabled = false);
    meowLog(G, ctx, `喵晚 ${ctx.turn}～`);
}

export function next(G, ctx) {
    if (G.state === 0) { // night
        G.state = 1; // day

        // lock chats
        Object.keys(G.chats).forEach((cid) => G.chats[cid].disabled = true);

        // clear votes
        for (const pid in G.players) {
            const player = G.players[pid];
            player.vote = '';
        }

        // systemLog(G, ctx, `进入白天 ${ctx.turn - 1}`);

        if (!G.badge && ctx.turn > 2) {
            const minutes = (new Date()).getMinutes();
            const players = Object.keys(G.players).length - 1;
            gameLog(G, ctx, `${minutes} % ${players} = ${minutes % players}`);
        }
    } else {
        ctx.events.endTurn();

        // unlock chats
        Object.keys(G.chats).forEach((cid) => G.chats[cid].disabled = false);
        meowLog(G, ctx, `喵晚 ${ctx.turn}～`);

        // systemLog(G, ctx, `进入夜晚 ${ctx.turn}`);
    }
}

export function transfer(G, ctx, pid) {
    const gid = G.god;
    // remove old god from all chats
    for (const cid in G.chats) {
        if (cid !== '记录') {
            const idx = G.chats[cid].participants.indexOf(gid);
            if (idx >= 0) {
                G.chats[cid].participants.splice(idx, 1);
            }
        }
    }

    G.players[pid].vote = '';
    G.players[pid].alive = false;
    G.god = pid;
    // Clear out all votes for the new god
    clearVotesFor(G, ctx, pid);
    ctx.events.setActivePlayers({ all: 'player', value: { [pid]: 'god' } });
    
    for (const cid in G.chats) {
        if (cid !== '记录' && G.chats[cid].participants.indexOf(pid) < 0) {
            G.chats[cid].participants.push(pid);
        }
    }

    systemLog(G, ctx, `${gid}号玩家移交上帝${pid}号玩家。`);
}

export function kill(G, ctx, pid) {
    const player = G.players[pid];
    player.vote = '';
    player.alive = !player.alive;
    if (player.alive) {
        gameLog(G, ctx, `${pid}号玩家复活。`);
    } else {
        // Clear out all votes for the killed player
        clearVotesFor(G, ctx, pid);
        gameLog(G, ctx, `${pid}号玩家死亡。`);
    }
}

export function badge(G, ctx, pid) {
    if (G.badge === pid) {
        G.badge = null;
        gameLog(G, ctx, `${pid}号玩家撕掉警徽。`);
        const minutes = (new Date()).getMinutes();
        const players = Object.keys(G.players).length - 1;
        gameLog(G, ctx, `${minutes} % ${players} = ${minutes % players}`);
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

export function lover(G, ctx, pid) {
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

export function pk(G, ctx, pkers) {
    for (const pid in G.players) {
        G.players[pid].vote = '';
    }
    if (G.pk) {
        systemLog(G, ctx, '上帝終止PK！');
        G.pk = null;
    } else if (pkers.length > 1) {
        G.pk = pkers;
        gameLog(G, ctx, `PK: ${pkers.join(',')}号玩家`);
    } else {
        return INVALID_MOVE;
    }
}

export function reveal(G, ctx) {
    if (G.election && G.election.length === 0) {
        // reveal those running for election
        const voters: string[] = [];
        for (const pid in G.players) {
            if (G.players[pid].vote === pid) {
                G.election.push({ id: pid, drop: false });
            } else if (G.players[pid].alive) {
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
            } else if (voters.length === 0) {
                gameLog(G, ctx, `所有玩家上警，警徽流失！`);
                gameLog(G, ctx, '上警结束。');
                G.election = null;
            } else {
                gameLog(G, ctx, `请退水的玩家点选退水。`);
                
                const minutes = (new Date()).getMinutes();
                const players = Object.keys(G.players).length - 1;
                gameLog(G, ctx, `${minutes} % ${players} = ${minutes % players}`);
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
                if (
                    G.players[pid].alive
                    && (!G.election || G.election.filter((player) => pid === player.id).length === 0)
                    && (!G.pk || G.pk.filter((player) => pid === player).length === 0)
                ) {
                    // if no election or player is not running for election or player is not part of pk
                    const vid = G.players[pid].vote;
                    if (vid !== '' && vid !== FORFEIT_VOTE) {
                        if (votes[vid]) {
                            votes[vid].push(pid);
                        } else {
                            votes[vid] = [pid];
                        }
                    } else {
                        forfeits.push(pid);
                    }
                }
                G.players[pid].vote = '';
            }
    
            if (G.election) {
                gameLog(G, ctx, `警上投票结果:`);
            } else if (G.pk) {
                gameLog(G, ctx, `PK投票结果:`);
            } else {
                gameLog(G, ctx, `投票结果:`);
            }
            for (const vid in votes) {
                gameLog(G, ctx, `${vid}: ${votes[vid].join(',')} (${votes[vid].length}票)`);
            }
            if (forfeits.length > 0) {
                gameLog(G, ctx, `弃票: ${forfeits.join(',')} (${forfeits.length}票)`);
            }

            const max = Object.keys(votes).reduce((max, vid) => Math.max(max, votes[vid].length), 0);
            const idx = Object.keys(votes).filter((vid) => votes[vid].length === max);

            if (idx.length === 1) {
                const pid = idx[0];
                gameLog(G, ctx, `众票: ${pid}号玩家 (${max}票)`);
            } else if (idx.length > 0) {
                gameLog(G, ctx, `平票: ${idx.join(',')}号玩家 (${max}票)`);
            }

            if (G.election) {
                gameLog(G, ctx, '上警结束。');
                G.election = null;
            }
            if (G.pk) {
                gameLog(G, ctx, 'PK结束。');
                G.pk = null;
            }
        }
    }
}

export function vote(G, ctx, pid) {
    const player = G.players[ctx.playerID];
    if (
        !player.alive
        || (pid !== FORFEIT_VOTE && !G.players[pid].alive)
        || G.state !== 1
    ) {
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
                            clearVotesFor(G, ctx, player.id);
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
            if (!voteRunning && pid !== FORFEIT_VOTE) {
                return INVALID_MOVE;
            }
        }
    } else if (G.pk) {
        let votePker = false;
        for (const pker of G.pk) {
            if (ctx.playerID === pker) {
                // pker trying to vote
                return INVALID_MOVE;
            } else {
                if (pker === pid) {
                    votePker = true;
                }
            }
        }
        if (!votePker && pid !== FORFEIT_VOTE) {
            return INVALID_MOVE;
        }
    }
    if (player.vote === pid) {
        player.vote = '';
    } else {
        player.vote = pid;
    }
}

export function modifyChat(G, ctx, title, players) {
    let disabled = ctx.phase === 'setup' || G.state === 1;
    let free = !G.selectionTermsOnly;
    let chat = [{ name: '喵', message: '这是喵管理的喵天室，不过喵白天睡喵觉所以喵晚上才开喵～', userID: '00' }];
    if (Object.prototype.hasOwnProperty.call(G.chats, title)) {
        // if this chat room exists, it's an edit and we should use existing values
        disabled = G.chats[title].disabled;
        chat = G.chats[title].chat;
        free = G.chats[title].free;
    }
    G.chats[title] = {
        participants: players,
        disabled,
        free,
        chat
    };

    players.forEach((pid) => G.players[pid].chats[title] = G.players[pid].chats[title] || 0);
}

export function deleteChat(G, ctx, cid) {
    G.chats[cid].participants.forEach((pid) => delete G.players[pid].chats[cid]);
    delete G.chats[cid];
}

export function lockChat(G, ctx, cid) {
    G.chats[cid].disabled = !G.chats[cid].disabled;
}

export function freeChat(G, ctx, cid) {
    G.chats[cid].free = !G.chats[cid].free;
}

export function chat(G, ctx, cid, message) {
    if (G.chats[cid].participants.indexOf(ctx.playerID) < 0) {
        return INVALID_MOVE;
    } else if (message.length === 0) {
        return;
    }

    const name = `${ctx.playerID}号玩家`;
    const userID = ctx.playerID;

    G.chats[cid].chat.push({ name, message, userID });
    G.chats[cid].participants.forEach((pid) => G.players[pid].chats[cid]++);
}

export function read(G, ctx, cid) {
    G.players[ctx.playerID].chats[cid] = 0;
}
