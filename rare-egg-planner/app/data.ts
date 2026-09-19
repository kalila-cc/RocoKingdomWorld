export type Pet = {
  id: number;
  key: string;
  name: string;
  form: string;
  baseId: number;
  legacyKey: string;
  season: string;
  availability: "season-limited" | "permanent" | "battle-pass";
  availabilityReason: string;
  groups: string[];
  series: string[];
  flags: number;
  family: string;
  stage: string;
  image: string;
  evolutionChain: string[];
  offspringKey: string;
  offspringReason: string;
  maleTargets: string[];
  femaleTargets: string[];
};

export const EGG_GROUPS = [
    "巨灵组",
    "两栖组",
    "昆虫组",
    "天空组",
    "动物组",
    "妖精组",
    "植物组",
    "拟人组",
    "软体组",
    "大地组",
    "魔力组",
    "海洋组",
    "龙组",
    "机械组"
] as const;

export const PET_SERIES = [
    "普通",
    "火",
    "水",
    "草",
    "电",
    "冰",
    "武",
    "毒",
    "地",
    "萌",
    "翼",
    "光",
    "恶",
    "幽",
    "幻",
    "机械",
    "虫",
    "龙"
] as const;

export const PETS: Pet[] = [
    {
        "id": 0,
        "key": "伊贝粉粉",
        "name": "伊贝粉粉",
        "form": "",
        "baseId": 3044,
        "legacyKey": "伊贝粉粉",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "植物组",
            "软体组"
        ],
        "series": [
            "草"
        ],
        "flags": 1,
        "family": "伊贝儿",
        "stage": "孵蛋目标",
        "image": "0.webp",
        "evolutionChain": [
            "伊贝儿",
            "伊贝粉粉"
        ],
        "offspringKey": "伊贝粉粉",
        "offspringReason": "",
        "maleTargets": [
            "半朽蜜果灵",
            "奇丽花",
            "小皮球",
            "幽影树",
            "格兰球",
            "炮米花",
            "燃薪虫",
            "菊花梨",
            "幻影灵菇",
            "智辉章脑"
        ],
        "femaleTargets": []
    },
    {
        "id": 1,
        "key": "公平鸽",
        "name": "公平鸽",
        "form": "",
        "baseId": 3499,
        "legacyKey": "公平鸽",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "天空组"
        ],
        "series": [
            "普通"
        ],
        "flags": 1,
        "family": "公平鸽",
        "stage": "孵蛋目标",
        "image": "1.webp",
        "evolutionChain": [
            "公平鸽"
        ],
        "offspringKey": "公平鸽",
        "offspringReason": "",
        "maleTargets": [
            "斑枭",
            "武者鸡",
            "粉耳星兔",
            "绅士鸡",
            "落陨星兔",
            "高脚鹬",
            "夜游魔",
            "星星眼"
        ],
        "femaleTargets": []
    },
    {
        "id": 2,
        "key": "利灯鱼",
        "name": "利灯鱼",
        "form": "",
        "baseId": 3383,
        "legacyKey": "利灯鱼",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "海洋组"
        ],
        "series": [
            "水",
            "电"
        ],
        "flags": 1,
        "family": "双灯鱼",
        "stage": "孵蛋目标",
        "image": "2.webp",
        "evolutionChain": [
            "双灯鱼",
            "利灯鱼"
        ],
        "offspringKey": "利灯鱼",
        "offspringReason": "",
        "maleTargets": [
            "千棘盔::3332",
            "龙鱼",
            "月亮砣::3583",
            "月亮砣::3585"
        ],
        "femaleTargets": []
    },
    {
        "id": 3,
        "key": "加油蟹",
        "name": "加油蟹",
        "form": "",
        "baseId": 3660,
        "legacyKey": "加油蟹",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "妖精组",
            "两栖组"
        ],
        "series": [
            "水",
            "萌"
        ],
        "flags": 1,
        "family": "加油海葵",
        "stage": "孵蛋目标",
        "image": "3.webp",
        "evolutionChain": [
            "加油海葵",
            "加油蟹"
        ],
        "offspringKey": "加油蟹",
        "offspringReason": "",
        "maleTargets": [
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "深渊蛙",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "玳塔",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 4,
        "key": "千棘盔::3332",
        "name": "千棘盔",
        "form": "本来的样子",
        "baseId": 3332,
        "legacyKey": "千棘盔",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "海洋组",
            "巨灵组"
        ],
        "series": [
            "水",
            "毒"
        ],
        "flags": 1,
        "family": "海盔虫",
        "stage": "孵蛋目标",
        "image": "4.webp",
        "evolutionChain": [
            "海盔虫",
            "刺盔虫",
            "千棘盔"
        ],
        "offspringKey": "千棘盔::3332",
        "offspringReason": "",
        "maleTargets": [
            "利灯鱼",
            "夜枭",
            "月牙雪熊",
            "龙鱼",
            "白金独角兽",
            "梦想三三",
            "月亮砣::3583",
            "月亮砣::3585",
            "邪眼巨魔",
            "夜游魔",
            "障眼魔",
            "玳塔"
        ],
        "femaleTargets": []
    },
    {
        "id": 5,
        "key": "千棘盔::3477",
        "name": "千棘盔",
        "form": "磨损的样子",
        "baseId": 3477,
        "legacyKey": "",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "海洋组",
            "巨灵组"
        ],
        "series": [
            "水",
            "毒"
        ],
        "flags": 1,
        "family": "海盔虫",
        "stage": "孵蛋目标",
        "image": "5.webp",
        "evolutionChain": [
            "海盔虫",
            "刺盔虫",
            "千棘盔"
        ],
        "offspringKey": "千棘盔::3332",
        "offspringReason": "磨损形态为后天形成；孵蛋后代为本来的样子",
        "maleTargets": [
            "利灯鱼",
            "千棘盔::3332",
            "夜枭",
            "月牙雪熊",
            "龙鱼",
            "白金独角兽",
            "梦想三三",
            "月亮砣::3583",
            "月亮砣::3585",
            "邪眼巨魔",
            "夜游魔",
            "障眼魔",
            "玳塔"
        ],
        "femaleTargets": []
    },
    {
        "id": 6,
        "key": "半朽蜜果灵",
        "name": "半朽蜜果灵",
        "form": "",
        "baseId": 3707,
        "legacyKey": "半朽蜜果灵",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "妖精组",
            "植物组"
        ],
        "series": [
            "幽",
            "草"
        ],
        "flags": 1,
        "family": "蜜果骸",
        "stage": "孵蛋目标",
        "image": "6.webp",
        "evolutionChain": [
            "蜜果骸",
            "半朽蜜果灵"
        ],
        "offspringKey": "半朽蜜果灵",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "加油蟹",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "奇丽花",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "炮米花",
            "燃薪虫",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "菊花梨",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "幻影灵菇",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 7,
        "key": "卡拉波斯",
        "name": "卡拉波斯",
        "form": "",
        "baseId": 3265,
        "legacyKey": "卡拉波斯",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "妖精组"
        ],
        "series": [
            "恶"
        ],
        "flags": 1,
        "family": "卡波",
        "stage": "孵蛋目标",
        "image": "7.webp",
        "evolutionChain": [
            "卡波",
            "卡拉波斯"
        ],
        "offspringKey": "卡拉波斯",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 8,
        "key": "叮叮恶魔",
        "name": "叮叮恶魔",
        "form": "",
        "baseId": 3039,
        "legacyKey": "叮叮恶魔",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "妖精组"
        ],
        "series": [
            "恶",
            "翼"
        ],
        "flags": 1,
        "family": "恶魔叮",
        "stage": "孵蛋目标",
        "image": "8.webp",
        "evolutionChain": [
            "恶魔叮",
            "叮叮恶魔"
        ],
        "offspringKey": "叮叮恶魔",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 9,
        "key": "咕德帽帽",
        "name": "咕德帽帽",
        "form": "",
        "baseId": 3684,
        "legacyKey": "咕德帽帽",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "妖精组"
        ],
        "series": [
            "幽"
        ],
        "flags": 1,
        "family": "咕咕帽",
        "stage": "孵蛋目标",
        "image": "9.webp",
        "evolutionChain": [
            "咕咕帽",
            "咕德帽帽"
        ],
        "offspringKey": "咕德帽帽",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 10,
        "key": "嘟嘟锅",
        "name": "嘟嘟锅",
        "form": "",
        "baseId": 3368,
        "legacyKey": "嘟嘟锅",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "妖精组",
            "大地组"
        ],
        "series": [
            "毒"
        ],
        "flags": 1,
        "family": "嘟嘟煲",
        "stage": "孵蛋目标",
        "image": "10.webp",
        "evolutionChain": [
            "嘟嘟煲",
            "嘟嘟锅"
        ],
        "offspringKey": "嘟嘟锅",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "霹雳迪迪",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "星星眼",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 11,
        "key": "壳栗丝鼠",
        "name": "壳栗丝鼠",
        "form": "",
        "baseId": 3566,
        "legacyKey": "壳栗丝鼠",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "动物组"
        ],
        "series": [
            "毒",
            "普通"
        ],
        "flags": 1,
        "family": "栗鼠",
        "stage": "孵蛋目标",
        "image": "11.webp",
        "evolutionChain": [
            "栗鼠",
            "壳栗丝鼠"
        ],
        "offspringKey": "壳栗丝鼠",
        "offspringReason": "",
        "maleTargets": [
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 12,
        "key": "夜枭",
        "name": "夜枭",
        "form": "",
        "baseId": 3150,
        "legacyKey": "夜枭",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "魔力组",
            "巨灵组"
        ],
        "series": [
            "幽"
        ],
        "flags": 1,
        "family": "空空颅",
        "stage": "孵蛋目标",
        "image": "12.webp",
        "evolutionChain": [
            "空空颅",
            "夜宿颅",
            "夜枭"
        ],
        "offspringKey": "夜枭",
        "offspringReason": "",
        "maleTargets": [
            "千棘盔::3332",
            "月牙雪熊",
            "烟花伯爵",
            "白金独角兽",
            "幻影灵菇",
            "梦想三三",
            "邪眼巨魔",
            "夜游魔",
            "障眼魔",
            "未完虫",
            "玳塔",
            "摇铃魔偶"
        ],
        "femaleTargets": []
    },
    {
        "id": 13,
        "key": "奇丽花",
        "name": "奇丽花",
        "form": "",
        "baseId": 3031,
        "legacyKey": "奇丽花",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "植物组"
        ],
        "series": [
            "草"
        ],
        "flags": 1,
        "family": "奇丽草",
        "stage": "孵蛋目标",
        "image": "13.webp",
        "evolutionChain": [
            "奇丽草",
            "奇丽叶",
            "奇丽花",
            "奇丽果"
        ],
        "offspringKey": "奇丽花",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "半朽蜜果灵",
            "幽影树",
            "格兰球",
            "炮米花",
            "燃薪虫",
            "菊花梨",
            "幻影灵菇"
        ],
        "femaleTargets": []
    },
    {
        "id": 14,
        "key": "小丑公爵",
        "name": "小丑公爵",
        "form": "",
        "baseId": 3489,
        "legacyKey": "小丑公爵",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "妖精组",
            "拟人组"
        ],
        "series": [
            "恶"
        ],
        "flags": 1,
        "family": "小丑豆豆",
        "stage": "孵蛋目标",
        "image": "14.webp",
        "evolutionChain": [
            "小丑豆豆",
            "小丑兔",
            "小丑公爵"
        ],
        "offspringKey": "小丑公爵",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "徘徊爪爪",
            "朔夜伊芙",
            "格兰球",
            "武者鸡",
            "流明坎德拉",
            "深渊蛙",
            "炮米花",
            "稻草守护者",
            "立方人",
            "粉耳星兔",
            "红绒十字",
            "绅士鸡",
            "花衣蝶",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "黑手浣熊",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 15,
        "key": "小皮球",
        "name": "小皮球",
        "form": "",
        "baseId": 3199,
        "legacyKey": "小皮球",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "妖精组",
            "软体组"
        ],
        "series": [
            "电",
            "幻"
        ],
        "flags": 1,
        "family": "粉粉星",
        "stage": "孵蛋目标",
        "image": "15.webp",
        "evolutionChain": [
            "粉粉星",
            "小皮球"
        ],
        "offspringKey": "小皮球",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 16,
        "key": "尖嘴狐仙",
        "name": "尖嘴狐仙",
        "form": "",
        "baseId": 3077,
        "legacyKey": "尖嘴狐仙",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "动物组"
        ],
        "series": [
            "火",
            "冰"
        ],
        "flags": 1,
        "family": "灵狐",
        "stage": "孵蛋目标",
        "image": "16.webp",
        "evolutionChain": [
            "灵狐",
            "九尾狐",
            "尖嘴狐仙"
        ],
        "offspringKey": "尖嘴狐仙",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 17,
        "key": "巨鼓象",
        "name": "巨鼓象",
        "form": "",
        "baseId": 3709,
        "legacyKey": "巨鼓象",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "动物组",
            "机械组"
        ],
        "series": [
            "机械"
        ],
        "flags": 1,
        "family": "小鼓象",
        "stage": "孵蛋目标",
        "image": "17.webp",
        "evolutionChain": [
            "小鼓象",
            "巨鼓象"
        ],
        "offspringKey": "巨鼓象",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "尖嘴狐仙",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "烟花伯爵",
            "獠牙猪",
            "立方人",
            "红绒十字",
            "贝古斯",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "飞飞钥",
            "测风蝉",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 18,
        "key": "帅帅魔偶",
        "name": "帅帅魔偶",
        "form": "",
        "baseId": 3235,
        "legacyKey": "帅帅魔偶",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "妖精组",
            "拟人组"
        ],
        "series": [
            "幻"
        ],
        "flags": 1,
        "family": "牵线木偶",
        "stage": "孵蛋目标",
        "image": "18.webp",
        "evolutionChain": [
            "牵线木偶",
            "帅帅魔偶"
        ],
        "offspringKey": "帅帅魔偶",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "幽影树",
            "徘徊爪爪",
            "朔夜伊芙",
            "格兰球",
            "武者鸡",
            "流明坎德拉",
            "深渊蛙",
            "炮米花",
            "稻草守护者",
            "立方人",
            "粉耳星兔",
            "红绒十字",
            "绅士鸡",
            "花衣蝶",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "黑手浣熊",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 19,
        "key": "幽影树",
        "name": "幽影树",
        "form": "",
        "baseId": 3064,
        "legacyKey": "幽影树",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "植物组",
            "妖精组"
        ],
        "series": [
            "幽",
            "草"
        ],
        "flags": 1,
        "family": "幽影树",
        "stage": "孵蛋目标",
        "image": "19.webp",
        "evolutionChain": [
            "幽影树"
        ],
        "offspringKey": "幽影树",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "奇丽花",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "炮米花",
            "燃薪虫",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "菊花梨",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "幻影灵菇",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 20,
        "key": "徘徊爪爪",
        "name": "徘徊爪爪",
        "form": "",
        "baseId": 3362,
        "legacyKey": "徘徊爪爪",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "动物组",
            "拟人组"
        ],
        "series": [
            "萌",
            "毒"
        ],
        "flags": 1,
        "family": "蝴蝶陶陶",
        "stage": "孵蛋目标",
        "image": "20.webp",
        "evolutionChain": [
            "蝴蝶陶陶",
            "铆钉毛毛",
            "徘徊爪爪"
        ],
        "offspringKey": "徘徊爪爪",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "小丑公爵",
            "尖嘴狐仙",
            "巨鼓象",
            "帅帅魔偶",
            "恶魔狼",
            "月牙雪熊",
            "朔夜伊芙",
            "武者鸡",
            "深渊蛙",
            "炮米花",
            "獠牙猪",
            "立方人",
            "红绒十字",
            "绅士鸡",
            "花衣蝶",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "雪影娃娃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 21,
        "key": "恶魔狼",
        "name": "恶魔狼",
        "form": "",
        "baseId": 3011,
        "legacyKey": "恶魔狼",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "动物组"
        ],
        "series": [
            "恶"
        ],
        "flags": 1,
        "family": "恶魔狼",
        "stage": "孵蛋目标",
        "image": "21.webp",
        "evolutionChain": [
            "恶魔狼",
            "恶魔狼王"
        ],
        "offspringKey": "恶魔狼",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 22,
        "key": "斑枭",
        "name": "斑枭",
        "form": "",
        "baseId": 3535,
        "legacyKey": "斑枭",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "天空组"
        ],
        "series": [
            "翼"
        ],
        "flags": 1,
        "family": "斑斑",
        "stage": "孵蛋目标",
        "image": "22.webp",
        "evolutionChain": [
            "斑斑",
            "斑枭"
        ],
        "offspringKey": "斑枭",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "武者鸡",
            "粉耳星兔",
            "绅士鸡",
            "落陨星兔",
            "高脚鹬",
            "夜游魔",
            "星星眼"
        ],
        "femaleTargets": []
    },
    {
        "id": 23,
        "key": "月牙雪熊",
        "name": "月牙雪熊",
        "form": "",
        "baseId": 3457,
        "legacyKey": "月牙雪熊",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "动物组",
            "巨灵组"
        ],
        "series": [
            "冰",
            "幻"
        ],
        "flags": 1,
        "family": "月牙雪熊",
        "stage": "孵蛋目标",
        "image": "23.webp",
        "evolutionChain": [
            "月牙雪熊"
        ],
        "offspringKey": "月牙雪熊",
        "offspringReason": "",
        "maleTargets": [
            "千棘盔::3332",
            "壳栗丝鼠",
            "夜枭",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "邪眼巨魔",
            "夜游魔",
            "障眼魔",
            "玳塔",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 24,
        "key": "朔夜伊芙",
        "name": "朔夜伊芙",
        "form": "",
        "baseId": 3144,
        "legacyKey": "朔夜伊芙",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "拟人组",
            "妖精组"
        ],
        "series": [
            "恶"
        ],
        "flags": 1,
        "family": "小夜",
        "stage": "孵蛋目标",
        "image": "24.webp",
        "evolutionChain": [
            "小夜",
            "紫夜",
            "朔夜伊芙"
        ],
        "offspringKey": "朔夜伊芙",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "徘徊爪爪",
            "格兰球",
            "武者鸡",
            "流明坎德拉",
            "深渊蛙",
            "炮米花",
            "稻草守护者",
            "立方人",
            "粉耳星兔",
            "红绒十字",
            "绅士鸡",
            "花衣蝶",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "黑手浣熊",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 25,
        "key": "格兰球",
        "name": "格兰球",
        "form": "",
        "baseId": 3074,
        "legacyKey": "格兰球",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "植物组",
            "妖精组"
        ],
        "series": [
            "草"
        ],
        "flags": 1,
        "family": "格兰种子",
        "stage": "孵蛋目标",
        "image": "25.webp",
        "evolutionChain": [
            "格兰种子",
            "格兰花",
            "格兰球"
        ],
        "offspringKey": "格兰球",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "奇丽花",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "流明坎德拉",
            "炮米花",
            "燃薪虫",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "菊花梨",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "幻影灵菇",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 26,
        "key": "武者鸡",
        "name": "武者鸡",
        "form": "",
        "baseId": 3089,
        "legacyKey": "武者鸡",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "天空组",
            "拟人组"
        ],
        "series": [
            "火",
            "武"
        ],
        "flags": 1,
        "family": "可立鸡",
        "stage": "孵蛋目标",
        "image": "26.webp",
        "evolutionChain": [
            "可立鸡",
            "晕晕鸡",
            "绅士鸡",
            "武者鸡"
        ],
        "offspringKey": "武者鸡",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "小丑公爵",
            "帅帅魔偶",
            "徘徊爪爪",
            "斑枭",
            "朔夜伊芙",
            "深渊蛙",
            "炮米花",
            "立方人",
            "粉耳星兔",
            "绅士鸡",
            "花衣蝶",
            "落陨星兔",
            "雪影娃娃",
            "高脚鹬",
            "夜游魔",
            "黑手浣熊",
            "星星眼"
        ],
        "femaleTargets": []
    },
    {
        "id": 27,
        "key": "流明坎德拉",
        "name": "流明坎德拉",
        "form": "",
        "baseId": 3676,
        "legacyKey": "流明坎德拉",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "妖精组"
        ],
        "series": [
            "火",
            "光"
        ],
        "flags": 1,
        "family": "守夜烛",
        "stage": "孵蛋目标",
        "image": "27.webp",
        "evolutionChain": [
            "守夜烛",
            "流明坎德拉"
        ],
        "offspringKey": "流明坎德拉",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 28,
        "key": "深渊蛙",
        "name": "深渊蛙",
        "form": "",
        "baseId": 3593,
        "legacyKey": "深渊蛙",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "两栖组",
            "拟人组"
        ],
        "series": [
            "水",
            "武"
        ],
        "flags": 1,
        "family": "十字蝌蚪",
        "stage": "孵蛋目标",
        "image": "28.webp",
        "evolutionChain": [
            "十字蝌蚪",
            "十字蛙",
            "深渊蛙"
        ],
        "offspringKey": "深渊蛙",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "小丑公爵",
            "帅帅魔偶",
            "徘徊爪爪",
            "朔夜伊芙",
            "武者鸡",
            "炮米花",
            "立方人",
            "绅士鸡",
            "花衣蝶",
            "雪影娃娃",
            "玳塔",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 29,
        "key": "炮米花",
        "name": "炮米花",
        "form": "",
        "baseId": 3760,
        "legacyKey": "炮米花",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "植物组",
            "拟人组"
        ],
        "series": [
            "草",
            "火"
        ],
        "flags": 1,
        "family": "苞米仔",
        "stage": "孵蛋目标",
        "image": "29.webp",
        "evolutionChain": [
            "苞米仔",
            "炮米花"
        ],
        "offspringKey": "炮米花",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "半朽蜜果灵",
            "奇丽花",
            "小丑公爵",
            "帅帅魔偶",
            "幽影树",
            "徘徊爪爪",
            "朔夜伊芙",
            "格兰球",
            "武者鸡",
            "深渊蛙",
            "燃薪虫",
            "立方人",
            "绅士鸡",
            "花衣蝶",
            "菊花梨",
            "雪影娃娃",
            "幻影灵菇",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 30,
        "key": "烟花伯爵",
        "name": "烟花伯爵",
        "form": "",
        "baseId": 3678,
        "legacyKey": "烟花伯爵",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "机械组",
            "魔力组"
        ],
        "series": [
            "火",
            "毒"
        ],
        "flags": 1,
        "family": "烟花团",
        "stage": "孵蛋目标",
        "image": "30.webp",
        "evolutionChain": [
            "烟花团",
            "烟花伯爵"
        ],
        "offspringKey": "烟花伯爵",
        "offspringReason": "",
        "maleTargets": [
            "夜枭",
            "巨鼓象",
            "立方人",
            "贝古斯",
            "音碟吼",
            "幻影灵菇",
            "飞飞钥",
            "未完虫",
            "测风蝉",
            "摇铃魔偶"
        ],
        "femaleTargets": []
    },
    {
        "id": 31,
        "key": "燃薪虫",
        "name": "燃薪虫",
        "form": "",
        "baseId": 3437,
        "legacyKey": "燃薪虫",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "昆虫组",
            "植物组"
        ],
        "series": [
            "火",
            "草"
        ],
        "flags": 1,
        "family": "柴渣虫",
        "stage": "孵蛋目标",
        "image": "31.webp",
        "evolutionChain": [
            "柴渣虫",
            "燃薪虫"
        ],
        "offspringKey": "燃薪虫",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "半朽蜜果灵",
            "奇丽花",
            "幽影树",
            "格兰球",
            "炮米花",
            "窃光蚊",
            "花衣蝶",
            "菊花梨",
            "幻影灵菇",
            "飞飞钥",
            "邪眼巨魔",
            "未完虫",
            "测风蝉"
        ],
        "femaleTargets": []
    },
    {
        "id": 32,
        "key": "爆焰喷喷",
        "name": "爆焰喷喷",
        "form": "",
        "baseId": 3573,
        "legacyKey": "爆焰喷喷",
        "season": "S2狂欢怪谈",
        "availability": "battle-pass",
        "availabilityReason": "S2狂欢怪谈战令异色",
        "groups": [],
        "series": [
            "火",
            "龙"
        ],
        "flags": 18,
        "family": "爆焰仔",
        "stage": "孵蛋目标",
        "image": "32.webp",
        "evolutionChain": [
            "爆焰仔",
            "爆焰喷喷"
        ],
        "offspringKey": "爆焰喷喷",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 33,
        "key": "獠牙猪",
        "name": "獠牙猪",
        "form": "",
        "baseId": 3263,
        "legacyKey": "獠牙猪",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "动物组"
        ],
        "series": [
            "冰",
            "地"
        ],
        "flags": 1,
        "family": "呼呼猪",
        "stage": "孵蛋目标",
        "image": "33.webp",
        "evolutionChain": [
            "呼呼猪",
            "獠牙猪"
        ],
        "offspringKey": "獠牙猪",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 34,
        "key": "疾光千兽",
        "name": "疾光千兽",
        "form": "",
        "baseId": 3311,
        "legacyKey": "疾光千兽",
        "season": "S1暗夜拾光",
        "availability": "battle-pass",
        "availabilityReason": "S1暗夜拾光战令异色",
        "groups": [],
        "series": [
            "光"
        ],
        "flags": 18,
        "family": "犀角鸟",
        "stage": "孵蛋目标",
        "image": "34.webp",
        "evolutionChain": [
            "犀角鸟",
            "光纤兽",
            "疾光千兽"
        ],
        "offspringKey": "疾光千兽",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 35,
        "key": "离心舞者",
        "name": "离心舞者",
        "form": "",
        "baseId": 3719,
        "legacyKey": "离心舞者",
        "season": "S3铅字幻梦",
        "availability": "battle-pass",
        "availabilityReason": "S3铅字幻梦战令异色",
        "groups": [],
        "series": [
            "幻",
            "机械"
        ],
        "flags": 18,
        "family": "足尖元件",
        "stage": "孵蛋目标",
        "image": "35.webp",
        "evolutionChain": [
            "足尖元件",
            "离心舞者"
        ],
        "offspringKey": "离心舞者",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 36,
        "key": "稻草守护者",
        "name": "稻草守护者",
        "form": "",
        "baseId": 3698,
        "legacyKey": "稻草守护者",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "妖精组"
        ],
        "series": [
            "萌",
            "武"
        ],
        "flags": 1,
        "family": "稻草人",
        "stage": "孵蛋目标",
        "image": "36.webp",
        "evolutionChain": [
            "稻草人",
            "稻草守护者"
        ],
        "offspringKey": "稻草守护者",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 37,
        "key": "窃光蚊",
        "name": "窃光蚊",
        "form": "",
        "baseId": 3615,
        "legacyKey": "窃光蚊",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "昆虫组"
        ],
        "series": [
            "恶",
            "光"
        ],
        "flags": 1,
        "family": "嗜光嗡嗡",
        "stage": "孵蛋目标",
        "image": "37.webp",
        "evolutionChain": [
            "嗜光嗡嗡",
            "窃光蚊"
        ],
        "offspringKey": "窃光蚊",
        "offspringReason": "",
        "maleTargets": [
            "燃薪虫",
            "花衣蝶",
            "飞飞钥",
            "邪眼巨魔",
            "未完虫",
            "测风蝉"
        ],
        "femaleTargets": []
    },
    {
        "id": 38,
        "key": "立方人",
        "name": "立方人",
        "form": "",
        "baseId": 3202,
        "legacyKey": "立方人",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "机械组",
            "拟人组"
        ],
        "series": [
            "机械"
        ],
        "flags": 1,
        "family": "机械方方",
        "stage": "孵蛋目标",
        "image": "38.webp",
        "evolutionChain": [
            "机械方方",
            "多彩方方",
            "立方人"
        ],
        "offspringKey": "立方人",
        "offspringReason": "",
        "maleTargets": [
            "小丑公爵",
            "巨鼓象",
            "帅帅魔偶",
            "徘徊爪爪",
            "朔夜伊芙",
            "武者鸡",
            "深渊蛙",
            "炮米花",
            "烟花伯爵",
            "绅士鸡",
            "花衣蝶",
            "贝古斯",
            "雪影娃娃",
            "音碟吼",
            "飞飞钥",
            "测风蝉",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 39,
        "key": "粉耳星兔",
        "name": "粉耳星兔",
        "form": "",
        "baseId": 3320,
        "legacyKey": "粉耳星兔",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "妖精组",
            "天空组"
        ],
        "series": [
            "幻"
        ],
        "flags": 1,
        "family": "粉星仔",
        "stage": "孵蛋目标",
        "image": "39.webp",
        "evolutionChain": [
            "粉星仔",
            "粉耳星兔",
            "落陨星兔"
        ],
        "offspringKey": "粉耳星兔",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "斑枭",
            "朔夜伊芙",
            "格兰球",
            "武者鸡",
            "流明坎德拉",
            "稻草守护者",
            "红绒十字",
            "绅士鸡",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "高脚鹬",
            "黑猫巫师",
            "夜游魔",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "星星眼",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 40,
        "key": "红绒十字",
        "name": "红绒十字",
        "form": "",
        "baseId": 3350,
        "legacyKey": "红绒十字",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "动物组",
            "妖精组"
        ],
        "series": [
            "火",
            "萌"
        ],
        "flags": 1,
        "family": "治愈兔",
        "stage": "孵蛋目标",
        "image": "40.webp",
        "evolutionChain": [
            "治愈兔",
            "红丝绒",
            "红绒十字"
        ],
        "offspringKey": "红绒十字",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "壳栗丝鼠",
            "小丑公爵",
            "小皮球",
            "尖嘴狐仙",
            "巨鼓象",
            "帅帅魔偶",
            "幽影树",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "獠牙猪",
            "稻草守护者",
            "粉耳星兔",
            "落陨星兔",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "酷拉",
            "雅丹鬃",
            "雪影娃娃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "障眼魔",
            "智辉章脑",
            "黑手浣熊",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 41,
        "key": "绅士鸡",
        "name": "绅士鸡",
        "form": "",
        "baseId": 3088,
        "legacyKey": "绅士鸡",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "天空组",
            "拟人组"
        ],
        "series": [
            "火",
            "武"
        ],
        "flags": 1,
        "family": "可立鸡",
        "stage": "孵蛋目标",
        "image": "41.webp",
        "evolutionChain": [
            "可立鸡",
            "晕晕鸡",
            "绅士鸡",
            "武者鸡"
        ],
        "offspringKey": "绅士鸡",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "小丑公爵",
            "帅帅魔偶",
            "徘徊爪爪",
            "斑枭",
            "朔夜伊芙",
            "武者鸡",
            "深渊蛙",
            "炮米花",
            "立方人",
            "粉耳星兔",
            "花衣蝶",
            "落陨星兔",
            "雪影娃娃",
            "高脚鹬",
            "夜游魔",
            "黑手浣熊",
            "星星眼"
        ],
        "femaleTargets": []
    },
    {
        "id": 42,
        "key": "绒仙子",
        "name": "绒仙子",
        "form": "",
        "baseId": 3246,
        "legacyKey": "绒仙子",
        "season": "S1暗夜拾光",
        "availability": "battle-pass",
        "availabilityReason": "S1暗夜拾光战令异色",
        "groups": [],
        "series": [
            "光",
            "虫"
        ],
        "flags": 18,
        "family": "绒绒",
        "stage": "孵蛋目标",
        "image": "42.webp",
        "evolutionChain": [
            "绒绒",
            "小绒茧",
            "绒仙子"
        ],
        "offspringKey": "绒仙子",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 43,
        "key": "胡桃王子",
        "name": "胡桃王子",
        "form": "",
        "baseId": 3711,
        "legacyKey": "胡桃王子",
        "season": "S3铅字幻梦",
        "availability": "battle-pass",
        "availabilityReason": "S3铅字幻梦战令异色",
        "groups": [],
        "series": [
            "机械"
        ],
        "flags": 18,
        "family": "咬咬小子",
        "stage": "孵蛋目标",
        "image": "43.webp",
        "evolutionChain": [
            "咬咬小子",
            "胡桃王子"
        ],
        "offspringKey": "胡桃王子",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 44,
        "key": "花衣蝶",
        "name": "花衣蝶",
        "form": "",
        "baseId": 3141,
        "legacyKey": "花衣蝶",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "昆虫组",
            "拟人组"
        ],
        "series": [
            "虫",
            "草"
        ],
        "flags": 1,
        "family": "小草虫",
        "stage": "孵蛋目标",
        "image": "44.webp",
        "evolutionChain": [
            "小草虫",
            "草衣虫",
            "花衣蝶"
        ],
        "offspringKey": "花衣蝶",
        "offspringReason": "",
        "maleTargets": [
            "小丑公爵",
            "帅帅魔偶",
            "徘徊爪爪",
            "朔夜伊芙",
            "武者鸡",
            "深渊蛙",
            "炮米花",
            "燃薪虫",
            "窃光蚊",
            "立方人",
            "绅士鸡",
            "雪影娃娃",
            "飞飞钥",
            "邪眼巨魔",
            "未完虫",
            "测风蝉",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 45,
        "key": "菊花梨",
        "name": "菊花梨",
        "form": "",
        "baseId": 3227,
        "legacyKey": "菊花梨",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "植物组"
        ],
        "series": [
            "萌"
        ],
        "flags": 1,
        "family": "菊花梨",
        "stage": "孵蛋目标",
        "image": "45.webp",
        "evolutionChain": [
            "菊花梨"
        ],
        "offspringKey": "菊花梨",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "半朽蜜果灵",
            "奇丽花",
            "幽影树",
            "格兰球",
            "炮米花",
            "燃薪虫",
            "幻影灵菇"
        ],
        "femaleTargets": []
    },
    {
        "id": 46,
        "key": "落陨星兔",
        "name": "落陨星兔",
        "form": "",
        "baseId": 3485,
        "legacyKey": "落陨星兔",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "妖精组",
            "天空组"
        ],
        "series": [
            "幻",
            "幽"
        ],
        "flags": 1,
        "family": "粉星仔",
        "stage": "孵蛋目标",
        "image": "46.webp",
        "evolutionChain": [
            "粉星仔",
            "粉耳星兔",
            "落陨星兔"
        ],
        "offspringKey": "落陨星兔",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "斑枭",
            "朔夜伊芙",
            "格兰球",
            "武者鸡",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "绅士鸡",
            "酷拉",
            "雪影娃娃",
            "高脚鹬",
            "黑猫巫师",
            "夜游魔",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "星星眼",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 47,
        "key": "贝古斯",
        "name": "贝古斯",
        "form": "",
        "baseId": 3205,
        "legacyKey": "贝古斯",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "机械组"
        ],
        "series": [
            "机械",
            "火"
        ],
        "flags": 1,
        "family": "贝瑟",
        "stage": "孵蛋目标",
        "image": "47.webp",
        "evolutionChain": [
            "贝瑟",
            "贝加尔",
            "贝古斯"
        ],
        "offspringKey": "贝古斯",
        "offspringReason": "",
        "maleTargets": [
            "巨鼓象",
            "烟花伯爵",
            "立方人",
            "音碟吼",
            "飞飞钥",
            "测风蝉"
        ],
        "femaleTargets": []
    },
    {
        "id": 48,
        "key": "遁地鼠::3022",
        "name": "遁地鼠",
        "form": "枯水期的样子",
        "baseId": 3022,
        "legacyKey": "",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "动物组"
        ],
        "series": [
            "地"
        ],
        "flags": 1,
        "family": "地鼠",
        "stage": "孵蛋目标",
        "image": "48.webp",
        "evolutionChain": [
            "地鼠",
            "遁鼠",
            "遁地鼠"
        ],
        "offspringKey": "遁地鼠::3022",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 49,
        "key": "遁地鼠::3456",
        "name": "遁地鼠",
        "form": "储水时的样子",
        "baseId": 3456,
        "legacyKey": "遁地鼠",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "动物组"
        ],
        "series": [
            "地"
        ],
        "flags": 1,
        "family": "地鼠",
        "stage": "孵蛋目标",
        "image": "49.webp",
        "evolutionChain": [
            "地鼠",
            "遁鼠",
            "遁地鼠"
        ],
        "offspringKey": "遁地鼠::3456",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 50,
        "key": "酷拉",
        "name": "酷拉",
        "form": "",
        "baseId": 3189,
        "legacyKey": "酷拉",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "妖精组"
        ],
        "series": [
            "电"
        ],
        "flags": 1,
        "family": "拉特",
        "stage": "孵蛋目标",
        "image": "50.webp",
        "evolutionChain": [
            "拉特",
            "酷拉"
        ],
        "offspringKey": "酷拉",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 51,
        "key": "雅丹鬃",
        "name": "雅丹鬃",
        "form": "",
        "baseId": 3745,
        "legacyKey": "雅丹鬃",
        "season": "S1暗夜拾光",
        "availability": "permanent",
        "availabilityReason": "常驻捕捉触发",
        "groups": [
            "动物组"
        ],
        "series": [
            "火"
        ],
        "flags": 1,
        "family": "火红尾",
        "stage": "孵蛋目标",
        "image": "51.webp",
        "evolutionChain": [
            "火红尾",
            "雅丹鬃"
        ],
        "offspringKey": "雅丹鬃",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 52,
        "key": "雪影娃娃",
        "name": "雪影娃娃",
        "form": "",
        "baseId": 3123,
        "legacyKey": "雪影娃娃",
        "season": "S1暗夜拾光",
        "availability": "season-limited",
        "availabilityReason": "S1暗夜拾光赛季限时异色",
        "groups": [
            "妖精组",
            "拟人组"
        ],
        "series": [
            "冰",
            "萌"
        ],
        "flags": 5,
        "family": "大耳帽兜",
        "stage": "孵蛋目标",
        "image": "52.webp",
        "evolutionChain": [
            "大耳帽兜",
            "帽兜娃娃",
            "雪影娃娃",
            "雪影冰灵"
        ],
        "offspringKey": "雪影娃娃",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 53,
        "key": "雪怪",
        "name": "雪怪",
        "form": "",
        "baseId": 3532,
        "legacyKey": "雪怪",
        "season": "S2狂欢怪谈",
        "availability": "battle-pass",
        "availabilityReason": "S2狂欢怪谈战令异色",
        "groups": [],
        "series": [
            "冰"
        ],
        "flags": 18,
        "family": "小雪人",
        "stage": "孵蛋目标",
        "image": "53.webp",
        "evolutionChain": [
            "小雪人",
            "雪怪"
        ],
        "offspringKey": "雪怪",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 54,
        "key": "霹雳迪迪",
        "name": "霹雳迪迪",
        "form": "",
        "baseId": 3737,
        "legacyKey": "霹雳迪迪",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "动物组",
            "大地组"
        ],
        "series": [
            "电",
            "光"
        ],
        "flags": 1,
        "family": "炫光迪迪",
        "stage": "孵蛋目标",
        "image": "54.webp",
        "evolutionChain": [
            "炫光迪迪",
            "霹雳迪迪"
        ],
        "offspringKey": "霹雳迪迪",
        "offspringReason": "",
        "maleTargets": [
            "嘟嘟锅",
            "壳栗丝鼠",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "黑手浣熊",
            "星星眼"
        ],
        "femaleTargets": []
    },
    {
        "id": 55,
        "key": "音碟吼",
        "name": "音碟吼",
        "form": "",
        "baseId": 3730,
        "legacyKey": "音碟吼",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "动物组",
            "机械组"
        ],
        "series": [
            "普通",
            "机械"
        ],
        "flags": 1,
        "family": "猴麦仔",
        "stage": "孵蛋目标",
        "image": "55.webp",
        "evolutionChain": [
            "猴麦仔",
            "音碟吼"
        ],
        "offspringKey": "音碟吼",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "烟花伯爵",
            "獠牙猪",
            "立方人",
            "红绒十字",
            "贝古斯",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "飞飞钥",
            "测风蝉",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 56,
        "key": "高脚鹬",
        "name": "高脚鹬",
        "form": "",
        "baseId": 3252,
        "legacyKey": "高脚鹬",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "天空组"
        ],
        "series": [
            "翼"
        ],
        "flags": 1,
        "family": "小鹬",
        "stage": "孵蛋目标",
        "image": "56.webp",
        "evolutionChain": [
            "小鹬",
            "鄙目鹬",
            "高脚鹬"
        ],
        "offspringKey": "高脚鹬",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "斑枭",
            "武者鸡",
            "粉耳星兔",
            "绅士鸡",
            "落陨星兔",
            "夜游魔",
            "星星眼"
        ],
        "femaleTargets": []
    },
    {
        "id": 57,
        "key": "龙鱼",
        "name": "龙鱼",
        "form": "",
        "baseId": 3386,
        "legacyKey": "龙鱼",
        "season": "S3铅字幻梦",
        "availability": "season-limited",
        "availabilityReason": "S3铅字幻梦赛季限时异色",
        "groups": [
            "海洋组",
            "龙组"
        ],
        "series": [
            "水",
            "龙"
        ],
        "flags": 1,
        "family": "豆丁鱼",
        "stage": "孵蛋目标",
        "image": "57.webp",
        "evolutionChain": [
            "豆丁鱼",
            "快鳍鱼",
            "龙鱼"
        ],
        "offspringKey": "龙鱼",
        "offspringReason": "",
        "maleTargets": [
            "利灯鱼",
            "千棘盔::3332",
            "月亮砣::3583",
            "月亮砣::3585"
        ],
        "femaleTargets": []
    },
    {
        "id": 58,
        "key": "白金独角兽",
        "name": "白金独角兽",
        "form": "",
        "baseId": 3063,
        "legacyKey": "白金独角兽",
        "season": "S2狂欢怪谈",
        "availability": "season-limited",
        "availabilityReason": "S2狂欢怪谈赛季限时异色",
        "groups": [
            "动物组",
            "巨灵组"
        ],
        "series": [
            "光"
        ],
        "flags": 1,
        "family": "小独角兽",
        "stage": "最终形态",
        "image": "58.webp",
        "evolutionChain": [
            "小独角兽",
            "白金独角兽"
        ],
        "offspringKey": "白金独角兽",
        "offspringReason": "",
        "maleTargets": [
            "千棘盔::3332",
            "壳栗丝鼠",
            "夜枭",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "黑猫巫师",
            "梦想三三",
            "邪眼巨魔",
            "夜游魔",
            "障眼魔",
            "玳塔",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 59,
        "key": "幻影灵菇",
        "name": "幻影灵菇",
        "form": "",
        "baseId": 3147,
        "legacyKey": "幻影灵菇",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "植物组",
            "魔力组"
        ],
        "series": [
            "幽",
            "草"
        ],
        "flags": 1,
        "family": "小灵菇",
        "stage": "最终形态",
        "image": "59.webp",
        "evolutionChain": [
            "小灵菇",
            "幻灵菇",
            "幻影灵菇"
        ],
        "offspringKey": "幻影灵菇",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "半朽蜜果灵",
            "夜枭",
            "奇丽花",
            "幽影树",
            "格兰球",
            "炮米花",
            "烟花伯爵",
            "燃薪虫",
            "菊花梨",
            "未完虫",
            "摇铃魔偶"
        ],
        "femaleTargets": []
    },
    {
        "id": 60,
        "key": "黑猫巫师",
        "name": "黑猫巫师",
        "form": "",
        "baseId": 3569,
        "legacyKey": "黑猫巫师",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "动物组",
            "妖精组"
        ],
        "series": [
            "普通"
        ],
        "flags": 1,
        "family": "小黑猫",
        "stage": "最终形态",
        "image": "60.webp",
        "evolutionChain": [
            "小黑猫",
            "黑猫巫师"
        ],
        "offspringKey": "黑猫巫师",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "壳栗丝鼠",
            "小丑公爵",
            "小皮球",
            "尖嘴狐仙",
            "巨鼓象",
            "帅帅魔偶",
            "幽影树",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "獠牙猪",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "酷拉",
            "雅丹鬃",
            "雪影娃娃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "梦想三三",
            "障眼魔",
            "智辉章脑",
            "黑手浣熊",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 61,
        "key": "梦想三三",
        "name": "梦想三三",
        "form": "",
        "baseId": 3375,
        "legacyKey": "梦想三三",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "动物组",
            "巨灵组"
        ],
        "series": [
            "萌"
        ],
        "flags": 1,
        "family": "逗逗",
        "stage": "最终形态",
        "image": "61.webp",
        "evolutionChain": [
            "逗逗",
            "气球猫",
            "梦想三三"
        ],
        "offspringKey": "梦想三三",
        "offspringReason": "",
        "maleTargets": [
            "千棘盔::3332",
            "壳栗丝鼠",
            "夜枭",
            "尖嘴狐仙",
            "巨鼓象",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "獠牙猪",
            "红绒十字",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "邪眼巨魔",
            "夜游魔",
            "障眼魔",
            "玳塔",
            "黑手浣熊"
        ],
        "femaleTargets": []
    },
    {
        "id": 62,
        "key": "月亮砣::3583",
        "name": "月亮砣",
        "form": "上弦的样子",
        "baseId": 3583,
        "legacyKey": "月亮砣",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "海洋组"
        ],
        "series": [
            "毒",
            "萌"
        ],
        "flags": 1,
        "family": "刺轮砣",
        "stage": "最终形态",
        "image": "62.webp",
        "evolutionChain": [
            "刺轮砣",
            "月亮砣"
        ],
        "offspringKey": "月亮砣::3583",
        "offspringReason": "",
        "maleTargets": [
            "利灯鱼",
            "千棘盔::3332",
            "龙鱼",
            "月亮砣::3585"
        ],
        "femaleTargets": []
    },
    {
        "id": 63,
        "key": "月亮砣::3585",
        "name": "月亮砣",
        "form": "下弦的样子",
        "baseId": 3585,
        "legacyKey": "月亮砣",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "海洋组"
        ],
        "series": [
            "毒",
            "萌"
        ],
        "flags": 1,
        "family": "刺轮砣",
        "stage": "最终形态",
        "image": "63.webp",
        "evolutionChain": [
            "刺轮砣",
            "月亮砣"
        ],
        "offspringKey": "月亮砣::3585",
        "offspringReason": "",
        "maleTargets": [
            "利灯鱼",
            "千棘盔::3332",
            "龙鱼",
            "月亮砣::3583"
        ],
        "femaleTargets": []
    },
    {
        "id": 64,
        "key": "飞飞钥",
        "name": "飞飞钥",
        "form": "",
        "baseId": 3753,
        "legacyKey": "飞飞钥",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "昆虫组",
            "机械组"
        ],
        "series": [
            "机械",
            "虫"
        ],
        "flags": 1,
        "family": "叮叮卯",
        "stage": "最终形态",
        "image": "64.webp",
        "evolutionChain": [
            "叮叮卯",
            "飞飞钥"
        ],
        "offspringKey": "飞飞钥",
        "offspringReason": "",
        "maleTargets": [
            "巨鼓象",
            "烟花伯爵",
            "燃薪虫",
            "窃光蚊",
            "立方人",
            "花衣蝶",
            "贝古斯",
            "音碟吼",
            "邪眼巨魔",
            "未完虫",
            "测风蝉"
        ],
        "femaleTargets": []
    },
    {
        "id": 65,
        "key": "邪眼巨魔",
        "name": "邪眼巨魔",
        "form": "",
        "baseId": 3185,
        "legacyKey": "邪眼巨魔",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "巨灵组",
            "昆虫组"
        ],
        "series": [
            "恶",
            "虫"
        ],
        "flags": 1,
        "family": "瑰眼仔",
        "stage": "最终形态",
        "image": "65.webp",
        "evolutionChain": [
            "瑰眼仔",
            "耳翎瑰魅",
            "邪眼巨魔"
        ],
        "offspringKey": "邪眼巨魔",
        "offspringReason": "",
        "maleTargets": [
            "千棘盔::3332",
            "夜枭",
            "月牙雪熊",
            "燃薪虫",
            "窃光蚊",
            "花衣蝶",
            "白金独角兽",
            "梦想三三",
            "飞飞钥",
            "夜游魔",
            "障眼魔",
            "未完虫",
            "玳塔",
            "测风蝉"
        ],
        "femaleTargets": []
    },
    {
        "id": 66,
        "key": "夜游魔",
        "name": "夜游魔",
        "form": "",
        "baseId": 3323,
        "legacyKey": "夜游魔",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "巨灵组",
            "天空组"
        ],
        "series": [
            "翼",
            "恶"
        ],
        "flags": 1,
        "family": "觅觅蝠",
        "stage": "最终形态",
        "image": "66.webp",
        "evolutionChain": [
            "觅觅蝠",
            "翻翻蝠",
            "夜游魔"
        ],
        "offspringKey": "夜游魔",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "千棘盔::3332",
            "夜枭",
            "斑枭",
            "月牙雪熊",
            "武者鸡",
            "粉耳星兔",
            "绅士鸡",
            "落陨星兔",
            "高脚鹬",
            "白金独角兽",
            "梦想三三",
            "邪眼巨魔",
            "障眼魔",
            "玳塔",
            "星星眼"
        ],
        "femaleTargets": []
    },
    {
        "id": 67,
        "key": "障眼魔",
        "name": "障眼魔",
        "form": "",
        "baseId": 3349,
        "legacyKey": "障眼魔",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "巨灵组",
            "妖精组"
        ],
        "series": [
            "恶",
            "水"
        ],
        "flags": 1,
        "family": "芽眼魔",
        "stage": "最终形态",
        "image": "67.webp",
        "evolutionChain": [
            "芽眼魔",
            "叶眼魔",
            "障眼魔"
        ],
        "offspringKey": "障眼魔",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "千棘盔::3332",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "夜枭",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "月牙雪熊",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三",
            "邪眼巨魔",
            "夜游魔",
            "智辉章脑",
            "玳塔",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 68,
        "key": "月使鹭纳",
        "name": "月使鹭纳",
        "form": "",
        "baseId": 3766,
        "legacyKey": "月使鹭纳",
        "season": "S4月涌狂想",
        "availability": "battle-pass",
        "availabilityReason": "S4月涌狂想战令异色",
        "groups": [],
        "series": [
            "翼",
            "冰"
        ],
        "flags": 18,
        "family": "新月鹭",
        "stage": "最终形态",
        "image": "68.webp",
        "evolutionChain": [
            "新月鹭",
            "月辉鹭",
            "月使鹭纳"
        ],
        "offspringKey": "月使鹭纳",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 69,
        "key": "圣凯布米龙",
        "name": "圣凯布米龙",
        "form": "",
        "baseId": 3576,
        "legacyKey": "圣凯布米龙",
        "season": "S4月涌狂想",
        "availability": "battle-pass",
        "availabilityReason": "S4月涌狂想战令异色",
        "groups": [],
        "series": [
            "火",
            "虫"
        ],
        "flags": 18,
        "family": "热团团",
        "stage": "最终形态",
        "image": "69.webp",
        "evolutionChain": [
            "热团团",
            "焰米龙",
            "圣凯布米龙"
        ],
        "offspringKey": "圣凯布米龙",
        "offspringReason": "",
        "maleTargets": [],
        "femaleTargets": []
    },
    {
        "id": 70,
        "key": "智辉章脑",
        "name": "智辉章脑",
        "form": "",
        "baseId": 3768,
        "legacyKey": "智辉章脑",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "妖精组",
            "软体组"
        ],
        "series": [
            "光",
            "水"
        ],
        "flags": 1,
        "family": "章脑丸",
        "stage": "最终形态",
        "image": "70.webp",
        "evolutionChain": [
            "章脑丸",
            "智辉章脑"
        ],
        "offspringKey": "智辉章脑",
        "offspringReason": "",
        "maleTargets": [
            "伊贝粉粉",
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "摇铃魔偶",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 71,
        "key": "未完虫",
        "name": "未完虫",
        "form": "",
        "baseId": 3542,
        "legacyKey": "未完虫",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "昆虫组",
            "魔力组"
        ],
        "series": [
            "幽",
            "虫"
        ],
        "flags": 1,
        "family": "未完虫",
        "stage": "最终形态",
        "image": "71.webp",
        "evolutionChain": [
            "未完虫"
        ],
        "offspringKey": "未完虫",
        "offspringReason": "",
        "maleTargets": [
            "夜枭",
            "烟花伯爵",
            "燃薪虫",
            "窃光蚊",
            "花衣蝶",
            "幻影灵菇",
            "飞飞钥",
            "邪眼巨魔",
            "测风蝉",
            "摇铃魔偶"
        ],
        "femaleTargets": []
    },
    {
        "id": 72,
        "key": "玳塔",
        "name": "玳塔",
        "form": "",
        "baseId": 3590,
        "legacyKey": "玳塔",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "巨灵组",
            "两栖组"
        ],
        "series": [
            "幻"
        ],
        "flags": 1,
        "family": "玳龟",
        "stage": "最终形态",
        "image": "72.webp",
        "evolutionChain": [
            "玳龟",
            "玳塔"
        ],
        "offspringKey": "玳塔",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "千棘盔::3332",
            "夜枭",
            "月牙雪熊",
            "深渊蛙",
            "白金独角兽",
            "梦想三三",
            "邪眼巨魔",
            "夜游魔",
            "障眼魔"
        ],
        "femaleTargets": []
    },
    {
        "id": 73,
        "key": "测风蝉",
        "name": "测风蝉",
        "form": "",
        "baseId": 3664,
        "legacyKey": "测风蝉",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "昆虫组",
            "机械组"
        ],
        "series": [
            "翼",
            "机械"
        ],
        "flags": 1,
        "family": "量风碗",
        "stage": "最终形态",
        "image": "73.webp",
        "evolutionChain": [
            "量风碗",
            "测风蝉"
        ],
        "offspringKey": "测风蝉",
        "offspringReason": "",
        "maleTargets": [
            "巨鼓象",
            "烟花伯爵",
            "燃薪虫",
            "窃光蚊",
            "立方人",
            "花衣蝶",
            "贝古斯",
            "音碟吼",
            "飞飞钥",
            "邪眼巨魔",
            "未完虫"
        ],
        "femaleTargets": []
    },
    {
        "id": 74,
        "key": "黑手浣熊",
        "name": "黑手浣熊",
        "form": "",
        "baseId": 3772,
        "legacyKey": "黑手浣熊",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "动物组",
            "拟人组"
        ],
        "series": [
            "恶"
        ],
        "flags": 1,
        "family": "小浣蛋",
        "stage": "最终形态",
        "image": "74.webp",
        "evolutionChain": [
            "小浣蛋",
            "黑手浣熊"
        ],
        "offspringKey": "黑手浣熊",
        "offspringReason": "",
        "maleTargets": [
            "壳栗丝鼠",
            "小丑公爵",
            "尖嘴狐仙",
            "巨鼓象",
            "帅帅魔偶",
            "徘徊爪爪",
            "恶魔狼",
            "月牙雪熊",
            "朔夜伊芙",
            "武者鸡",
            "深渊蛙",
            "炮米花",
            "獠牙猪",
            "立方人",
            "红绒十字",
            "绅士鸡",
            "花衣蝶",
            "遁地鼠::3022",
            "遁地鼠::3456",
            "雅丹鬃",
            "雪影娃娃",
            "霹雳迪迪",
            "音碟吼",
            "白金独角兽",
            "黑猫巫师",
            "梦想三三"
        ],
        "femaleTargets": []
    },
    {
        "id": 75,
        "key": "摇铃魔偶",
        "name": "摇铃魔偶",
        "form": "",
        "baseId": 3774,
        "legacyKey": "摇铃魔偶",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "妖精组",
            "魔力组"
        ],
        "series": [
            "幽"
        ],
        "flags": 1,
        "family": "幽铃",
        "stage": "最终形态",
        "image": "75.webp",
        "evolutionChain": [
            "幽铃",
            "摇铃魔偶"
        ],
        "offspringKey": "摇铃魔偶",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "夜枭",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "烟花伯爵",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "幻影灵菇",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "未完虫",
            "布灵布灵"
        ],
        "femaleTargets": []
    },
    {
        "id": 76,
        "key": "星星眼",
        "name": "星星眼",
        "form": "",
        "baseId": 3236,
        "legacyKey": "星星眼",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "天空组",
            "大地组"
        ],
        "series": [
            "幻"
        ],
        "flags": 1,
        "family": "星星眼",
        "stage": "最终形态",
        "image": "76.webp",
        "evolutionChain": [
            "星星眼"
        ],
        "offspringKey": "星星眼",
        "offspringReason": "",
        "maleTargets": [
            "公平鸽",
            "嘟嘟锅",
            "斑枭",
            "武者鸡",
            "粉耳星兔",
            "绅士鸡",
            "落陨星兔",
            "霹雳迪迪",
            "高脚鹬",
            "夜游魔"
        ],
        "femaleTargets": []
    },
    {
        "id": 77,
        "key": "布灵布灵",
        "name": "布灵布灵",
        "form": "",
        "baseId": 3776,
        "legacyKey": "布灵布灵",
        "season": "S4月涌狂想",
        "availability": "season-limited",
        "availabilityReason": "S4月涌狂想赛季限时异色",
        "groups": [
            "妖精组"
        ],
        "series": [
            "幻",
            "光"
        ],
        "flags": 1,
        "family": "布灵",
        "stage": "最终形态",
        "image": "77.webp",
        "evolutionChain": [
            "布灵",
            "布灵布灵"
        ],
        "offspringKey": "布灵布灵",
        "offspringReason": "",
        "maleTargets": [
            "加油蟹",
            "半朽蜜果灵",
            "卡拉波斯",
            "叮叮恶魔",
            "咕德帽帽",
            "嘟嘟锅",
            "小丑公爵",
            "小皮球",
            "帅帅魔偶",
            "幽影树",
            "朔夜伊芙",
            "格兰球",
            "流明坎德拉",
            "稻草守护者",
            "粉耳星兔",
            "红绒十字",
            "落陨星兔",
            "酷拉",
            "雪影娃娃",
            "黑猫巫师",
            "障眼魔",
            "智辉章脑",
            "摇铃魔偶"
        ],
        "femaleTargets": []
    }
];

export const DATA_UPDATED_AT = "2026-09-19T08:55:07.212Z";

export const FLAG = {
  BREEDABLE: 1,
  RULE_NON_BREEDABLE: 2,
  FEMALE_ONLY: 4,
  MALE_ONLY: 8,
  NO_EGG_GROUP: 16,
  EXCLUDED: 32,
} as const;
