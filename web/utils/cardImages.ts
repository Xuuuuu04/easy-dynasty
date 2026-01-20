// 塔罗牌图片映射
export const cardImageMap: Record<string, string> = {
  // 大阿尔卡那 (Major Arcana)
  '0': '/cards/00-TheFool.png',
  '1': '/cards/01-TheMagician.png',
  '2': '/cards/02-TheHighPriestess.png',
  '3': '/cards/03-TheEmpress.png',
  '4': '/cards/04-TheEmperor.png',
  '5': '/cards/05-TheHierophant.png',
  '6': '/cards/06-TheLovers.png',
  '7': '/cards/07-TheChariot.png',
  '8': '/cards/08-Strength.png',
  '9': '/cards/09-TheHermit.png',
  '10': '/cards/10-WheelOfFortune.png',
  '11': '/cards/11-Justice.png',
  '12': '/cards/12-TheHangedMan.png',
  '13': '/cards/13-Death.png',
  '14': '/cards/14-Temperance.png',
  '15': '/cards/15-TheDevil.png',
  '16': '/cards/16-TheTower.png',
  '17': '/cards/17-TheStar.png',
  '18': '/cards/18-TheMoon.png',
  '19': '/cards/19-TheSun.png',
  '20': '/cards/20-Judgement.png',
  '21': '/cards/21-TheWorld.png',

  // 权杖 (Wands)
  'ace_wands': '/cards/Wands01.png',
  'two_wands': '/cards/Wands02.png',
  'three_wands': '/cards/Wands03.png',
  'four_wands': '/cards/Wands04.png',
  'five_wands': '/cards/Wands05.png',
  'six_wands': '/cards/Wands06.png',
  'seven_wands': '/cards/Wands07.png',
  'eight_wands': '/cards/Wands08.png',
  'nine_wands': '/cards/Wands09.png',
  'ten_wands': '/cards/Wands10.png',
  'page_wands': '/cards/Wands11.png',
  'knight_wands': '/cards/Wands12.png',
  'queen_wands': '/cards/Wands13.png',
  'king_wands': '/cards/Wands14.png',

  // 圣杯 (Cups)
  'ace_cups': '/cards/Cups01.png',
  'two_cups': '/cards/Cups02.png',
  'three_cups': '/cards/Cups03.png',
  'four_cups': '/cards/Cups04.png',
  'five_cups': '/cards/Cups05.png',
  'six_cups': '/cards/Cups06.png',
  'seven_cups': '/cards/Cups07.png',
  'eight_cups': '/cards/Cups08.png',
  'nine_cups': '/cards/Cups09.png',
  'ten_cups': '/cards/Cups10.png',
  'page_cups': '/cards/Cups11.png',
  'knight_cups': '/cards/Cups12.png',
  'queen_cups': '/cards/Cups13.png',
  'king_cups': '/cards/Cups14.png',

  // 宝剑 (Swords)
  'ace_swords': '/cards/Swords01.png',
  'two_swords': '/cards/Swords02.png',
  'three_swords': '/cards/Swords03.png',
  'four_swords': '/cards/Swords04.png',
  'five_swords': '/cards/Swords05.png',
  'six_swords': '/cards/Swords06.png',
  'seven_swords': '/cards/Swords07.png',
  'eight_swords': '/cards/Swords08.png',
  'nine_swords': '/cards/Swords09.png',
  'ten_swords': '/cards/Swords10.png',
  'page_swords': '/cards/Swords11.png',
  'knight_swords': '/cards/Swords12.png',
  'queen_swords': '/cards/Swords13.png',
  'king_swords': '/cards/Swords14.png',

  // 星币 (Pentacles)
  'ace_pentacles': '/cards/Pentacles01.png',
  'two_pentacles': '/cards/Pentacles02.png',
  'three_pentacles': '/cards/Pentacles03.png',
  'four_pentacles': '/cards/Pentacles04.png',
  'five_pentacles': '/cards/Pentacles05.png',
  'six_pentacles': '/cards/Pentacles06.png',
  'seven_pentacles': '/cards/Pentacles07.png',
  'eight_pentacles': '/cards/Pentacles08.png',
  'nine_pentacles': '/cards/Pentacles09.png',
  'ten_pentacles': '/cards/Pentacles10.png',
  'page_pentacles': '/cards/Pentacles11.png',
  'knight_pentacles': '/cards/Pentacles12.png',
  'queen_pentacles': '/cards/Pentacles13.png',
  'king_pentacles': '/cards/Pentacles14.png',
}

// 获取塔罗牌图片路径
export function getCardImage(cardId: string | number): string {
  const imageUrl = cardImageMap[cardId.toString()]
  return imageUrl || '/cards/CardBacks.png' // 如果找不到对应图片，返回牌背
}

// 牌背图片
export const CARD_BACK_IMAGE = '/cards/CardBacks.png'
