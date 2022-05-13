export enum Side {
    Town,
    Wolves,
    Neutral
}

const Cards = {
    // id needs to be same as key!!!
    prophet: {
        id: 'prophet',
        label: '预言家',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414653.jpg'
        // img: 'https://pic3.zhimg.com/80/v2-a67f773eea979799ef8bfd0d3daa8cbe_1440w.jpg'
    },
    witch: {
        id: 'witch',
        label: '女巫',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414648.jpg'
        // img: 'https://pic2.zhimg.com/80/v2-4d5466d013c5882c78a52b3313500e5d_1440w.jpg'
    },
    guard: {
        id: 'guard',
        label: '守卫',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414651.jpg'
        // img: 'https://pic3.zhimg.com/80/v2-56379831b6d7f409d1d3a871dfb37916_1440w.jpg'
    },
    citizen: {
        id: 'citizen',
        label: '民',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414649.jpg'
        // img: 'https://pic4.zhimg.com/80/v2-83382f93bfa15e6602db427a48336583_1440w.jpg'
    },
    hunter: {
        id: 'hunter',
        label: '猎人',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414647.jpg'
        // img: 'https://pic3.zhimg.com/80/v2-02f1c7a0ea2ed26ccb75c6c71d647416_1440w.jpg'
    },
    idiot: {
        id: 'idiot',
        label: '白痴',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414643.jpg'
        // img: 'https://pic4.zhimg.com/80/v2-e19399365ccbed0fce362b80edd50ca7_1440w.jpg'
    },
    mute: {
        id: 'mute',
        label: '禁言长老',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414645.jpg'
    },
    gangster: {
        id: 'gangster',
        label: '老流氓',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414646.jpg'
    },
    knight: {
        id: 'knight',
        label: '骑士',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414650.jpg'
        // img: 'https://pic1.zhimg.com/80/v2-795fe325c5e1d73c9d1eab8a17580d74_1440w.jpg'
    },
    tamer: {
        id: 'tamer',
        label: '驯熊师',
        side: Side.Town,
        divine: true,
        img: 'https://image.9game.cn/2017/10/31/18414652.jpg'
        // img: 'https://pic2.zhimg.com/80/v2-418621485ff2dd92b1afdbbeba8a2df5_1440w.jpg'
    },
    gravekeeper: {
        id: 'gravekeeper',
        label: '守墓人',
        side: Side.Town,
        divine: true,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/gravekeeper.jpeg?raw=true'
        // img: 'https://pic3.zhimg.com/80/v2-93f1cb70cf21c36d8d37e567271fd1e6_1440w.jpg'
    },
    crow: {
        id: 'crow',
        label: '乌鸦',
        side: Side.Town,
        divine: true,
        img: 'https://ok.166.net/reunionpub/ds/kol/20210425/230233-icp6wekm3n.png'
    },
    miracle_merchant: {
        id: 'miracle_merchant',
        label: '奇迹商人',
        side: Side.Town,
        divine: true,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/miracle_merchant.jpeg?raw=true'
    },
    prince: {
        id: 'prince',
        label: '定序王子',
        side: Side.Town,
        divine: true,
        img: 'https://newyx-img.hellonitrack.com/article/image/202011/05/ead539b804.jpg'
    },
    magician: {
        id: 'magician',
        label: '魔术师',
        side: Side.Town,
        divine: true,
        img: 'https://pic2.zhimg.com/80/v2-12213157b873540dd4ea393da69fa98d_1440w.jpg'
    },
    light_scholar: {
        id: 'light_scholar',
        label: '白昼学者',
        side: Side.Town,
        divine: true,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/light_scholar.jpeg?raw=true'
    },
    dreamer: {
        id: 'dreamer',
        label: '摄梦人',
        side: Side.Town,
        divine: true,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/dreamer.jpeg?raw=true'
        // img: 'https://pic3.zhimg.com/80/v2-818aa108feb5367aa8a135bfa48be81a_1440w.jpg'
    },
    stalker: {
        id: 'stalker',
        label: '潜行者',
        side: Side.Town,
        divine: true,
        img: 'https://ok.166.net/reunionpub/1_20191211_16ef08b0689925845.png'
    },
    shaman: {
        id: 'shaman',
        label: '通靈師',
        side: Side.Town,
        divine: true,
        img: 'https://pic.pimg.tw/hkgameteller/1626007626-1699865543-g_n.png',
    },
    alchemist: {
        id: 'alchemist',
        label: '炼金魔女',
        side: Side.Town,
        divine: true,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/alchemist.jpeg?raw=true'
    },
    reviver: {
        id: 'reviver',
        label: '阴阳使者',
        side: Side.Town,
        divine: true
    },
    butterfly: {
        id: 'butterfly',
        label: '花蝴蝶',
        side: Side.Town,
        divine: true
    },
    prayer: {
        id: 'prayer',
        label: '祈求者',
        side: Side.Town,
        divine: true
    },
    eye: {
        id: 'eye',
        label: '天眼',
        side: Side.Town,
        divine: true
    },
    werewolf: {
        id: 'werewolf',
        label: '狼人',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414656.jpg'
        // img: 'https://pic1.zhimg.com/80/v2-3b181e52284144f9db1300a239b228f4_1440w.jpg'
    },
    whitewolf: {
        id: 'whitewolf',
        label: '白狼王',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414654.jpg'
        // img: 'https://pic1.zhimg.com/80/v2-5ba2b954ab736af5e3607fbf1d446164_1440w.jpg'
    },
    beautywolf: {
        id: 'beautywolf',
        label: '狼美人',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414655.jpg'
        // img: 'https://pic3.zhimg.com/80/v2-95859f2bfcbdfe84b6b094f09834216a_1440w.jpg'
    },
    alphawolf: {
        id: 'alphawolf',
        label: '狼王',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414657.jpg'
        // img: 'https://pic2.zhimg.com/80/v2-c9b67c681c442631d00945bdaf29c7b1_1440w.jpg'
    },
    hiddenwolf: {
        id: 'hiddenwolf',
        label: '隐狼',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414658.jpg'
    },
    roboticwolf: {
        id: 'roboticwolf',
        label: '機械狼',
        side: Side.Wolves,
        img: 'https://pic.pimg.tw/hkgameteller/1626007691-2995852796-g_n.png'
    },
    crowwolf: {
        id: 'crowwolf',
        label: '狼鸦之爪',
        side: Side.Wolves,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/crowwolf.jpeg?raw=true'
    },
    gargoyle: {
        id: 'gargoyle',
        label: '石像鬼',
        side: Side.Wolves,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/gargoyle.jpeg?raw=true'
        // img: 'https://pic1.zhimg.com/80/v2-87166abe3dbc69bd2dc709c0b7cecf58_1440w.jpg'
    },
    dark_knight: {
        id: 'dark_knight',
        label: '恶灵骑士',
        side: Side.Wolves,
        img: 'https://pic.pimg.tw/hkgameteller/1625980095-1087934518-g.jpg'
        // img: 'https://pic3.zhimg.com/80/v2-94f6c5957f28e26b3d0f731355f0a172_1440w.jpg'
    },
    night_mentor: {
        id: 'night_mentor',
        label: '寂夜导师',
        side: Side.Wolves,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/night_mentor.jpeg?raw=true'
    },
    nightmare: {
        id: 'nightmare',
        label: '噩梦之影',
        side: Side.Wolves,
        img: 'https://ok.166.net/reunionpub/1_20191219_16f1b35eebb234993.jpeg'
    },
    bat: {
        id: 'bat',
        label: '黑蝙蝠',
        side: Side.Wolves,
        img: 'https://pic4.zhimg.com/80/v2-8e0ded10c0edf9081b7c1be22607e93f_1440w.jpg'
    },
    fox_fairy: {
        id: 'fox_fairy',
        label: '狐仙',
        side: Side.Wolves,
        img: 'https://pic4.zhimg.com/80/v2-cbb385080c055b34febccd5d4d274523_1440w.jpg'
    },
    concubine_wolf: {
        id: 'concubine_wolf',
        label: '蚀时狼妃',
        side: Side.Wolves,
        img: 'https://github.com/b-tsao/temp/blob/master/cn_werewolf/concubine_wolf.png?raw=true'
    },
    bandit: {
        id: 'bandit',
        label: '盗贼',
        side: Side.Neutral,
        img: 'https://image.9game.cn/2017/10/31/18414659.jpg'
        // img: 'https://pic3.zhimg.com/80/v2-4cd28d94b2f7806395150b51122fdbba_1440w.jpg'
    },
    sheriff: {
        // This one is a passive add-on card, not a real role but I grabbed the card anyway in case we can use it in the future
        id: 'sheriff',
        label: '警长',
        side: Side.Neutral,
        img: 'https://image.9game.cn/2017/10/31/18414660.jpg'
    },
    cupid: {
        id: 'cupid',
        label: '丘比特',
        side: Side.Neutral,
        img: 'https://image.9game.cn/2017/10/31/18414661.jpg'
        // img: 'https://pic4.zhimg.com/80/v2-c27bd2259c6dcf268e13c7a3e3e3af47_1440w.jpg'
    },
    wild: {
        id: 'wild',
        label: '野孩子',
        side: Side.Neutral,
        img: 'https://image.9game.cn/2017/10/31/18414662.jpg'
    },
    terrorist: {
        id: 'terrorist',
        label: '炸弹人',
        side: Side.Neutral,
        img: 'https://image.9game.cn/2017/10/31/18414663.jpg'
    },
    hybrid: {
        id: 'hybrid',
        label: '混血儿',
        side: Side.Neutral,
        img: 'https://pic4.zhimg.com/80/v2-7530a617a4bcde5ab99c0f5f8c00533b_1440w.jpg'
    },
    fox: {
        id: 'fox',
        label: '咒狐',
        side: Side.Neutral,
        img: 'https://5b0988e595225.cdn.sohucs.com/images/20190822/f538e11f0be1456780a2a3ca4d8bc5e5.jpeg'
    },
    secret_admirer: {
        id: 'secret_admirer',
        label: '暗恋者',
        side: Side.Neutral,
        img: 'https://i.imgur.com/PPGtdkQ.jpg'
    },
    avenger: {
        id: 'avenger',
        label: '复仇者',
        side: Side.Neutral,
        img: 'https://pic.87g.com/upload/2017/0919/20170919101140311.jpg'
    },
    servant: {
        id: 'servant',
        label: '女仆',
        side: Side.Neutral,
        img: 'https://pic.87g.com/upload/2017/0918/20170918102500125.jpg'
    },
    shadow: {
        id: 'shadow',
        label: '影子',
        side: Side.Neutral,
        img: 'https://pic.87g.com/upload/2017/0919/20170919101926919.jpg'
    }
};

export default Cards;