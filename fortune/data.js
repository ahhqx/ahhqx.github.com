// ========== 庙宇/主题数据 ==========
const TEMPLES = [
    {
        id: "chaoshan",
        name: "潮汕 · 妈祖庙",
        region: "广东潮汕地区",
        desc: "天后圣母，护佑海上平安",
        icon: "\uD83C\uDFEF",
        deity: "妈祖娘娘",
        deityIcon: "\uD83E\uDDDE\u200D\u2640\uFE0F",
        color: "#ffd700"
    },
    {
        id: "minnan",
        name: "闽南 · 关帝庙",
        region: "福建闽南地区",
        desc: "关圣帝君，忠义仁勇",
        icon: "\u26E9\uFE0F",
        deity: "关圣帝君",
        deityIcon: "\uD83E\uDDD4",
        color: "#ff6b35"
    },
    {
        id: "guangfu",
        name: "广府 · 黄大仙祠",
        region: "广东广府地区",
        desc: "黄大仙，有求必应",
        icon: "\uD83C\uDFDB\uFE0F",
        deity: "黄大仙",
        deityIcon: "\uD83E\uDDD9",
        color: "#9b59b6"
    },
    {
        id: "jiangnan",
        name: "江南 · 城隍庙",
        region: "江浙地区",
        desc: "城隍爷，护佑一方百姓",
        icon: "\uD83C\uDFEE",
        deity: "城隍爷",
        deityIcon: "\uD83D\uDC72",
        color: "#e74c3c"
    },
    {
        id: "general",
        name: "通用 · 观音堂",
        region: "全国通用",
        desc: "观世音菩萨，大慈大悲",
        icon: "\uD83D\uDD4A\uFE0F",
        deity: "观世音菩萨",
        deityIcon: "\uD83E\uDDD8",
        color: "#3498db"
    }
];

