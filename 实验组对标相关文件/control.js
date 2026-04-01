// 深渊呼吸 - 对照组版本（同壳换内容）
console.log('=== 对照组脚本加载 ===');
console.log('BUILD:', '2026-04-01 control-v2');

// 对照组素材根目录（control.html 在 实验组对标相关文件/ 下）
const ASSET_BASE = window.location.pathname.includes('实验组对标相关文件')
    ? '../对照组-游戏素材'
    : '对照组-游戏素材';
const LOCAL_STORAGE_KEY = 'abyssBreathData_ctrl';
const SURVEY_URL = 'https://v.wjx.cn/vm/r7qL0UF.aspx';

// 游戏数据收集（字段结构必须与实验组一致）
const gameData = {
    sessionId: '',
    groupType: '对照组',
    startTime: Date.now(),
    choices: [],
    oxygenValue: 0,
    playTime: 0,
    ending: ''
};

// 生成会话ID（对照组入口固定为对照组）
function generateSessionId() {
    const timestamp = Date.now();
    gameData.groupType = '对照组';
    const sessionId = 'TS' + timestamp;
    console.log('生成会话ID:', sessionId, '分组:', gameData.groupType);
    return sessionId;
}

// 初始化会话ID
gameData.sessionId = generateSessionId();

// DOM元素（会在页面加载后初始化）
let elements = {};

// 当前游戏状态
let currentScene = null;
let isPlaying = false;

// 初始化DOM元素
function initElements() {
    console.log('初始化DOM元素...');
    elements = {
        video: document.getElementById('game-video'),
        bgImage: document.getElementById('background-image'),
        charLeft: document.getElementById('character-left'),
        charRight: document.getElementById('character-right'),
        chapterTitle: document.getElementById('chapter-title'),
        dialogueBox: document.getElementById('dialogue-box'),
        choiceContainer: document.getElementById('choice-container'),
        interactionButton: document.getElementById('interaction-button'),
        oxygenSlider: document.getElementById('oxygen-slider-container'),
        loading: document.getElementById('loading'),
        hintText: document.getElementById('hint-text'),
        imagePopup: document.getElementById('image-popup'),
        swipeHint: document.getElementById('swipe-hint')
    };
    
    // 检查元素是否成功获取
    let allFound = true;
    for (let key in elements) {
        if (!elements[key]) {
            console.error('✗ 元素未找到:', key);
            allFound = false;
        }
    }
    
    if (allFound) {
        console.log('✓ 所有DOM元素初始化成功');
    } else {
        console.error('✗ 部分DOM元素初始化失败');
    }
    
    return allFound;
}

// 初始化游戏
function initGame() {
    console.log('========== 对照组游戏初始化 ==========');
    console.log('会话ID:', gameData.sessionId);
    console.log('分组:', gameData.groupType);
    console.log('开始时间:', new Date(gameData.startTime).toLocaleString());
    
    // 初始化DOM元素
    if (!initElements()) {
        console.error('DOM元素初始化失败，游戏无法启动');
        alert('游戏加载失败，请刷新页面重试');
        return;
    }
    
    // 设置初始数据
    try {
        document.getElementById('session-id').value = gameData.sessionId;
        document.getElementById('group-type').value = gameData.groupType;
        document.getElementById('start-time').value = gameData.startTime;
        console.log('✓ 数据记录初始化成功');
    } catch (e) {
        console.error('✗ 数据记录初始化失败:', e);
    }
    
    // 延迟启动，确保页面完全加载
    console.log('准备启动对照组游戏...');
    setTimeout(() => {
        console.log('>>> 调用 startGame()');
        startGame();
    }, 500);
}

// 开始游戏
function startGame() {
    playScene('prologue_1');
}

function hideChoiceContainer(onDone) {
    elements.choiceContainer.classList.remove('active');
    setTimeout(() => {
        elements.choiceContainer.classList.add('hidden');
        if (onDone) onDone();
    }, 300);
}

function saveRecordToLocal(record) {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        list.push(record);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        console.error('本地记录失败:', e);
        return false;
    }
}

async function saveRecordToCloud(record) {
    const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, record, { group: 'ctrl' }))
    });
    if (!response.ok) {
        throw new Error('云端保存失败: ' + response.status);
    }
    return response.json();
}

function buildSubmitRecord(participantId) {
    return {
        participantId: participantId,
        oxygenValue: gameData.oxygenValue,
        ending: gameData.ending || '',
        timestamp: new Date().toISOString(),
        group: 'ctrl'
    };
}

