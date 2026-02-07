// 塔罗牌图片映射
// 这里存储的是图片的文件名（不包含扩展名和路径），用于多套牌共用文件名
export const cardFilenameMap: Record<string, string> = {
    // 大阿尔卡那 (Major Arcana)
    '0': '00-TheFool',
    '1': '01-TheMagician',
    '2': '02-TheHighPriestess',
    '3': '03-TheEmpress',
    '4': '04-TheEmperor',
    '5': '05-TheHierophant',
    '6': '06-TheLovers',
    '7': '07-TheChariot',
    '8': '08-Strength',
    '9': '09-TheHermit',
    '10': '10-WheelOfFortune',
    '11': '11-Justice',
    '12': '12-TheHangedMan',
    '13': '13-Death',
    '14': '14-Temperance',
    '15': '15-TheDevil',
    '16': '16-TheTower',
    '17': '17-TheStar',
    '18': '18-TheMoon',
    '19': '19-TheSun',
    '20': '20-Judgement',
    '21': '21-TheWorld',

    // 权杖 (Wands)
    ace_wands: 'Wands01',
    two_wands: 'Wands02',
    three_wands: 'Wands03',
    four_wands: 'Wands04',
    five_wands: 'Wands05',
    six_wands: 'Wands06',
    seven_wands: 'Wands07',
    eight_wands: 'Wands08',
    nine_wands: 'Wands09',
    ten_wands: 'Wands10',
    page_wands: 'Wands11',
    knight_wands: 'Wands12',
    queen_wands: 'Wands13',
    king_wands: 'Wands14',

    // 圣杯 (Cups)
    ace_cups: 'Cups01',
    two_cups: 'Cups02',
    three_cups: 'Cups03',
    four_cups: 'Cups04',
    five_cups: 'Cups05',
    six_cups: 'Cups06',
    seven_cups: 'Cups07',
    eight_cups: 'Cups08',
    nine_cups: 'Cups09',
    ten_cups: 'Cups10',
    page_cups: 'Cups11',
    knight_cups: 'Cups12',
    queen_cups: 'Cups13',
    king_cups: 'Cups14',

    // 宝剑 (Swords)
    ace_swords: 'Swords01',
    two_swords: 'Swords02',
    three_swords: 'Swords03',
    four_swords: 'Swords04',
    five_swords: 'Swords05',
    six_swords: 'Swords06',
    seven_swords: 'Swords07',
    eight_swords: 'Swords08',
    nine_swords: 'Swords09',
    ten_swords: 'Swords10',
    page_swords: 'Swords11',
    knight_swords: 'Swords12',
    queen_swords: 'Swords13',
    king_swords: 'Swords14',

    // 星币 (Pentacles)
    ace_pentacles: 'Pentacles01',
    two_pentacles: 'Pentacles02',
    three_pentacles: 'Pentacles03',
    four_pentacles: 'Pentacles04',
    five_pentacles: 'Pentacles05',
    six_pentacles: 'Pentacles06',
    seven_pentacles: 'Pentacles07',
    eight_pentacles: 'Pentacles08',
    nine_pentacles: 'Pentacles09',
    ten_pentacles: 'Pentacles10',
    page_pentacles: 'Pentacles11',
    knight_pentacles: 'Pentacles12',
    queen_pentacles: 'Pentacles13',
    king_pentacles: 'Pentacles14',
};

// 尝试导入资源清单 (Generate by script)
// 如果文件不存在（构建时可能），则默认全量允许（依赖 onError）或全量禁止
// 我们使用 try-catch 或可选导入
import manifest from '../public/decks/manifest.json';

// 将 manifest 转换为 Set 以便快速查找
const availableCards = new Map<string, Set<string>>();
if (manifest && manifest.decks) {
    Object.entries(manifest.decks).forEach(([deckId, files]) => {
        availableCards.set(deckId, new Set(files as string[]));
    });
}

export type DeckId = 'rws' | 'marseille' | 'visconti';

export const AVAILABLE_DECKS: { id: DeckId; name: string; description: string }[] = [
    { id: 'rws', name: '经典韦特 (RWS)', description: '最为通用、经典的塔罗牌。' },
    { id: 'marseille', name: '马赛塔罗 (Marseille)', description: '古朴典雅的木刻风格。' },
    { id: 'visconti', name: '维斯康蒂 (Visconti)', description: '现存最古老的塔罗牌之一。' },
];

// 获取塔罗牌图片路径
// 默认 deck 为 rws
export function getCardImage(cardId: string | number, deckId: DeckId = 'rws'): string {
    const filename = cardFilenameMap[cardId.toString()];

    if (!filename) {
        if (deckId === 'rws') return '/cards/back-new.png';
        return '/decks/back.jpg';
    }

    // 检查清单中是否存在
    const deckFiles = availableCards.get(deckId);
    if (deckFiles) {
        // 我们的文件名映射没有后缀，清单有吗？ generate_script 去掉了后缀
        if (!deckFiles.has(filename)) {
            // 如果该 deck 没有这张牌
            // 1. 如果不是 RWS，尝试降级到 RWS
            if (deckId !== 'rws') {
                // 再次检查 RWS 是否有 (防止死循环或全部缺失)
                const rwsFiles = availableCards.get('rws');
                if (rwsFiles && rwsFiles.has(filename)) {
                    return `/decks/rws/${filename}.jpg`;
                }
            }
            // 2. 如果 RWS 也没有，或者这就是 RWS，返回牌背
            // 这彻底阻止了 400 错误
            return '/cards/back-new.png';
        }
    }

    // 构建路径: /decks/{deckId}/{filename}.jpg
    // 注意：脚本下载的是 jpg
    return `/decks/${deckId}/${filename}.jpg`;
}

// 牌背图片 - 建议也根据 deck 区分，这里先返回一个通用的或默认的
export function getCardBackImage(deckId: DeckId = 'rws'): string {
    return '/cards/back-new.png';
}

export const CARD_BACK_IMAGE = '/cards/back-new.png';
