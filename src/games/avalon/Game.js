'use strict';

const deepExtend = require('deep-extend');

const pieces = {
  boards: [
    {
      id: '5-players',
      label: '5 Players Board',
      minPlayers: 5,
      maxPlayers: 5,
      evils: 2,
      quests: [{team: 2, fails: 1},
               {team: 3, fails: 1},
               {team: 2, fails: 1},
               {team: 3, fails: 1},
               {team: 3, fails: 1}],
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2F5-players.png',
    },
    {
      id: '6-players',
      label: '6 Players Board',
      minPlayers: 6,
      maxPlayers: 6,
      evils: 2,
      quests: [{team: 2, fails: 1},
               {team: 3, fails: 1},
               {team: 4, fails: 1},
               {team: 3, fails: 1},
               {team: 4, fails: 1}],
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2F6-players.png'
    },
    {
      id: '7-players',
      label: '7 Players Board',
      minPlayers: 7,
      maxPlayers: 7,
      evils: 3,
      quests: [{team: 2, fails: 1},
               {team: 3, fails: 1},
               {team: 3, fails: 1},
               {team: 4, fails: 2},
               {team: 4, fails: 1}],
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2F7-players.png'
    },
    {
      id: '8-players',
      label: '8 Players Board',
      minPlayers: 8,
      maxPlayers: 8,
      evils: 3,
      quests: [{team: 3, fails: 1},
               {team: 4, fails: 1},
               {team: 4, fails: 1},
               {team: 5, fails: 2},
               {team: 5, fails: 1}],
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2F8-players.png'
    },
    {
      id: '9-players',
      label: '9 Players Board',
      minPlayers: 9,
      maxPlayers: 9,
      evils: 3,
      quests: [{team: 3, fails: 1},
               {team: 4, fails: 1},
               {team: 4, fails: 1},
               {team: 5, fails: 2},
               {team: 5, fails: 1}],
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2F9-players.png'
    },
    {
      id: '10-players',
      label: '10 Players Board',
      minPlayers: 10,
      maxPlayers: 10,
      evils: 4,
      quests: [{team: 3, fails: 1},
               {team: 4, fails: 1},
               {team: 4, fails: 1},
               {team: 5, fails: 2},
               {team: 5, fails: 1}],
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2F10-players.png'
    }
  ],
  cards: {
    good: [
      {
        id: 'merlin',
        label: 'Merlin',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fmerlin.png'
      },
      {
        id: 'percival',
        label: 'Percival',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fpercival.png'
      },
      {
        id: 'servant-1',
        label: 'Loyal Servant of Arthur',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fservant-1.png'
      },
      {
        id: 'servant-2',
        label: 'Loyal Servant of Arthur',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fservant-2.png'
      },
      {
        id: 'servant-3',
        label: 'Loyal Servant of Arthur',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fservant-3.png'
      },
      {
        id: 'servant-4',
        label: 'Loyal Servant of Arthur',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fservant-4.png'
      },
      {
        id: 'servant-5',
        label: 'Loyal Servant of Arthur',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fservant-5.png'
      }
    ],
    evil: [
      {
        id: 'mordred',
        label: 'Mordred',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fmordred.png'
      },
      {
        id: 'assassin',
        label: 'Assassin',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fassassin.jpg'
      },
      {
        id: 'morgana',
        label: 'Morgana',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fmorgana.png'
      },
      {
        id: 'oberon',
        label: 'Oberon',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Foberon.png'
      },
      {
        id: 'minion-1',
        label: 'Minion of Mordred',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fminion-1.png'
      },
      {
        id: 'minion-2',
        label: 'Minion of Mordred',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fminion-2.png'
      },
      {
        id: 'minion-3',
        label: 'Minion of Mordred',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fminion-3.png'
      }
    ],
    cover: {
      id: 'character-cover',
      label: 'Character Cover',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fchar-cover.png'
    }
  },
  vote: {
    approve: {
      id: 'vote-approve',
      label: 'Approve',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fapprove.png'
    },
    reject: {
      id: 'vote-reject',
      label: 'Reject',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Freject.png'
    },
    cover: {
      id: 'vote-cover',
      label: 'Vote',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fvote.png'
    }
  },
  quest: {
    chosen: {
      id: 'quest-chosen',
      label: 'Chosen',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fchosen.png'
    },
    success: {
      id: 'quest-success',
      label: 'Success',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fsuccess.png'
    },
    fail: {
      id: 'quest-fail',
      label: 'Fail',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Ffail.png'
    },
    cover: {
      id: 'quest-cover',
      label: 'Decision',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fvote-cover.png'
    },
    succeed: {
      id: 'quest-succeed',
      label: 'Succeed',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fsucceed.png'
    },
    failed: {
      id: 'quest-failed',
      label: 'Failed',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Ffailed.png'
    },
    rejects: {
      id: 'rejects',
      label: 'Rejects',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Frejects.png'
    },
    round: {
      id: 'round',
      label: 'Round',
      img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fround.png'
    }
  }
}