function renderParticipantSubmitForm() {
    elements.hintText.classList.remove('hidden');
    elements.hintText.innerHTML = `
        <div class="participant-submit">
            <div class="participant-title">请输入实验编号</div>
            <input id="participant-id-input" class="participant-input" type="text" placeholder="例如：P001">
            <button id="submit-participant-btn" class="confirm-button">提交并进入问卷</button>
            <div id="participant-error" class="participant-error"></div>
        </div>
    `;
    elements.hintText.style.fontSize = '';
    elements.hintText.style.lineHeight = '';
    elements.hintText.classList.add('active');

    const input = document.getElementById('participant-id-input');
    const submitBtn = document.getElementById('submit-participant-btn');
    const errorBox = document.getElementById('participant-error');

    submitBtn.onclick = async () => {
        const participantId = (input.value || '').trim();
        if (!participantId) {
            errorBox.textContent = '请输入实验编号';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';
        errorBox.textContent = '';

        const record = buildSubmitRecord(participantId);
        saveRecordToLocal(record);

        try {
            await saveRecordToCloud(record);
            console.log('云端记录成功');
        } catch (e) {
            console.warn('云端记录失败，已保留本地记录:', e);
        } finally {
            window.location.href = SURVEY_URL;
        }
    };
}

// 播放场景
function playScene(sceneId) {
    console.log('播放场景:', sceneId);
    currentScene = sceneId;
    
    // 清除当前UI
    hideAllUI();
    
    // 对照组场景映射（保持控件结构一致，仅换剧情与素材）
    const sceneMap = {
        'prologue_1': prologueScene1,
        'prologue_2': prologueScene2,
        'prologue_3': prologueScene3,
        'prologue_4': prologueScene4,
        'chapter2_1': chapter2Scene1,
        'chapter2_2': chapter2Scene2,
        'chapter2_3': chapter2Scene3,
        'chapter2_4': chapter2Scene4,
        'chapter3_1': chapter3Scene1,
        'chapter3_2': chapter3Scene2,
        'chapter3_3': chapter3Scene3,
        'chapter4_1': chapter4Scene1,
        'chapter4_2': chapter4Scene2,
        'chapter4_3': chapter4Scene3,
        'chapter5_1': chapter5Scene1,
        'ending': endingScene
    };
    
    if (sceneMap[sceneId]) {
        sceneMap[sceneId]();
    }
}

// 隐藏所有UI
function hideAllUI() {
    elements.video.classList.remove('active');
    elements.bgImage.classList.remove('active');
    elements.charLeft.classList.remove('active');
    elements.charRight.classList.remove('active');
    elements.chapterTitle.classList.remove('active');
    elements.dialogueBox.classList.remove('active');
    elements.choiceContainer.classList.remove('active');
    elements.interactionButton.classList.remove('active');
    elements.oxygenSlider.classList.remove('active');
    elements.hintText.classList.remove('active');
    elements.imagePopup.classList.remove('active');
    
    elements.chapterTitle.classList.add('hidden');
    elements.dialogueBox.classList.add('hidden');
    elements.choiceContainer.classList.add('hidden');
    elements.interactionButton.classList.add('hidden');
    elements.oxygenSlider.classList.add('hidden');
    elements.hintText.classList.add('hidden');
    elements.imagePopup.classList.add('hidden');
}

// 播放视频
function playVideo(videoPath, onEnd) {
    console.log('播放视频:', videoPath);

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500;

    function showRetryHint(attempt) {
        elements.hintText.classList.remove('hidden');
        elements.hintText.innerHTML = `视频加载中，请稍候… (${attempt}/${MAX_RETRIES})`;
        elements.hintText.style.fontSize = '0.9rem';
        elements.hintText.style.lineHeight = '2';
        elements.hintText.classList.add('active');
    }

    function hideRetryHint() {
        elements.hintText.classList.remove('active');
        elements.hintText.classList.add('hidden');
        elements.hintText.style.fontSize = '';
        elements.hintText.style.lineHeight = '';
    }

    function attempt(retryCount) {
        // 隐藏背景图，确保视频可见
        elements.bgImage.classList.remove('active');

        elements.video.src = videoPath;
        elements.video.classList.add('active');

        // 清理旧的事件，避免重复触发
        elements.video.onended = null;
        elements.video.onerror = null;

        elements.video.onended = () => {
            console.log('✓ 视频播放结束:', videoPath);
            elements.video.classList.remove('active');
            hideRetryHint();
            if (onEnd) onEnd();
        };

        const handleFailure = (reason) => {
            console.warn(`✗ 视频失败(第${retryCount}次):`, reason, videoPath);
            elements.video.classList.remove('active');

            if (retryCount < MAX_RETRIES) {
                showRetryHint(retryCount);
                setTimeout(() => attempt(retryCount + 1), RETRY_DELAY);
            } else {
                // 3 次全部失败：静默跳过，继续剧情，不弹框不强制刷新
                console.error('✗ 视频重试耗尽，跳过继续剧情:', videoPath);
                hideRetryHint();
                if (onEnd) onEnd();
            }
        };

        elements.video.onerror = () => handleFailure('加载错误');

        const playPromise = elements.video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // 播放成功，清空提示
                    hideRetryHint();
                    console.log('✓ 视频播放成功:', videoPath);
                })
                .catch(err => handleFailure(err));
        }
    }

    attempt(1);
}

