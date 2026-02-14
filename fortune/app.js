// ========== 全局状态 ==========
let currentTemple = null;
let throwCount = 0;
let lastBlockResult = null;

// ========== 庙宇 SVG 图标 ==========
const TEMPLE_SVGS = {
    // 妈祖庙 - 波浪+船
    chaoshan: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 32 Q14 26 20 32 Q26 38 32 32 Q38 26 44 32" stroke="#8b0000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M8 38 Q14 32 20 38 Q26 44 32 38 Q38 32 44 38" stroke="#8b0000" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M18 30 L24 8 L30 30" stroke="#8b0000" stroke-width="2" fill="none"/>
        <path d="M18 30 Q24 22 30 30" fill="#8b0000" opacity="0.3"/>
        <circle cx="24" cy="14" r="3" fill="#8b0000" opacity="0.6"/>
    </svg>`,
    // 关帝庙 - 大刀
    minnan: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="24" y1="42" x2="24" y2="14" stroke="#8b0000" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M16 14 Q20 6 24 4 Q28 6 32 14 L28 16 Q26 10 24 8 Q22 10 20 16 Z" fill="#8b0000"/>
        <rect x="20" y="14" width="8" height="3" rx="1" fill="#8b0000" opacity="0.7"/>
        <line x1="20" y1="36" x2="28" y2="36" stroke="#8b0000" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    // 黄大仙祠 - 葫芦
    guangfu: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="34" rx="10" ry="11" fill="#8b0000" opacity="0.8"/>
        <ellipse cx="24" cy="18" rx="7" ry="8" fill="#8b0000" opacity="0.6"/>
        <rect x="22" y="5" width="4" height="6" rx="2" fill="#8b0000"/>
        <path d="M20 10 Q24 13 28 10" stroke="#8b0000" stroke-width="1.5" fill="none"/>
        <ellipse cx="24" cy="34" rx="6" ry="7" fill="none" stroke="#ffd700" stroke-width="0.5" opacity="0.3"/>
    </svg>`,
    // 城隍庙 - 庙宇
    jiangnan: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 24 L24 8 L42 24" stroke="#8b0000" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
        <path d="M10 24 L24 12 L38 24" fill="#8b0000" opacity="0.2"/>
        <rect x="12" y="24" width="24" height="18" fill="#8b0000" opacity="0.4"/>
        <rect x="20" y="30" width="8" height="12" rx="1" fill="#8b0000" opacity="0.7"/>
        <rect x="14" y="27" width="6" height="5" rx="1" fill="#8b0000" opacity="0.5"/>
        <rect x="28" y="27" width="6" height="5" rx="1" fill="#8b0000" opacity="0.5"/>
        <circle cx="24" cy="20" r="2" fill="#8b0000" opacity="0.5"/>
    </svg>`,
    // 观音堂 - 莲花
    general: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 40 Q22 30 16 24 Q10 20 14 14 Q18 10 22 16 Q23 20 24 24 Q25 20 26 16 Q30 10 34 14 Q38 20 32 24 Q26 30 24 40Z" fill="#8b0000" opacity="0.6"/>
        <path d="M24 40 Q20 28 10 22 Q4 19 10 12 Q16 6 20 14 Q22 18 24 26 Q26 18 28 14 Q32 6 38 12 Q44 19 38 22 Q28 28 24 40Z" fill="#8b0000" opacity="0.3"/>
        <circle cx="24" cy="22" r="4" fill="#8b0000" opacity="0.4"/>
        <circle cx="24" cy="22" r="2" fill="#ffd700" opacity="0.5"/>
    </svg>`
};

