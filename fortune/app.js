// ========== 全局状态 ==========
let currentTemple = null;
let throwCount = 0;
let lastBlockResult = null;

// ========== 页面切换 ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    page.classList.remove('active');
    // 强制reflow触发动画
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
        card.innerHTML = `
            <div class="temple-card-icon">${temple.icon}</div>
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
    document.getElementById('deity-img').textContent = temple.deityIcon;
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

    // 禁用按钮防止重复点击
    btnThrow.disabled = true;
    btnThrow.textContent = '掷杯中...';
    resultDiv.style.display = 'none';
    btnGetFortune.style.display = 'none';

    // 清除之前的状态
    blockLeft.className = 'block-inner';
    blockRight.className = 'block-inner';

    // 随机决定结果: 圣杯60%, 笑杯25%, 怒杯15%
    const rand = Math.random();
    let result;
    let leftFace, rightFace;
    if (rand < 0.6) {
        // 圣杯：一平一凸
        result = BLOCK_RESULTS.shengBei;
        if (Math.random() < 0.5) {
            leftFace = 'flat';
            rightFace = 'round';
        } else {
            leftFace = 'round';
            rightFace = 'flat';
        }
    } else if (rand < 0.85) {
        // 笑杯：两面皆平
        result = BLOCK_RESULTS.xiaoBei;
        leftFace = 'flat';
        rightFace = 'flat';
    } else {
        // 怒杯：两面皆凸
        result = BLOCK_RESULTS.nuBei;
        leftFace = 'round';
        rightFace = 'round';
    }

    lastBlockResult = result;

    // 设置CSS变量控制最终旋转角度
    blockLeft.style.setProperty('--final-x', leftFace === 'flat' ? '0deg' : '180deg');
    blockRight.style.setProperty('--final-x', rightFace === 'flat' ? '0deg' : '180deg');

    // 启动动画
    blockLeft.classList.add('throwing');
    // 右边稍微延迟，更自然
    setTimeout(() => {
        blockRight.classList.add('throwing');
    }, 200);

    // 动画结束后显示结果
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
    // 随机抽取签文
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

    // 停止之前的播报
    speechSynthesis.cancel();

    const rank = document.getElementById('result-rank').textContent;
    const title = document.getElementById('result-title').textContent;
    const poem = document.getElementById('result-poem').textContent;
    const explain = document.getElementById('result-explain').textContent;

    const text = `${title}。${rank}。${poem.replace(/\n/g, '，')}。解签：${explain}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;  // 语速偏慢，适合老年人
    utterance.pitch = 1.0;

    // 尝试使用中文语音
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
    // 开始掷杯
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

    // 掷杯
    document.getElementById('btn-throw').addEventListener('click', throwBlocks);

    // 求签
    document.getElementById('btn-get-fortune').addEventListener('click', getFortune);

    // 语音播报
    document.getElementById('btn-read').addEventListener('click', readFortune);

    // 返回按钮
    document.getElementById('btn-back-temple').addEventListener('click', () => {
        showPage('page-temple');
    });

    document.getElementById('btn-back-pray').addEventListener('click', () => {
        showPage('page-pray');
    });

    // 再求一签
    document.getElementById('btn-again').addEventListener('click', () => {
        showPage('page-pray');
    });

    // 返回首页
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
            // 掷杯页面激活时，摇一摇触发
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

    // 预加载语音列表
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.getVoices();
        };
    }
}

document.addEventListener('DOMContentLoaded', init);