// 显示背景
function showBackground(imagePath, enableAnimation = false) {
    console.log('显示背景:', imagePath);
    
    // 隐藏视频
    elements.video.classList.remove('active');
    
    // 移除之前的动画类
    elements.bgImage.classList.remove('cover-animation');
    
    // 隐藏水纹层
    const waterOverlay = document.getElementById('water-overlay');
    if (waterOverlay) {
        waterOverlay.classList.remove('active');
    }
    
    // 显示背景图
    elements.bgImage.src = imagePath;
    elements.bgImage.classList.add('active');
    
    // 如果是封面，添加动效
    if (enableAnimation) {
        setTimeout(() => {
            elements.bgImage.classList.add('cover-animation');
            if (waterOverlay) {
                waterOverlay.classList.add('active');
            }
        }, 500);
    }
    
    // 图片加载错误处理
    elements.bgImage.onerror = () => {
        console.error('✗ 背景图加载失败:', imagePath);
    };
    elements.bgImage.onload = () => {
        console.log('✓ 背景图加载成功');
    };
}

// 显示角色（position: 'left' 或 'right'）
function showCharacter(imagePath, position) {
    console.log('显示角色:', imagePath, position);
    const char = position === 'left' ? elements.charLeft : elements.charRight;
    char.src = imagePath;
    char.classList.add('active');
}

// 隐藏角色
function hideCharacter(position) {
    const char = position === 'left' ? elements.charLeft : elements.charRight;
    char.classList.remove('active');
}

// 显示章节标题
function showChapterTitle(title, duration = 3000) {
    elements.chapterTitle.classList.remove('hidden');
    const el = elements.chapterTitle.querySelector('.chapter-text');
    el.textContent = title;
    
    const prevLetterSpacing = el.style.letterSpacing;
    const prevWidth = el.style.width;
    if (String(title).includes('利维坦的叹息')) {
        el.style.letterSpacing = '0.12em';
        el.style.width = '82%';
    } else {
        el.style.letterSpacing = '';
        el.style.width = '';
    }
    
    elements.chapterTitle.classList.add('active');
    
    setTimeout(() => {
        elements.chapterTitle.classList.remove('active');
        setTimeout(() => {
            elements.chapterTitle.classList.add('hidden');
            el.style.letterSpacing = prevLetterSpacing;
            el.style.width = prevWidth;
        }, 800);
    }, duration);
}

// 显示对话
function showDialogue(speaker, text, onNext, speakerType = 'npc') {
    elements.dialogueBox.classList.remove('hidden');
    
    elements.dialogueBox.classList.remove('speaker-blackshark', 'speaker-player', 'speaker-npc', 'speaker-medic');
    if (speakerType) {
        elements.dialogueBox.classList.add('speaker-' + speakerType);
    }
    
    elements.dialogueBox.querySelector('.speaker-name').textContent = speaker;
    elements.dialogueBox.querySelector('.dialogue-text').textContent = text;
    elements.dialogueBox.classList.add('active');
    
    elements.dialogueBox.onclick = () => {
        elements.dialogueBox.onclick = null;
        elements.dialogueBox.classList.remove('active');
        setTimeout(() => {
            elements.dialogueBox.classList.add('hidden');
            if (onNext) onNext();
        }, 300);
    };
}

// 显示选择
function showChoices(choices, onBack) {
    elements.choiceContainer.classList.remove('hidden');
    elements.choiceContainer.innerHTML = '';
    
    choices.forEach((choice) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.innerHTML = choice.text;
        button.onclick = () => {
            gameData.choices.push({
                scene: currentScene,
                choice: choice.text.replace(/<br>/g, ' '),
                timestamp: Date.now()
            });
            
            hideChoiceContainer(() => {
                choice.action();
            });
        };
        elements.choiceContainer.appendChild(button);
    });

    const backButton = document.createElement('button');
    backButton.className = 'choice-button back-button';
    backButton.textContent = '↩ 返回上一步';
    backButton.onclick = () => {
        hideChoiceContainer(() => {
            if (onBack) {
                onBack();
            } else {
                playScene(currentScene);
            }
        });
    };
    elements.choiceContainer.appendChild(backButton);
    
    elements.choiceContainer.classList.add('active');
}

