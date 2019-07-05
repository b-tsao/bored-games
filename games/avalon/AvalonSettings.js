'use strict';

class AvalonSettings {
  static initialSettings() {
    const pieces = {
      boards: [
        {
          id: '5-players',
          label: '5 Players',
          img: '/images/games/avalon/5-players.png'
        },
        {
          id: '6-players',
          label: '6 Players',
          img: '/images/games/avalon/6-players.png'
        },
        {
          id: '7-players',
          label: '7 Players',
          img: '/images/games/avalon/7-players.png'
        },
        {
          id: '8-players',
          label: '8 Players',
          img: '/images/games/avalon/8-players.png'
        },
        {
          id: '9-players',
          label: '9 Players',
          img: '/images/games/avalon/9-players.png'
        },
        {
          id: '10-players',
          label: '10 Players',
          img: '/images/games/avalon/10-players.png'
        }
      ],
      cards: {
        good: [
          {
            id: 'merlin',
            label: 'Merlin',
            img: '/images/games/avalon/merlin.png'
          },
          {
            id: 'percival',
            label: 'Percival',
            img: '/images/games/avalon/percival.png'
          },
          {
            id: 'servant-1',
            label: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-1.png'
          },
          {
            id: 'servant-2',
            label: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-2.png'
          },
          {
            id: 'servant-3',
            label: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-3.png'
          },
          {
            id: 'servant-4',
            label: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-4.png'
          },
          {
            id: 'servant-5',
            label: 'Loyal Servant of Arthur',
            img: '/images/games/avalon/servant-5.png'
          }
        ],
        evil: [
          {
            id: 'mordred',
            label: 'Mordred',
            img: '/images/games/avalon/mordred.png'
          },
          {
            id: 'assassin',
            label: 'Assassin',
            img: '/images/games/avalon/assassin.jpg'
          },
          {
            id: 'morgana',
            label: 'Morgana',
            img: '/images/games/avalon/morgana.png'
          },
          {
            id: 'oberon',
            label: 'Oberon',
            img: '/images/games/avalon/oberon.png'
          },
          {
            id: 'minion-1',
            label: 'Minion of Mordred',
            img: '/images/games/avalon/minion-1.png'
          },
          {
            id: 'minion-2',
            label: 'Minion of Mordred',
            img: '/images/games/avalon/minion-2.png'
          },
          {
            id: 'minion-3',
            label: 'Minion of Mordred',
            img: '/images/games/avalon/minion-3.png'
          }
        ]
      }
    };
    return {
      ...pieces,
      maxPlayers: 5,
      selectedBoard: 0, // 5 player board
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
      }
    };
  }
}

module.exports = AvalonSettings;