const Avalon = {
  id: 'the-resistance-avalon',
  name: 'The Resistance: Avalon',
  setup: (ctx) => {
    const settings = ctx.settings;
    const selectedBoard = settings.selectedBoard;
    const board = settings.static.boards[selectedBoard];
    const selectedCards = settings.selectedCards;
    
    // DEBUG TEST ONLY BEGIN
    let i = Object.keys(ctx.players).length + 1;
    while (i <= board.minPlayers) {
      ctx.players['testbotid' + i] = {client: {id: null, status: 'disconnected'}, name: "TestBot" + i, host: false};
      i++;
    }
    // DEBUG TEST ONLY END
    
    const numPlayers = Object.keys(ctx.players).length;
    if (numPlayers < board.minPlayers || numPlayers > board.maxPlayers) {
      return "Invalid number of players";
    } else if (numPlayers !== selectedCards.good.length + selectedCards.evil.length) {
      return "Invalid number of selected cards";
    }
    
    const players = [];
    for (const id in ctx.players) {
      players.push({id});
    }
    
    distributeCards(selectedCards, players);
    
    return {
      players,
      message: '',
      leader: Math.floor(Math.random() * numPlayers), // idx of players
      leader: 0, // DEBUG TEST ONLY
      team: new Set(), // [<player.name>]
      voters: {}, // [{<player.id>: <Boolean>}]
      quest: {}, // [<player.id>]
      quests: [{history: []}], // [{outcome: {success: <Boolean>, decisions: [<Boolean>]}, history: [{team: [<player.name>], votes: {<player.name>: <Boolean>}]}]
    };
  },
  moves: {
    pickTeam: (ctx, state, playerId) => {
      const selectedBoard = ctx.settings.boards[ctx.settings.selectedBoard];
      const currentQuest = selectedBoard.quests[state.quests.length - 1];
      state.team.remove(playerId);
      if (state.team.length < currentQuest.team) {
        state.team.add(playerId);
      }
    },
    proposeTeam: (ctx, state) => {
      ctx.events.endPhase({next: 'voting'});
    },
    vote: (ctx, state, vote) => {
      state.voters.remove(ctx.playerId);
      state.voters.add(ctx.playerId, {id: ctx.playerId, vote});
      // DEBUG TEST ONLY BEGIN
      for (const player of ctx.players) {
        if (player.id.includes('testbotid')) {
          state.voters.add(player.id, {id: player.id, vote});
        }
      }
      // DEBUG TEST ONLY END
    }
  },
  playerView: (ctx, state, playerId) => {
    const self = state.players.filter(player => {return player.id === playerId})[0];
    const cardId = ctx.settings.static.cards[self.card.side][self.card.idx].id;
    for (const player of state.players) {
      if (player.id !== playerId) {
        const playerCardId = ctx.settings.static.cards[player.card.side][player.card.idx].id;
        switch (cardId) {
          case 'merlin':
            if (player.card.side === 'evil' && playerCardId !== 'mordred') {
              delete player.card.idx;
            } else {
              delete player.card;
            }
            break;
          case 'percival':
            delete player.card;
            if (playerCardId === 'merlin' || playerCardId === 'morgana') {
              player.card = {id: 'merlin'};
            }
            break;
          default:
            if (self.card.side === 'evil' && cardId !== 'oberon') {
              if (player.card.side === 'evil' && playerCardId !== 'oberon') {
                delete player.card.idx;
              } else {
                delete player.card;
              }
            } else {
              delete player.card;
            }
        }
      }
    }
    
    for (const id in state.voters) {
      if (id !== playerId) {
        delete state.voters[id].vote;
      }
    }
    
    // if (secret !== undefined) {
    //   s.players = s.players.map(player => {
    //     if (secret.hasOwnProperty(player.id)) {
    //       player = JSON.parse(JSON.stringify(player)); // deep clone copy
    //       deepExtend(player, secret[player.id]);
    //     }
    //     return player;
    //   });
    // }
  },
  flow: {
    startingPhase: 'choosing',
    
    phases: {
      choosing: {
        allowedMoves: ['pickTeam', 'proposeTeam'],
        restriction: (ctx, state) => {
          const leader = state.players.toArray()[state.leader];
          if (ctx.playerId !== leader.id) {
            return 'Leader only action';
          }
        },
        next: 'voting'
      },
      voting: {
        allowedMoves: ['vote'],
        restriction: (ctx, state) => {
          if (!state.players.contains(ctx.playerId)) {
            return 'Not a player';
          }
        },
        endPhaseIf: (ctx, state) => {return ctx.players.length === state.voters.length},
        next: 'tally'
      },
      tally: {
        onPhaseBegin: (ctx, state) => {
          const currentQuest = state.quests[state.quests.length - 1];
          const votes = {};
          let approvals = 0;
          let rejections = 0;
          for (const voter of state.voters) {
            votes[voter.id] = voter.vote;
            if (voter.vote) {
              approvals++;
            } else {
              rejections++;
            }
          }
          currentQuest.history.push({team: state.team.toArray(), votes});

          state.voters.clear();

          state.leader = nextLeader(ctx, state);

          if (approvals > rejections) {
            state.message = ''; // DEBUG TEST ONLY
            ctx.endPhase({next: 'questing'});
          } else {
            if (currentQuest.history.length >= 5) {
              ctx.endPhase({next: 'end'});
            } else {
              state.team.clear();
              ctx.endPhase({next: 'choosing'});
            }
          }
        }
      },
      questing: {
        allowedMoves: ['quest'],
        restriction: (ctx, state) => {
          if (!ctx.players.contains(ctx.playerId)) {
            return "Not a player";
          } else if (!state.team.contains(ctx.playerId)) {
            return "Ouch, you weren't chosen";
          }
        }
      },
      assassinating: {
        next: 'end'
      }
    }
  },
  settings: {
    static: {
      ...pieces
    },
    // Default settings
    selectedBoard: 0,
    selectedCards: {
      good: [
        0, // merlin
        1, // percival
        2, // servant
      ],
      evil: [
        1, // assassin
        2, // morgana
      ]
    },
    extra: {
      enableHistory: true,
      spectatorsSeeIdentity: false,
      evilClarivoyance: false
    },
    onChange: (settings) => {
      if (settings.selectedBoard < 0 || settings.selectedBoard >= settings.static.boards.length) {
        return "Invalid board";
      }

      const board = settings.static.boards[settings.selectedBoard];
      const maxPlayers = board.maxPlayers;
      const maxEvils = board.evils;
      const maxGoods = maxPlayers - maxEvils;

      if (settings.selectedCards.good.length > maxGoods) {
        settings.selectedCards.good = settings.selectedCards.good.slice(0, maxGoods);
      }
      if (settings.selectedCards.evil.length > maxEvils) {
        settings.selectedCards.evil = settings.selectedCards.evil.slice(0, maxEvils);
      }
    }
  }
};