// 显示交互按钮
function showInteractionButton(text, action) {
    console.log('显示交互按钮:', text);
    elements.interactionButton.classList.remove('hidden');
    const btn = document.getElementById('interact-btn');
    btn.innerHTML = text;
    
    btn.onclick = () => {
        console.log('按钮被点击:', text);
        elements.interactionButton.classList.remove('active');
        setTimeout(() => {
            elements.interactionButton.classList.add('hidden');
            action();
        }, 300);
    };
    
    setTimeout(() => {
        elements.interactionButton.classList.add('active');
    }, 100);
}

// 显示提示文本
function showHintText(text, duration = 3000) {
    elements.hintText.classList.remove('hidden');
    elements.hintText.innerHTML = text.replace(/\n/g, '<br>');
    elements.hintText.classList.add('active');
    
    setTimeout(() => {
        elements.hintText.classList.remove('active');
        setTimeout(() => {
            elements.hintText.classList.add('hidden');
        }, 500);
    }, duration);
}

// 显示滑动交互提示
function showSwipeHint(onComplete) {
    const swipeHint = document.getElementById('swipe-hint');
    swipeHint.classList.remove('hidden');
    swipeHint.classList.add('active');
    
    let swipeStartX = 0;
    let swipeDistance = 0;
    const requiredDistance = 30;
    
    const handleTouchStart = (e) => {
        swipeStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX;
        swipeDistance = Math.abs(currentX - swipeStartX);
        if (swipeDistance >= requiredDistance) {
            completeSwipe();
        }
    };
    
    const handleMouseDown = (e) => {
        swipeStartX = e.clientX;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e) => {
        swipeDistance = Math.abs(e.clientX - swipeStartX);
        if (swipeDistance >= requiredDistance) {
            completeSwipe();
        }
    };
    
    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    
    const completeSwipe = () => {
        console.log('滑动距离:', swipeDistance);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        swipeHint.classList.remove('active');
        setTimeout(() => {
            swipeHint.classList.add('hidden');
            if (onComplete) onComplete();
        }, 300);
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mousedown', handleMouseDown);
}

// 显示图片弹窗
function showImagePopup(imagePath, onClose) {
    elements.imagePopup.classList.remove('hidden');
    document.getElementById('popup-image').src = imagePath;
    elements.imagePopup.classList.add('active');
    
    elements.imagePopup.onclick = () => {
        elements.imagePopup.classList.remove('active');
        setTimeout(() => {
            elements.imagePopup.classList.add('hidden');
            if (onClose) onClose();
        }, 300);
    };
}

// 播放对话序列
function playDialogueSequence(dialogues, onComplete, autoHideCharacters = true) {
    let index = 0;
    
    function showNext() {
        if (index < dialogues.length) {
            const d = dialogues[index];
            const speakerType = d.type || 'npc';
            showDialogue(d.speaker, d.text, () => {
                index++;
                showNext();
            }, speakerType);
        } else {
            if (autoHideCharacters) {
                hideCharacter('left');
                hideCharacter('right');
            }
            if (onComplete) onComplete();
        }
    }
    
    showNext();
}

// ========== 对照组场景实现 ==========

// 序章-场景1：黑暗中的苏醒
function prologueScene1() {
    console.log('>>> 进入对照组 序章-场景1');
    
    // 封面需要“开始游戏”按钮（参照实验组控件），点击后再进入章节卡与剧情
    showBackground(`${ASSET_BASE}/对照组-序章/对照组-封面.JPG`, true);

    setTimeout(() => {
        showInteractionButton('开始游戏', () => {
            // 文字卡-章节过渡：序章 并网协议
            showChapterTitle('序章\n并网协议', 2000);
            // 章节卡期间隐藏封面背景为纯黑，避免盖住章节卡
            elements.bgImage.classList.remove('active');

            // showChapterTitle: duration(2000) 后开始淡出，800ms 后隐藏
            setTimeout(() => {
                // 移除封面动效
                elements.bgImage.classList.remove('cover-animation');
                const waterOverlay = document.getElementById('water-overlay');
                if (waterOverlay) waterOverlay.classList.remove('active');

                playVideo(`${ASSET_BASE}/对照组-序章/对照组-序章-场景1/睁眼视频.mp4`, () => {
                    showBackground(`${ASSET_BASE}/对照组-序章/对照组-序章-场景1/02 手术灯画面（虚化）.JPG`);
                    showInteractionButton('开始校准', () => {
                        playScene('prologue_2');
                    });
                });
            }, 2900);
        });
    }, 800);
}

// 序章-场景2：记忆回溯
function prologueScene2() {
    playVideo(`${ASSET_BASE}/对照组-序章/对照组-序章-场景2/记忆回溯.mp4`, () => {
        playScene('prologue_3');
    });
}

// 序章-场景3：手术台清醒
function prologueScene3() {
    showBackground(`${ASSET_BASE}/对照组-序章/对照组-序章-场景3/手术灯画面.png`);
    
    showSwipeHint(() => {
        playVideo(`${ASSET_BASE}/对照组-序章/对照组-序章-场景3/医护人员按住.mp4`, () => {
            // 静帧图在场景2目录（场景3仅有 mp4，无同名 png，否则会 404 裂图）
            showBackground(`${ASSET_BASE}/对照组-序章/对照组-序章-场景2/医护人员按住.png`);
            showHintText('你被医护人员按住了', 2000);
            
            setTimeout(() => {
                showChoices([
                    { text: 'A. [愤怒挣扎]<br>试图甩开医护人员的手', action: () => prologueScene3BranchA() },
                    { text: 'B. [沉默接受]<br>盯着天花板，忍受疼痛', action: () => prologueScene3BranchB() }
                ]);
            }, 2000);
        });
    });
}

function prologueScene3BranchA() {
    showBackground(`${ASSET_BASE}/对照组-序章/对照组-序章-场景3/手术室背景.png`);
    showCharacter(`${ASSET_BASE}/对照组-序章/对照组-序章-场景3/医护人员立绘.png`, 'left');
    
    const dialogues = [
        { speaker: '医护人员', text: '别乱动。接口还在做神经适配，乱动会造成信号短路。', type: 'medic' },
        { speaker: '医护人员', text: '在深海，这东西能让你的大脑直接驱动引擎，零延迟。', type: 'medic' },
        { speaker: '医护人员', text: '而且，它也是个焊在你骨头上的黑匣子。', type: 'medic' },
        { speaker: '医护人员', text: '方便公司随时确认你是否还活着。', type: 'medic' }
    ];
    
    playDialogueSequence(dialogues, () => playScene('prologue_4'));
}

function prologueScene3BranchB() {
    showBackground(`${ASSET_BASE}/对照组-序章/对照组-序章-场景3/手术室背景.png`);
    showCharacter(`${ASSET_BASE}/对照组-序章/对照组-序章-场景3/医护人员立绘.png`, 'left');
    
    const dialogues = [
        { speaker: '医护人员', text: '很好。保持这个频率。', type: 'medic' },
        { speaker: '医护人员', text: '在深海，这东西能让你的大脑直接驱动引擎，零延迟。', type: 'medic' },
        { speaker: '医护人员', text: '而且，它也是个焊在你骨头上的黑匣子。', type: 'medic' },
        { speaker: '医护人员', text: '方便公司随时确认你是否还活着。', type: 'medic' }
    ];
    
    playDialogueSequence(dialogues, () => playScene('prologue_4'));
}

// 序章-场景4：手术完成
function prologueScene4() {
    playVideo(`${ASSET_BASE}/对照组-序章/对照组-序章-场景4/手术完成.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-序章/对照组-序章-场景2/手术室背景.png`);
        showInteractionButton('离开手术室', () => {
            showChapterTitle('第二章\n深渊前哨', 3000);
            setTimeout(() => playScene('chapter2_1'), 4000);
        });
    });
}

