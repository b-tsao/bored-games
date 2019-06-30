'use strict';

class AvalonSettings {
  static initialSettings() {
    return {
      cards: [
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
        },
        {
          id: 'mordred',
          card: 'Mordred',
          img: '/images/games/avalon/mordred.png'
        },
        {
          id: 'assassin',
          card: 'Assassin',
          img: '/images/games/avalon/assassin.png'
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
      ],
      selectedCards: []
    };
  }
}

module.exports = AvalonSettings;