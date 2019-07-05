'use strict';

class AvalonSettings {
  static initialSettings() {
    const pieces = {
      boards: [
        {
          id: '5-players',
          label: '5 Players',
          img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2F5-players.png'
        },
        {
          id: '6-players',
          label: '6 Players',
          img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2F6-players.png'
        },
        {
          id: '7-players',
          label: '7 Players',
          img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2F7-players.png'
        },
        {
          id: '8-players',
          label: '8 Players',
          img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2F8-players.png'
        },
        {
          id: '9-players',
          label: '9 Players',
          img: 'https://cdn.glitch.com/47971c1f-0386-433d-943f-b3ab96b26402%2F9-player.png'
        },
        {
          id: '10-players',
          label: '10 Players',
          img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2F10-players.png'
        }
      ],
      cards: {
        good: [
          {
            id: 'merlin',
            label: 'Merlin',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fmerlin.png'
          },
          {
            id: 'percival',
            label: 'Percival',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fpercival.png'
          },
          {
            id: 'servant-1',
            label: 'Loyal Servant of Arthur',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fservant-1.png'
          },
          {
            id: 'servant-2',
            label: 'Loyal Servant of Arthur',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fservant-2.png'
          },
          {
            id: 'servant-3',
            label: 'Loyal Servant of Arthur',
            img: 'https://cdn.glitch.com/47971c1f-0386-433d-943f-b3ab96b26402%2Fservant-3.png'
          },
          {
            id: 'servant-4',
            label: 'Loyal Servant of Arthur',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fservant-4.png'
          },
          {
            id: 'servant-5',
            label: 'Loyal Servant of Arthur',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fservant-5.png'
          }
        ],
        evil: [
          {
            id: 'mordred',
            label: 'Mordred',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fmordred.png'
          },
          {
            id: 'assassin',
            label: 'Assassin',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fassassin.jpg'
          },
          {
            id: 'morgana',
            label: 'Morgana',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fmorgana.png'
          },
          {
            id: 'oberon',
            label: 'Oberon',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Foberon.png'
          },
          {
            id: 'minion-1',
            label: 'Minion of Mordred',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fminion-1.png'
          },
          {
            id: 'minion-2',
            label: 'Minion of Mordred',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fminion-2.png'
          },
          {
            id: 'minion-3',
            label: 'Minion of Mordred',
            img: 'https://cdn.glitch.com/0c0821f6-4b1d-4757-975f-81072b5ba242%2Fminion-3.png'
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