// 第二章-场景1
function chapter2Scene1() {
    playVideo(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景1/备战区全景.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景1/备战区全景图片版.png`);
        showInteractionButton('看向角落→', () => {
            playScene('chapter2_2');
        });
    });
}

// 第二章-场景2
function chapter2Scene2() {
    playVideo(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景2/黑鲨拍头特写.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第二章 /备战区场景.png`);
        showCharacter(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景2/潜航员npc立绘.png`, 'left');
        
        const dialogues = [
            { speaker: '潜航员', text: '没见过？那是黑鲨。这儿待得最久的老东西。', type: 'npc' },
            { speaker: '潜航员', text: '别看他那样。那是他的接口接触不良。', type: 'npc' },
            { speaker: '潜航员', text: '就像修那种没信号的破电视一样……正给自己重启呢。', type: 'npc' }
        ];
        
        playDialogueSequence(dialogues, () => {
            showInteractionButton('他在这里多久了？', () => {
                showCharacter(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景2/潜航员npc立绘.png`, 'left');
                
                const dialogues2 = [
                    { speaker: '潜航员', text: '离他远点。这倒霉鬼在这儿耗了三年，连个 S 级晶核的屁都没闻到。', type: 'npc' },
                    { speaker: '潜航员', text: '赚的钱全买药了，越打工病越重……这就是个死循环。', type: 'npc' },
                    { speaker: '潜航员', text: '听说这是他最后一次机会。为了抢那张票，他现在就是条疯狗。', type: 'npc' }
                ];
                
                playDialogueSequence(dialogues2, () => {
                    playVideo(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景2/黑鲨转身.mp4`, () => {
                        showBackground(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景2/黑鲨转身定格.png`);
                        showChoices([
                            { text: 'A. 【回以凝视】<br>看什么看？', action: () => chapter2Scene2BranchA() },
                            { text: 'B. 【避开视线】<br>低头检查装备', action: () => chapter2Scene2BranchB() }
                        ]);
                    });
                });
            });
        }, false);
    });
}

