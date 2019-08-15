'use strict';

const deepExtend = require('deep-extend');

class AvalonSettings {
  constructor() {
    this.boards = [
      {
        id: '5-players',
        label: '5 Players Board',
        minPlayers: 5,
        maxPlayers: 5,
        evils: 2,
        missions: [{team: 2, fails: 1},
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
        missions: [{team: 2, fails: 1},
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
        missions: [{team: 2, fails: 1},
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
        missions: [{team: 3, fails: 1},
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
        missions: [{team: 3, fails: 1},
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
        missions: [{team: 3, fails: 1},
                   {team: 4, fails: 1},
                   {team: 4, fails: 1},
                   {team: 5, fails: 2},
                   {team: 5, fails: 1}],
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2F10-players.png'
      }
    ];
    this.cards = {
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
    };
    this.vote = {
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
    };
    this.mission = {
      chosen: {
        id: 'mission-chosen',
        label: 'Chosen',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fchosen.png'
      },
      success: {
        id: 'mission-success',
        label: 'Success',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fsuccess.png'
      },
      fail: {
        id: 'mission-fail',
        label: 'Fail',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Ffail.png'
      },
      cover: {
        if: 'mission-cover',
        label: 'Decision',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fvote-cover.png'
      },
      succeed: {
        id: 'mission-succeed',
        label: 'Succeed',
        img: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Fsucceed.png'
      },
      failed: {
        id: 'mission-failed',
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
    };
    
    this.selectedBoard = 0;
    this.selectedCards = {
      good: [
        0, // merlin
        1, // percival
        2, // servant
      ],
      evil: [
        1, // assassin
        2, // morgana
      ]
    };
    this.extra = {
      enableHistory: true,
      spectatorsSeeIdentity: false,
      evilClarivoyance: false
    };
  }
  
  get minPlayers () {return this.boards[this.selectedBoard].minPlayers};
  get maxPlayers () {return this.boards[this.selectedBoard].maxPlayers};
  
  toJSON() {
    return {
      static: {
        boards: this.boards,
        cards: this.cards,
        vote: this.vote,
        mission: this.mission
      },
      minPlayers: this.minPlayers,
      maxPlayers: this.maxPlayers,
      selectedBoard: this.selectedBoard,
      selectedCards: this.selectedCards,
      extra: this.extra
    };
  }
  
  change(settings, callback = () => {}) {
    const reason = this.check(settings);
    if (reason) {
      return callback(reason);
    }
    
    const changes = {};
    deepExtend(this, settings);
    deepExtend(changes, settings);
    this.changed(settings, (autoChanges) => {
      if (autoChanges) {
        deepExtend(changes, autoChanges);
      }
      return callback(null, changes);
    });
  }
  
  check(settings) {
    for (const setting in settings) {
      let reason;
      switch (setting) {
        case 'selectedBoard':
          reason = this.selectedBoardCheck(settings[setting]);
          break;
        case 'selectedCards':
          reason = this.selectedCardsCheck(settings[setting]);
          break;
        case 'extra':
          reason = this.extraCheck(settings[setting]);
          break;
      }
      if (reason) {
        return reason;
      }
    }
    return null;
  }
  
  changed(settings, callback = () => {}) {
    for (const setting in settings) {
      switch (setting) {
        case 'selectedBoard':
          this.selectedBoardChanged(callback);
        default:
          return callback();
      }
    }
  }
  
  selectedBoardCheck(selectedBoard) {
    if (selectedBoard < 0 || selectedBoard >= this.boards.length) {
      return "Invalid board";
    }
  }
  
  selectedCardsCheck(selectedCards) {
    const maxEvils = this.boards[this.selectedBoard].evils;
    const maxGoods = this.maxPlayers - maxEvils;
    if (selectedCards.good && selectedCards.good.length > maxGoods) {
      return "Too many characters chosen for the good side; max " + maxGoods;
    } else if (selectedCards.evil && selectedCards.evil.length > maxEvils) {
      return "Too many characters chosen for the evil side; max " + maxEvils;
    }
  }
  
  extraCheck(extraSettings) {
    const keys = Object.keys(extraSettings);
    for (let i = 0; i < keys.length; i++) {
      if (!this.extra.hasOwnProperty(keys[i])) {
        return "Invalid field supplied: " + keys[i];
      }
    }
  }
  
  selectedBoardChanged(callback = () => {}) {
    const selectedBoard = this.boards[this.selectedBoard];
    const maxPlayers = selectedBoard.maxPlayers;
    const maxEvils = selectedBoard.evils;
    const maxGoods = maxPlayers - maxEvils;

    const selectedCardsChanges = {};
    if (this.selectedCards.good.length > maxGoods) {
      this.selectedCards.good = this.selectedCards.good.slice(0, maxGoods);
      selectedCardsChanges.good = this.selectedCards.good;
    }
    if (this.selectedCards.evil.length > maxEvils) {
      this.selectedCards.evil = this.selectedCards.evil.slice(0, maxEvils);
      selectedCardsChanges.evil = this.selectedCards.evil;
    }
    const changes = {
      minPlayers: this.minPlayers,
      maxPlayers: this.maxPlayers
    };
    if (Object.keys(selectedCardsChanges).length > 0) {
      changes.selectedCards = selectedCardsChanges;
    }
    return callback(changes);
  }
}

module.exports = AvalonSettings;