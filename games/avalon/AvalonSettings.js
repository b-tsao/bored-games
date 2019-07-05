'use strict';

class AvalonSettings {
  static initialSettings() {
    const pieces = {
      boards: [
        {
          id: '5-players',
          board: '5 Players',
          img: '/images/games/avalon/5-player.png'
        },
        {
          id: 6,
          board: '6 Players',
          img: '/images/games/avalon/6-player.png'
        },
        {
          id: 7,
          board: '7 Players',
          img: '/images/games/avalon/7-player.png'
        },
        {
          id: 8,
          board: '8 Players',
          img: '/images/games/avalon/8-player.png'
        },
        {
          id: 9,
          board: '9 Players',
          img: '/images/games/avalon/9-player.png'
        },
        {
          id: 10,
          board: '10 Players',
          img: '/images/games/avalon/10-player.png'
        }
      ],
      cards: {
        good: [
          {
            id: 'merlin',
            card: 'Merlin',
            img: '/images/games/avalon/merlin.png'
          },
          {
            id: 'percival',
            card: 'Percival',
            img: '/images/games/avalon/percival.png'
          },
          {
            id: 'servant-1',
            card: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-1.png'
          },
          {
            id: 'servant-2',
            card: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-2.png'
          },
          {
            id: 'servant-3',
            card: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-3.png'
          },
          {
            id: 'servant-4',
            card: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-4.png'
          },
          {
            id: 'servant-5',
            card: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-5.png'
          }
        ],
        evil: [
          {
            id: 'mordred',
            card: 'Mordred',
            img: '/images/games/avalon/mordred.png'
          },
          {
            id: 'assassin',
            card: 'Assassin',
            img: '/images/games/avalon/assassin.jpg'
          },
          {
            id: 'morgana',
            card: 'Morgana',
            img: '/images/games/avalon/morgana.png'
          },
          {
            id: 'oberon',
            card: 'Oberon',
            img: '/images/games/avalon/oberon.png'
          },
          {
            id: 'minion-1',
            card: 'Minion of Mordred',
            img: '/images/games/avalon/minion-1.png'
          },
          {
            id: 'minion-2',
            card: 'Minion of Mordred',
            img: '/images/games/avalon/minion-2.png'
          },
          {
            id: 'minion-3',
            card: 'Minion of Mordred',
            img: '/images/games/avalon/minion-3.png'
          }
        ]
      }
    };
    return {
      ...pieces,
      maxPlayers: 5,
      selectedBoard: pieces.boards[0], // 5 player board
      selectedCards: {
        good: [
          pieces.cards.good[0], // merlin
          pieces.cards.good[1], // percival
          pieces.cards.good[2], // servant
        ],
        evil: [
          pieces.cards.evil[1], // assassin
          pieces.cards.evil[2], // morgana
        ]
      }
    };
  }
}

module.exports = AvalonSettings;