// 神像 SVG 图标
const DEITY_SVGS = {
    chaoshan: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="28" r="12" fill="#ffd700" opacity="0.3"/>
        <circle cx="40" cy="28" r="8" fill="#ffd700" opacity="0.2"/>
        <path d="M30 32 Q32 20 40 16 Q48 20 50 32" fill="#cc0000" opacity="0.4"/>
        <path d="M28 34 L40 70 L52 34" fill="#cc0000" opacity="0.5"/>
        <circle cx="40" cy="26" r="6" fill="#ffe4b5" opacity="0.8"/>
        <path d="M28 24 Q34 14 40 12 Q46 14 52 24" fill="#222" opacity="0.3"/>
        <text x="40" y="58" text-anchor="middle" fill="#ffd700" font-size="10" font-weight="bold">妈祖</text>
    </svg>`,
    minnan: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="28" r="12" fill="#ffd700" opacity="0.3"/>
        <circle cx="40" cy="26" r="6" fill="#ffe4b5" opacity="0.8"/>
        <path d="M30 34 L40 72 L50 34" fill="#228b22" opacity="0.5"/>
        <path d="M28 24 Q34 16 40 14 Q46 16 52 24" fill="#333" opacity="0.3"/>
        <path d="M34 26 Q40 22 46 26" stroke="#333" stroke-width="1" fill="none" opacity="0.4"/>
        <rect x="50" y="16" width="3" height="40" rx="1" fill="#8b6914" opacity="0.5"/>
        <text x="40" y="62" text-anchor="middle" fill="#ffd700" font-size="8" font-weight="bold">关帝</text>
    </svg>`,
    guangfu: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="28" r="12" fill="#ffd700" opacity="0.3"/>
        <circle cx="40" cy="26" r="6" fill="#ffe4b5" opacity="0.8"/>
        <path d="M28 34 L40 72 L52 34" fill="#9b59b6" opacity="0.4"/>
        <path d="M26 24 Q32 14 40 12 Q48 14 54 24" fill="#333" opacity="0.2"/>
        <ellipse cx="56" cy="44" rx="4" ry="6" fill="#8b6914" opacity="0.4"/>
        <ellipse cx="56" cy="38" rx="3" ry="4" fill="#8b6914" opacity="0.3"/>
        <text x="40" y="62" text-anchor="middle" fill="#ffd700" font-size="7" font-weight="bold">黄大仙</text>
    </svg>`,
    jiangnan: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="28" r="12" fill="#ffd700" opacity="0.3"/>
        <circle cx="40" cy="26" r="6" fill="#ffe4b5" opacity="0.8"/>
        <path d="M26 34 L40 72 L54 34" fill="#333" opacity="0.4"/>
        <rect x="32" y="14" width="16" height="6" rx="1" fill="#333" opacity="0.3"/>
        <text x="40" y="62" text-anchor="middle" fill="#ffd700" font-size="8" font-weight="bold">城隍</text>
    </svg>`,
    general: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="24" r="16" fill="#ffd700" opacity="0.2"/>
        <circle cx="40" cy="24" r="12" fill="#ffd700" opacity="0.15"/>
        <circle cx="40" cy="24" r="6" fill="#ffe4b5" opacity="0.8"/>
        <path d="M26 30 L40 72 L54 30" fill="#fff" opacity="0.3"/>
        <path d="M48 40 Q54 46 48 54" stroke="#8b6914" stroke-width="1.5" fill="none" opacity="0.4"/>
        <circle cx="52" cy="48" r="3" fill="#8b6914" opacity="0.3"/>
        <text x="40" y="62" text-anchor="middle" fill="#ffd700" font-size="8" font-weight="bold">观音</text>
    </svg>`
};

// ========== 页面切换 ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    page.classList.remove('active');
    void page.offsetWidth;
    page.classList.add('active');
    window.scrollTo(0, 0);
}

// ========== 初始化庙宇列表 ==========
function initTempleList() {
    const list = document.getElementById('temple-list');
    list.innerHTML = '';
    TEMPLES.forEach(temple => {
        const card = document.createElement('div');
        card.className = 'temple-card';
        const iconSvg = TEMPLE_SVGS[temple.id] || `<span style="font-size:2.2rem;">${temple.icon}</span>`;
        card.innerHTML = `
            <div class="temple-card-icon">${iconSvg}</div>
            <div class="temple-card-info">
                <div class="temple-card-name">${temple.name}</div>
                <div class="temple-card-region">${temple.region}</div>
                <div class="temple-card-desc">${temple.desc}</div>
            </div>
        `;
        card.addEventListener('click', () => selectTemple(temple));
        list.appendChild(card);
    });
}

// ========== 选择庙宇 ==========
function selectTemple(temple) {
    currentTemple = temple;
    const deityImg = document.getElementById('deity-img');
    const deitySvg = DEITY_SVGS[temple.id];
    if (deitySvg) {
        deityImg.innerHTML = deitySvg;
    } else {
        deityImg.textContent = temple.deityIcon;
    }
    document.getElementById('temple-name').textContent = temple.deity;
    document.getElementById('pray-input').value = '';
    showPage('page-pray');
}

// ========== 掷杯逻辑 ==========
function throwBlocks() {
    const btnThrow = document.getElementById('btn-throw');
    const btnGetFortune = document.getElementById('btn-get-fortune');
    const resultDiv = document.getElementById('block-result');
    const resultText = document.getElementById('block-result-text');
    const hint = document.getElementById('shake-hint');
    const blockLeft = document.getElementById('block-left').querySelector('.block-inner');
    const blockRight = document.getElementById('block-right').querySelector('.block-inner');

    btnThrow.disabled = true;
    btnThrow.textContent = '掷杯中...';
    resultDiv.style.display = 'none';
    btnGetFortune.style.display = 'none';

    blockLeft.className = 'block-inner';
    blockRight.className = 'block-inner';

    const rand = Math.random();
    let result;
    let leftFace, rightFace;
    if (rand < 0.6) {
        result = BLOCK_RESULTS.shengBei;
        if (Math.random() < 0.5) {
            leftFace = 'flat';
            rightFace = 'round';
        } else {
            leftFace = 'round';
            rightFace = 'flat';
        }
    } else if (rand < 0.85) {
        result = BLOCK_RESULTS.xiaoBei;
        leftFace = 'flat';
        rightFace = 'flat';
    } else {
        result = BLOCK_RESULTS.nuBei;
        leftFace = 'round';
        rightFace = 'round';
    }

    lastBlockResult = result;

    blockLeft.style.setProperty('--final-x', leftFace === 'flat' ? '0deg' : '180deg');
    blockRight.style.setProperty('--final-x', rightFace === 'flat' ? '0deg' : '180deg');

    blockLeft.classList.add('throwing');
    setTimeout(() => {
        blockRight.classList.add('throwing');
    }, 200);

    setTimeout(() => {
        blockLeft.className = 'block-inner ' + leftFace;
        blockRight.className = 'block-inner ' + rightFace;

        resultDiv.style.display = 'block';
        resultDiv.className = 'block-result ' + result.className;
        resultText.textContent = result.name + ' — ' + result.desc;

        throwCount++;

        if (result.canGetFortune) {
            hint.textContent = '恭喜得到圣杯！可以求签了';
            btnGetFortune.style.display = 'block';
            btnThrow.textContent = '再掷一次';
        } else {
            hint.textContent = '未得圣杯，请再试一次';
            btnThrow.textContent = '再掷一次';
        }
        btnThrow.disabled = false;
    }, 1800);
}

// ========== 求签 ==========
function getFortune() {
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    showResult(fortune);
}

// ========== 显示签文结果 ==========
function showResult(fortune) {
    document.getElementById('result-rank').textContent = fortune.rank;
    document.getElementById('result-rank').className = 'result-rank ' + fortune.rankClass;
    document.getElementById('result-title').textContent = fortune.title;
    document.getElementById('result-poem').textContent = fortune.poem;
    document.getElementById('result-explain').textContent = fortune.explain;
    showPage('page-result');
}

// ========== 语音播报 ==========
function readFortune() {
    if (!('speechSynthesis' in window)) {
        alert('您的浏览器不支持语音播报功能');
        return;
    }

    speechSynthesis.cancel();

    const rank = document.getElementById('result-rank').textContent;
    const title = document.getElementById('result-title').textContent;
    const poem = document.getElementById('result-poem').textContent;
    const explain = document.getElementById('result-explain').textContent;

    const text = `${title}。${rank}。${poem.replace(/\n/g, '，')}。解签：${explain}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;

    const voices = speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh'));
    if (zhVoice) {
        utterance.voice = zhVoice;
    }

    const btnRead = document.getElementById('btn-read');
    btnRead.textContent = '播报中...';
    btnRead.disabled = true;

    utterance.onend = () => {
        btnRead.textContent = '语音播报';
        btnRead.disabled = false;
    };

    utterance.onerror = () => {
        btnRead.textContent = '语音播报';
        btnRead.disabled = false;
    };

    speechSynthesis.speak(utterance);
}

