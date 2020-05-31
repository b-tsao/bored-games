import React from 'react';

import BGIOClient from './BGIOClient';

// import AvalonRoom from 'games/avalon/ui/Room';
// import AvalonGame from 'games/avalon/ui/Game';
import Maintenance from '../Maintenance';

import { MahjongTable } from '../../games/mahjong/ui/MahjongTable';
import { Mahjong } from '../../games/mahjong/game';

export default function Game({ room, self }) {
    switch (room.ctx.id) {
        // case 'the-resistance-avalon':
        //   if (window.location.pathname === '/game') {
        //     return <AvalonGame room={room} self={self} />
        //   } else {
        //     return <AvalonRoom room={room} self={self} />
        //   }
        case 'mahjong':
            return <BGIOClient room={room} self={self} game={Mahjong} board={MahjongTable} />
        default:
            return <Maintenance />
    }
}