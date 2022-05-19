import React from 'react';

import BGIOClient from './BGIOClient';

// import AvalonRoom from 'games/avalon/ui/Room';
// import AvalonGame from 'games/avalon/ui/Game';
import Maintenance from '../Maintenance';

import { MahjongTable } from '../../games/mahjong/ui/MahjongTable';
import { Mahjong } from '../../games/mahjong/game';
import { ChineseWerewolf } from '../../games/chinese-werewolf/game';
import { ChineseWerewolfBoard } from '../../games/chinese-werewolf/ui/Board';
import { RevealWerewolf } from '../../games/reveal-werewolf/game';
import { RevealWerewolfBoard } from '../../games/reveal-werewolf/ui/Board';

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
        case 'chinese-werewolf':
            return <BGIOClient room={room} self={self} game={ChineseWerewolf} board={ChineseWerewolfBoard} />
        case 'reveal-werewolf':
            return <BGIOClient room={room} self={self} game={RevealWerewolf} board={RevealWerewolfBoard} />
        default:
            return <Maintenance />
    }
}