function nextLeader(ctx, state) {
  const players = ctx.players.toArray();
  let leader = state.leader;
  // DEBUG TEST ONLY BEGIN
  do {
    leader++;
    leader %= players.length;
  } while (players[leader].id.includes('testbotid'));
  // DEBUG TEST ONLY END
  return leader;
}

function distributeCards(selectedCards, players) {
  const cards = [];
  for (let i = 0; i < selectedCards.good.length; i++) {
    cards.push({side: 'good', idx: selectedCards.good[i]});
  }
  for (let i = 0; i < selectedCards.evil.length; i++) {
    cards.push({side: 'evil', idx: selectedCards.evil[i]});
  }
  
  const shuffleTimes = Math.floor(Math.random() * 20);
  for (let i = 0; i < shuffleTimes; i++) {
    shuffle(cards);
  }
  
  let i = 0;
  for (const player of players) {
    player.card = cards[i++];
  }
}

/**
 * Fisher-Yates algorithm to shuffle array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(arr) {
  let randIdx, tmp, idx;
  for (idx = arr.length - 1; idx > 0; idx--) {
      randIdx = Math.floor(Math.random() * idx);
      tmp = arr[idx];
      arr[idx] = arr[randIdx];
      arr[randIdx] = tmp;
  }
  return arr;
}

module.exports = Avalon;