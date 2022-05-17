import React from 'react';

import Maintenance from '../Maintenance';

import { ChineseWerewolfSettings } from '../../games/chinese-werewolf/ui/Settings';
import { XPWerewolfSettings } from '../../games/xp-werewolf/ui/Settings';

export default function Settings({ room, self }) {
    switch (room.ctx.id) {
        // case 'the-resistance-avalon':
        //   if (window.location.pathname === '/game') {
        //     return <AvalonGame room={room} self={self} />
        //   } else {
        //     return <AvalonRoom room={room} self={self} />
        //   }
        // case 'mahjong':
        //     return <BGIOClient room={room} self={self} game={Mahjong} board={MahjongTable} />
        case 'chinese-werewolf':
            return <ChineseWerewolfSettings room={room} self={self} />
        case 'xp-werewolf':
            return <XPWerewolfSettings room={room} self={self} />
        default:
            return <Maintenance />
    }
}