// ========== 签文数据库 ==========
// 每支签包含: number(签号), rank(吉凶), title(签名), poem(签诗), explain(解签)
const FORTUNES = [
    {
        number: 1,
        rank: "大吉",
        rankClass: "ji",
        title: "第一签 · 日出东方",
        poem: "日出东方照九州，\n春风得意马蹄疾。\n贵人相助前程远，\n万事亨通福禄齐。",
        explain: "此签大吉。事事顺遂，如日初升，光明在前。求财有望，出行平安，病者渐愈，家宅安宁。贵人暗中相助，把握良机切莫迟疑。"
    },
    {
        number: 2,
        rank: "大吉",
        rankClass: "ji",
        title: "第二签 · 龙门跃鲤",
        poem: "鲤鱼跳过龙门去，\n翻身一跃上云霄。\n十年寒窗今朝报，\n名利双收福寿高。",
        explain: "此签大吉。艰难时期已过，好运即将来临。功名可成，事业有成，辛苦耕耘终得回报。宜积极进取，大胆行事。"
    },
    {
        number: 3,
        rank: "上吉",
        rankClass: "ji",
        title: "第三签 · 春回大地",
        poem: "冬去春来万象新，\n枯木逢春又发芽。\n莫道前路多坎坷，\n柳暗花明又一家。",
        explain: "此签上吉。困境即将过去，转机已在眼前。健康好转，财运渐佳。切记耐心等待，不要急躁，时机成熟自然水到渠成。"
    },
    {
        number: 4,
        rank: "上吉",
        rankClass: "ji",
        title: "第四签 · 明月当空",
        poem: "明月高悬照万家，\n清风送爽百花开。\n心诚则灵神庇佑，\n阖家团圆乐无涯。",
        explain: "此签上吉。家庭和睦，平安顺遂。所求之事，心诚则灵。宜与家人多沟通，凡事以和为贵。出行安全，健康无忧。"
    },
    {
        number: 5,
        rank: "中吉",
        rankClass: "zhong-ji",
        title: "第五签 · 稳舵行舟",
        poem: "行舟稳把舵中间，\n风平浪静到彼岸。\n切莫贪快求冒进，\n稳扎稳打保平安。",
        explain: "此签中吉。运势平稳，虽无大起但也无大落。做事宜循序渐进，不宜急于求成。理财宜保守，健康注意休息。稳中求胜方为上策。"
    },
    {
        number: 6,
        rank: "中吉",
        rankClass: "zhong-ji",
        title: "第六签 · 锦上添花",
        poem: "已有根基在此间，\n锦上添花不为难。\n守得本分行善事，\n福报自来到门前。",
        explain: "此签中吉。现有基础尚好，宜在此基础上更进一步。多行善事，福报自来。求财有小利，健康宜养生。心态平和最重要。"
    },
    {
        number: 7,
        rank: "中吉",
        rankClass: "zhong-ji",
        title: "第七签 · 贵人指路",
        poem: "前路茫茫心莫慌，\n自有贵人来相帮。\n低头做事抬头看，\n机遇来时要敢当。",
        explain: "此签中吉。虽一时迷茫，但贵人暗中相助。遇事多请教长辈或朋友。机会出现时要果断把握，犹豫则失。注意身边人的建议。"
    },
    {
        number: 8,
        rank: "中平",
        rankClass: "zhong-ji",
        title: "第八签 · 守静待时",
        poem: "静坐堂前看云卷，\n莫因心急乱方寸。\n守得一时风雨过，\n自有晴天在后头。",
        explain: "此签中平。目前宜守不宜攻，耐心等待时机。大的决定建议暂缓。健康方面注意作息规律，饮食清淡。心平气和，静待花开。"
    },
    {
        number: 9,
        rank: "中平",
        rankClass: "zhong-ji",
        title: "第九签 · 细水长流",
        poem: "细水长流润无声，\n不必强求自然成。\n做人做事凭良心，\n平淡之中见真情。",
        explain: "此签中平。运势平稳，无大波澜。日常生活中注意节俭，细水长流。人际关系中真诚待人即可，不必刻意经营。平安就是福。"
    },
    {
        number: 10,
        rank: "小吉",
        rankClass: "xiao-ji",
        title: "第十签 · 暗处生花",
        poem: "暗处生花人未知，\n默默耕耘有几时。\n莫道付出无回报，\n来日方长看分晓。",
        explain: "此签小吉。付出暂时看不到回报，但不要灰心。坚持下去自有收获。求财不急，健康尚可，注意调节心情。凡事往好处想。"
    },
    {
        number: 11,
        rank: "小吉",
        rankClass: "xiao-ji",
        title: "第十一签 · 雨后彩虹",
        poem: "风雨之后见彩虹，\n乌云散去天自晴。\n眼前困难终会过，\n且将心事付东风。",
        explain: "此签小吉。目前或有小困难，但终将过去。保持乐观心态最为重要。遇到烦心事不妨和亲友倾诉，不要独自承受。柳暗花明就在前方。"
    },
    {
        number: 12,
        rank: "小吉",
        rankClass: "xiao-ji",
        title: "第十二签 · 脚踏实地",
        poem: "高楼万丈平地起，\n一砖一瓦慢慢砌。\n心急吃不了热豆腐，\n脚踏实地成大器。",
        explain: "此签小吉。提醒您凡事不要好高骛远，踏踏实实一步一步来。求财不可投机，健康注意饮食。做好眼前事，未来可期。"
    },
    {
        number: 13,
        rank: "中平",
        rankClass: "zhong-ji",
        title: "第十三签 · 逢凶化吉",
        poem: "看似山穷水尽时，\n柳暗花明又一枝。\n心中有佛常行善，\n逢凶化吉保安宜。",
        explain: "此签中平偏吉。虽有波折，但最终化险为夷。多行善积德，自然逢凶化吉。出行注意安全，做事小心谨慎，问题终将解决。"
    },
    {
        number: 14,
        rank: "下下",
        rankClass: "xiong",
        title: "第十四签 · 忍耐为上",
        poem: "乌云蔽日暂无光，\n凡事三思莫逞强。\n退一步来海阔天，\n忍一时来路更长。",
        explain: "此签偏凶。近期宜忍让退守，不宜冲动行事。大的投资决定暂缓，与人交往多忍让。注意身体健康，定期体检。风雨过后终有天晴之日。"
    },
    {
        number: 15,
        rank: "下下",
        rankClass: "xiong",
        title: "第十五签 · 谨慎行事",
        poem: "行船偏遇逆风吹，\n万事小心为上计。\n出入谨慎少口舌，\n待到来年运气回。",
        explain: "此签偏凶。提醒您近期凡事小心谨慎，少说多做。避免与人争执，远离是非之地。注意安全，守好本分。困难是暂时的，好运终会来。"
    },
    {
        number: 16,
        rank: "大吉",
        rankClass: "ji",
        title: "第十六签 · 紫气东来",
        poem: "紫气东来满庭芳，\n贵人到处喜洋洋。\n但凡所求皆如意，\n富贵荣华寿且长。",
        explain: "此签大吉。喜气盈门，事事如意。求财大利，求健康则无忧。家中或有喜事来临，贵人运极旺。宜大胆行事，诸事顺遂。"
    },
    {
        number: 17,
        rank: "上吉",
        rankClass: "ji",
        title: "第十七签 · 金玉满堂",
        poem: "金玉满堂福自来，\n和和美美乐开怀。\n一家老小皆平安，\n子孝孙贤福满腮。",
        explain: "此签上吉。家庭美满，老幼平安。财运亨通，但宜量入为出。子女孝顺，家宅兴旺。宜多与家人相聚，珍惜当下幸福时光。"
    },
    {
        number: 18,
        rank: "中吉",
        rankClass: "zhong-ji",
        title: "第十八签 · 顺水行舟",
        poem: "顺水行舟风又顺，\n不费力气到前村。\n借得东风好办事，\n自然而然见收成。",
        explain: "此签中吉。顺势而为，事半功倍。不必太过用力，顺其自然即可。合作比单打独斗更有利。健康注意顺应时节养生。"
    },
    {
        number: 19,
        rank: "小吉",
        rankClass: "xiao-ji",
        title: "第十九签 · 苦尽甘来",
        poem: "种下梅花经霜雪，\n苦尽甘来终有时。\n莫因眼前多辛苦，\n来日花开满庭枝。",
        explain: "此签小吉。目前虽然辛苦，但坚持就有回报。健康方面注意保暖，饮食调理。求财宜节俭，不宜铺张。美好的日子终将来临。"
    },
    {
        number: 20,
        rank: "中平",
        rankClass: "zhong-ji",
        title: "第二十签 · 量力而行",
        poem: "心比天高志气扬，\n量力而行莫逞强。\n步步为营稳当走，\n平安到老胜万场。",
        explain: "此签中平。提醒您做事要量力而行，不可贪多。健康方面不要过度劳累，注意休息。平平安安、健健康康就是最大的福气。"
    }
];

// ========== 掷杯结果定义 ==========
const BLOCK_RESULTS = {
    shengBei: {
        name: "圣杯",
        desc: "一平一凸，神明允许",
        className: "sheng-bei",
        canGetFortune: true
    },
    xiaoBei: {
        name: "笑杯",
        desc: "两面皆平，神明笑而不答",
        className: "xiao-bei",
        canGetFortune: false
    },
    nuBei: {
        name: "怒杯",
        desc: "两面皆凸，神明不允",
        className: "nu-bei",
        canGetFortune: false
    }
};