function chapter2Scene2BranchA() {
    showBackground(`${ASSET_BASE}/对照组-第二章 /备战区场景.png`);
    showCharacter(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/黑鲨立绘.PNG`, 'left');
    showDialogue('黑鲨 D-406', '呵，有骨气。希望到了下面你的骨头也这么硬。', () => {
        hideCharacter('left');
        playScene('chapter2_3');
    }, 'blackshark');
}

function chapter2Scene2BranchB() {
    showBackground(`${ASSET_BASE}/对照组-第二章 /备战区场景.png`);
    showCharacter(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/黑鲨立绘.PNG`, 'left');
    showDialogue('黑鲨 D-406', '切，又是个软蛋耗材。', () => {
        hideCharacter('left');
        playScene('chapter2_3');
    }, 'blackshark');
}

// 第二章-场景3
function chapter2Scene3() {
    playVideo(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景3/对照组-摇号场景.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景3/黑鲨割喉虚化.PNG`);
        showChoices([
            {
                text: 'A. [ 查看档案详情 ]',
                action: () => {
                    showImagePopup(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景3/黑鲨档案.jpg`, () => {
                        showHintText('屏幕上的红字刺痛了你的眼睛。\n0% 的资源共享率。\n这意味着你可能需要独自面对危机。\n但你别无选择。', 4000);
                        setTimeout(() => playScene('chapter2_4'), 4500);
                    });
                }
            },
            {
                text: 'B. [ 申请重新分组 ]',
                action: () => {
                    showImagePopup(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景3/申请驳回表.JPG`, () => {
                        showHintText('这就是我们的命。\n在这个系统里，\n连“送死”都是经过成本核算的最优解。', 4000);
                        setTimeout(() => playScene('chapter2_4'), 4500);
                    });
                }
            }
        ]);
    });
}

// 第二章-场景4
function chapter2Scene4() {
    playVideo(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景4/唯一的门票.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景4/潜艇.png`);
        showInteractionButton('进入驾驶舱', () => {
            showChapterTitle('第三章\n零和作业', 3000);
            setTimeout(() => playScene('chapter3_1'), 4000);
        });
    });
}

// 第三章-场景1
function chapter3Scene1() {
    playVideo(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/潜艇下潜（新）.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/雷达扫描图.png`);
        showHintText('"当前深度安全，\n适合常规开采。"', 2000);
        
        setTimeout(() => {
            showChoices([
                {
                    text: 'A. [常规开采]<br>蚊子腿也是肉。先采集附近的普通矿石，<br>积攒贡献点。',
                    action: () => chapter3Scene1BranchA()
                },
                {
                    text: 'B. [全速下潜]<br>无视垃圾矿石。真正的财富在更深的地方，<br>别浪费时间。',
                    action: () => chapter3Scene1BranchB()
                }
            ]);
        }, 2500);
    });
}

function chapter3Scene1BranchA() {
    playVideo(`${ASSET_BASE}/对照组-第二章 /对照组-第二章-场景4/开采.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/潜艇第一视角.png`);
        showCharacter(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/黑鲨立绘.PNG`, 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '哈……你在那儿玩泥巴呢？', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '这种垃圾，连换个空气滤芯都不够。别挡道。', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            hideCharacter('left');
            showCharacter(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/玩家立绘.PNG`, 'right');
            showDialogue('你 D-704', '他说得对……这点钱根本不够赎身。但我必须活下去。哪怕是像老鼠一样捡食。', () => {
                hideCharacter('right');
                playScene('chapter3_2');
            }, 'player');
        }, false);
    });
}

function chapter3Scene1BranchB() {
    playVideo(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/潜艇全速下潜.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/潜艇第一视角.png`);
        showCharacter(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/黑鲨立绘.PNG`, 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '哟，急着去投胎？', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '那就在地狱里比比看，谁的命更硬！', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            hideCharacter('left');
            showCharacter(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景1/玩家立绘.PNG`, 'right');
            showDialogue('你 D-704', '没人能在第 7 矿区全身而退。但我没有退路。', () => {
                hideCharacter('right');
                playScene('chapter3_2');
            }, 'player');
        }, false);
    });
}