// ========== 事件绑定 ==========
function bindEvents() {
    document.getElementById('btn-divine').addEventListener('click', () => {
        throwCount = 0;
        lastBlockResult = null;
        const blockLeft = document.getElementById('block-left').querySelector('.block-inner');
        const blockRight = document.getElementById('block-right').querySelector('.block-inner');
        blockLeft.className = 'block-inner';
        blockRight.className = 'block-inner';
        document.getElementById('block-result').style.display = 'none';
        document.getElementById('btn-get-fortune').style.display = 'none';
        document.getElementById('shake-hint').textContent = '点击下方杯筊开始掷杯';
        document.getElementById('btn-throw').textContent = '掷杯';
        showPage('page-divination');
    });

    document.getElementById('btn-throw').addEventListener('click', throwBlocks);
    document.getElementById('btn-get-fortune').addEventListener('click', getFortune);
    document.getElementById('btn-read').addEventListener('click', readFortune);

    document.getElementById('btn-back-temple').addEventListener('click', () => {
        showPage('page-temple');
    });

    document.getElementById('btn-back-pray').addEventListener('click', () => {
        showPage('page-pray');
    });

    document.getElementById('btn-again').addEventListener('click', () => {
        showPage('page-pray');
    });

    document.getElementById('btn-home').addEventListener('click', () => {
        showPage('page-temple');
    });

    // 摇一摇掷杯（手机端）
    if (window.DeviceMotionEvent) {
        let lastShakeTime = 0;
        window.addEventListener('devicemotion', (e) => {
            const acc = e.accelerationIncludingGravity;
            if (!acc) return;
            const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
            const now = Date.now();
            if (force > 35 && now - lastShakeTime > 2500) {
                const divinationPage = document.getElementById('page-divination');
                if (divinationPage.classList.contains('active')) {
                    const btnThrow = document.getElementById('btn-throw');
                    if (!btnThrow.disabled) {
                        lastShakeTime = now;
                        throwBlocks();
                    }
                }
            }
        });
    }
}

// ========== 初始化 ==========
function init() {
    initTempleList();
    bindEvents();

    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.getVoices();
        };
    }
}

document.addEventListener('DOMContentLoaded', init);
