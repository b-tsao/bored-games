import { localize, text } from "./language";

export const games = [
    {
      id: 'the-resistance-avalon',
      title: 'The Resistance: Avalon',
      subtitle: 'Social Deduction, Deception, Teamwork, Co-op',
      image: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Favalon.jpg?v=1565656821873',
      disabled: true
    },
    {
      id: 'mahjong',
      title: 'Mahjong',
      subtitle: 'Strategy',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSx8XvsNSn730b4puD7w2F4FtV0kCtcylFhGI0ZeNuzgDa2WRBB&usqp=CAU',
      disabled: false
    },
    {
      id: 'chinese-werewolf',
      title: localize(text.games.chineseWerewolf, 'cn/simplified').title,
      subtitle: localize(text.games.chineseWerewolf, 'cn/simplified').subtitle,
      image: 'https://shopee.tw/blog/wp-content/uploads/2019/08/%E7%8B%BC%E4%BA%BA%E6%AE%BA.png',
      disabled: false
    }
];