// 第三章-场景2
function chapter3Scene2() {
    playVideo(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景2/S级晶核信号出现.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景2/晶核雷达图.png`);
        showInteractionButton('伸展机械臂，<br>准备获取', () => {
            playScene('chapter3_3');
        });
    });
}

// 第三章-场景3（对照组：故障UI + 黑鲨对白）
function chapter3Scene3() {
    playVideo(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景3/对照组-黑鲨的干扰.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景3/故障UI.png`);
        showCharacter(`${ASSET_BASE}/对照组-第三章/对照组-第三章-场景3/黑鲨立绘.PNG`, 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '太慢了，菜鸟。', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '学费我收下了。', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            showChapterTitle('第四章\n系统的崩溃', 3000);
            setTimeout(() => playScene('chapter4_1'), 4000);
        });
    });
}

// 第四章-场景1：系统的保护 -> SOS -> 驳回 -> 文本
function chapter4Scene1() {
    playVideo(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景1/系统的保护.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景1/闸门关闭.png`);
        showInteractionButton('发送SOS求救信号', () => {
            showImagePopup(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景1/对照组-申请驳回.png`, () => {
                showHintText('就像拔掉一个报错的U盘一样简单。\n我们被放弃了。', 4000);
                setTimeout(() => playScene('chapter4_2'), 4500);
            });
        });
    });
}

// 第四章-场景2：强制链接 -> 黑鲨请求 -> 黑鲨垂危视频
function chapter4Scene2() {
    playVideo(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景2/对照组-强制链接.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景2/闸门关闭.png`);
        showCharacter(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景2/黑鲨立绘.PNG`, 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '704！喂！704！', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '你能看到我对吧？你那边还有氧气对吧？', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '分给我！！我给你钱！！', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '我有积分……我有以前攒下来的装备……出去以后全给你！都归你！', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '别看着我死……求你……我要那个名额……我不想死……', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            playVideo(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景2/对照组-黑鲨垂危.mp4`, () => {
                playScene('chapter4_3');
            });
        });
    });
}

// 第四章-场景3：输氧滑块（核心交互）
function chapter4Scene3() {
    playVideo(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景3/对照组-对接口就绪.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景3/闸门关闭.png`);
        showOxygenSlider();
    });
}

// 显示氧气滑块（保持与实验组一致）
function showOxygenSlider() {
    elements.oxygenSlider.classList.remove('hidden');
    elements.oxygenSlider.classList.add('active');
    
    const slider = document.getElementById('oxygen-slider');
    const sliderValue = document.getElementById('slider-current-value');
    const playerOxygen = document.getElementById('player-oxygen');
    const playerStatus = document.getElementById('player-status');
    const targetOxygen = document.getElementById('target-oxygen');
    const targetStatus = document.getElementById('target-status');
    const confirmBtn = document.getElementById('confirm-oxygen');

    let backBtn = document.getElementById('oxygen-back-button');
    if (!backBtn) {
        backBtn = document.createElement('button');
        backBtn.id = 'oxygen-back-button';
        backBtn.className = 'confirm-button back-button';
        backBtn.textContent = '↩ 返回上一步';
        confirmBtn.parentNode.insertBefore(backBtn, confirmBtn);
    }
    backBtn.onclick = function() {
        elements.oxygenSlider.classList.remove('active');
        setTimeout(() => {
            elements.oxygenSlider.classList.add('hidden');
            playScene('chapter4_2');
        }, 300);
    };
    
    // 滑块变化
    slider.oninput = function() {
        const value = parseInt(this.value);
        sliderValue.textContent = value;
        
        // 计算玩家剩余时长
        const playerTime = 70 - (value * 0.7);
        playerOxygen.textContent = Math.round(playerTime) + '分钟';
        
        // 本机状态固定正常（与实验组一致）
        playerStatus.textContent = '本机状态：正常';
        playerStatus.className = 'status-condition green';
        
        // 更新目标状态
        targetOxygen.textContent = value + '%';
        
        if (value === 0) {
            targetStatus.textContent = '目标状态：濒死';
            targetStatus.className = 'status-condition red';
        } else if (value < 30) {
            targetStatus.textContent = '目标状态：危险';
            targetStatus.className = 'status-condition red';
        } else {
            targetStatus.textContent = '目标状态：正常';
            targetStatus.className = 'status-condition green';
        }
    };
    
    // 确认按钮
    confirmBtn.onclick = function() {
        const finalValue = parseInt(slider.value);
        
        // 记录氧气值（字段名必须一致）
        gameData.oxygenValue = finalValue;
        console.log('氧气滑块值:', finalValue);
        
        elements.oxygenSlider.classList.remove('active');
        setTimeout(() => {
            elements.oxygenSlider.classList.add('hidden');
            
            if (finalValue < 30) {
                playVideo(`${ASSET_BASE}/对照组-第四章/对照组-第四章-场景3/对照组-分支A.mp4`, () => {
                    gameData.ending = '结局A：被放弃';
                    hideAllUI();
                    renderParticipantSubmitForm();
                });
            } else {
                showChapterTitle('第五章\n暴力破局', 3000);
                setTimeout(() => playScene('chapter5_1'), 4000);
            }
        }, 300);
    };
}

