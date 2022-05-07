export enum Side {
    Town,
    Wolves,
    Neutral
}

const cards = {
    // id needs to be same as key!!!
    prophet: {
        id: 'prophet',
        label: '预言家',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414653.jpg'
    },
    witch: {
        id: 'witch',
        label: '女巫',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414648.jpg'
    },
    guard: {
        id: 'guard',
        label: '守卫',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414651.jpg'
    },
    citizen: {
        id: 'citizen',
        label: '民',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414649.jpg'
    },
    hunter: {
        id: 'hunter',
        label: '猎人',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414647.jpg'
    },
    idiot: {
        id: 'idiot',
        label: '白痴',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414643.jpg'
    },
    mute: {
        id: 'mute',
        label: '禁言长老',
        side: Side.Town,
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
        img: 'https://image.9game.cn/2017/10/31/18414650.jpg'
    },
    tamer: {
        id: 'tamer',
        label: '驯熊师',
        side: Side.Town,
        img: 'https://image.9game.cn/2017/10/31/18414652.jpg'
    },
    gravekeeper: {
        id: 'gravekeeper',
        label: '守墓人',
        side: Side.Town,
        img: 'http://5b0988e595225.cdn.sohucs.com/images/20190226/88994a5aa70c488eab6869112ba5f897.jpeg'
    },
    crow: {
        id: 'crow',
        label: '乌鸦',
        side: Side.Town,
        img: 'https://ok.166.net/reunionpub/ds/kol/20210425/230233-icp6wekm3n.png'
    },
    miracle_merchant: {
        id: 'miracle_merchant',
        label: '奇迹商人',
        side: Side.Town,
        img: 'http://p9.itc.cn/images01/20200611/cf1204a446474e51b6ec095399cc0085.jpeg'
    },
    werewolf: {
        id: 'werewolf',
        label: '狼人',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414656.jpg'
    },
    whitewolf: {
        id: 'whitewolf',
        label: '白狼王',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414654.jpg'
    },
    beautywolf: {
        id: 'beautywolf',
        label: '狼美人',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414655.jpg'
    },
    alphawolf: {
        id: 'alphawolf',
        label: '狼王',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414657.jpg'
    },
    hiddenwolf: {
        id: 'hiddenwolf',
        label: '隐狼',
        side: Side.Wolves,
        img: 'https://image.9game.cn/2017/10/31/18414658.jpg'
    },
    gargoyle: {
        id: 'gargoyle',
        label: '石像鬼',
        side: Side.Wolves,
        img: 'http://5b0988e595225.cdn.sohucs.com/images/20190226/e8390809851c4c8c9b42b1bb86eca2ea.jpeg'
    },
    bandit: {
        id: 'bandit',
        label: '盗贼',
        side: Side.Neutral,
        img: 'https://image.9game.cn/2017/10/31/18414659.jpg'
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
        img: 'https://imgur.dcard.tw/bfoImTeh.jpg'
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
    }
};

export default cards;