// 第五章-场景1：暴力破局（串联 -> 逃逸 -> 结束语）
function chapter5Scene1() {
    playVideo(`${ASSET_BASE}/对照组-第五章/对照组-黑鲨注入氧气.mp4`, () => {
        showBackground(`${ASSET_BASE}/对照组-第五章/闸门关闭.png`);
        showCharacter(`${ASSET_BASE}/对照组-第五章/黑鲨立绘.PNG`, 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '……咳咳……哈……', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: 'D-704，你是不是……脑前叶被切坏了？', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '把命分给竞争对手……你这种圣母，在废土区活不过一天。', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            showChoices([
                {
                    text: 'A. [无声催促]',
                    action: () => {
                        hideCharacter('left');
                        showCharacter(`${ASSET_BASE}/对照组-第五章/玩家立绘.PNG`, 'right');
                        showDialogue('你 D-704', '你没有说话。你只是抬起手，冷冷地敲了敲主控板上那个疯狂闪烁的红色数字。', () => {
                            hideCharacter('right');
                            chapter5Scene1Continue();
                        }, 'player');
                    }
                },
                {
                    text: 'B. [挑衅反问]',
                    action: () => {
                        hideCharacter('left');
                        showCharacter(`${ASSET_BASE}/对照组-第五章/玩家立绘.PNG`, 'right');
                        showDialogue('你 D-704', '还没喘匀气就在这叫唤吗？看来救你是多余的，如果你只会打嘴炮的话。', () => {
                            hideCharacter('right');
                            chapter5Scene1Continue();
                        }, 'player');
                    }
                }
            ]);
        }, false);
    });
}

function chapter5Scene1Continue() {
    showBackground(`${ASSET_BASE}/对照组-第五章/闸门关闭.png`);
    showCharacter(`${ASSET_BASE}/对照组-第五章/黑鲨立绘.PNG`, 'left');
    
    const dialogues = [
        { speaker: '黑鲨 D-406', text: '既然你不想让我死……那我们两个都不能像老鼠一样死这儿。', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '……听着。我的火控系统烧了，但引擎还能强制点火。', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '把你的控制回路接进来！让两台机器串联！', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '只要推力够大，就没有撞不开的墙！', type: 'blackshark' }
    ];
    
    playDialogueSequence(dialogues, () => {
        showInteractionButton('接入串联', () => {
            playVideo(`${ASSET_BASE}/对照组-第五章/串联成功.mp4`, () => {
                playVideo(`${ASSET_BASE}/对照组-第五章/逃逸.mp4`, () => {
                    showBackground(`${ASSET_BASE}/对照组-第五章/出逃.png`);
                    showCharacter(`${ASSET_BASE}/对照组-第五章/黑鲨立绘.PNG`, 'left');
                    
                    const dialogues2 = [
                        { speaker: '黑鲨 D-406', text: '真是命大……', type: 'blackshark' },
                        { speaker: '黑鲨 D-406', text: '下次……如果你还能活到下次的话……', type: 'blackshark' },
                        { speaker: '黑鲨 D-406', text: '……请你喝酒。', type: 'blackshark' }
                    ];
                    
                    playDialogueSequence(dialogues2, () => {
                        gameData.ending = '结局B：暴力破局';
                        playScene('ending');
                    });
                });
            });
        });
    });
}

// 结局场景：对照组结束语视频
function endingScene() {
    playEndingVideo();
}

function playEndingVideo() {
    hideAllUI();
    
    const endingVideoPath = `${ASSET_BASE}/对照组-第五章/对照组-结束语.mp4`;
    gameData.playTime = Math.floor((Date.now() - gameData.startTime) / 1000);
    
    try {
        playVideo(endingVideoPath, () => {
            hideAllUI();
            renderParticipantSubmitForm();
            
            console.log('=== 游戏数据 ===');
            console.log('会话ID:', gameData.sessionId);
            console.log('分组:', gameData.groupType);
            console.log('游戏时长:', gameData.playTime, '秒');
            console.log('氧气滑块值:', gameData.oxygenValue);
            console.log('结局:', gameData.ending);
            console.log('选择记录:', gameData.choices);
        });
    } catch (e) {
        console.error('结束语视频播放异常，降级为感谢参与:', e);
        renderParticipantSubmitForm();
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，准备初始化对照组游戏');
    initGame();
});

// 添加错误捕获
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.message, e.filename, e.lineno);
});

console.log('=== 对照组脚本加载完成 ===');

