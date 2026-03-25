// 深渊呼吸 - 游戏核心逻辑
console.log('=== 游戏脚本加载 ===');
console.log('BUILD:', '2026-02-18 22:10 v20260218_1');

// 游戏数据收集
const gameData = {
    sessionId: '',
    groupType: '实验组',
    startTime: Date.now(),
    choices: [],
    oxygenValue: 0,
    playTime: 0,
    ending: ''
};

// 生成会话ID
function generateSessionId() {
    const timestamp = Date.now();
    const isExperiment = timestamp % 2 === 0; // 奇偶数随机分组
    gameData.groupType = isExperiment ? '实验组' : '对照组';
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
    console.log('========== 游戏初始化 ==========');
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
    console.log('准备启动游戏...');
    setTimeout(() => {
        console.log('>>> 调用 startGame()');
        startGame();
    }, 500);
}

// 开始游戏
function startGame() {
    // 播放序章场景1
    playScene('prologue_1');
}

// 播放场景
function playScene(sceneId) {
    console.log('播放场景:', sceneId);
    currentScene = sceneId;
    
    // 清除当前UI
    hideAllUI();
    
    // 根据场景ID执行对应逻辑
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
        'chapter5_1': chapter5Scene1,
        'chapter5_2': chapter5Scene2,
        'chapter6_1': chapter6Scene1,
        'chapter6_2': chapter6Scene2,
        'chapter6_3': chapter6Scene3,
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
    
    // 隐藏背景图，确保视频可见
    elements.bgImage.classList.remove('active');
    
    elements.video.src = videoPath;
    elements.video.classList.add('active');
    
    // 尝试播放视频
    const playPromise = elements.video.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('✓ 视频播放成功');
            })
            .catch(error => {
                console.error('✗ 视频播放失败:', error);
                alert('视频播放失败，请检查素材文件：' + videoPath);
                // 如果播放失败，直接跳到结束回调
                if (onEnd) onEnd();
            });
    }
    
    elements.video.onended = () => {
        console.log('视频播放结束');
        elements.video.classList.remove('active');
        if (onEnd) onEnd();
    };
    
    // 添加错误处理
    elements.video.onerror = () => {
        console.error('✗ 视频加载错误:', videoPath);
        elements.video.classList.remove('active');
        alert('视频加载失败：' + videoPath + '\n请检查文件是否存在');
        if (onEnd) onEnd();
    };
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
    // 直接使用传入的标题（已经去掉冒号并换行）
    const el = elements.chapterTitle.querySelector('.chapter-text');
    el.textContent = title;

    // 仅修复：第四章“利维坦的叹息”不应被自动折行
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
            // 复原行距/宽度（避免影响其它章节）
            el.style.letterSpacing = prevLetterSpacing;
            el.style.width = prevWidth;
        }, 800);
    }, duration);
}

// 显示对话
function showDialogue(speaker, text, onNext, speakerType = 'npc') {
    elements.dialogueBox.classList.remove('hidden');
    
    // 移除所有speaker类
    elements.dialogueBox.classList.remove('speaker-blackshark', 'speaker-player', 'speaker-npc', 'speaker-medic');
    
    // 根据说话人添加对应类（用于显示icon）
    if (speakerType) {
        elements.dialogueBox.classList.add('speaker-' + speakerType);
    }
    
    // 设置说话人名称和对话文本
    elements.dialogueBox.querySelector('.speaker-name').textContent = speaker;
    elements.dialogueBox.querySelector('.dialogue-text').textContent = text;
    elements.dialogueBox.classList.add('active');
    
    // 点击继续
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
function showChoices(choices) {
    elements.choiceContainer.classList.remove('hidden');
    elements.choiceContainer.innerHTML = '';
    
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.innerHTML = choice.text; // 改为innerHTML支持<br>换行
        button.onclick = () => {
            // 记录选择
            gameData.choices.push({
                scene: currentScene,
                choice: choice.text.replace(/<br>/g, ' '), // 移除HTML标签记录
                timestamp: Date.now()
            });
            
            elements.choiceContainer.classList.remove('active');
            setTimeout(() => {
                elements.choiceContainer.classList.add('hidden');
                choice.action();
            }, 300);
        };
        elements.choiceContainer.appendChild(button);
    });
    
    elements.choiceContainer.classList.add('active');
}

// 显示交互按钮
function showInteractionButton(text, action) {
    console.log('显示交互按钮:', text);
    elements.interactionButton.classList.remove('hidden');
    const btn = document.getElementById('interact-btn');
    
    // 不自动添加换行，完全依赖传入的文本
    btn.innerHTML = text;
    
    btn.onclick = () => {
        console.log('按钮被点击:', text);
        elements.interactionButton.classList.remove('active');
        setTimeout(() => {
            elements.interactionButton.classList.add('hidden');
            action();
        }, 300);
    };
    
    // 延迟显示，确保渲染
    setTimeout(() => {
        elements.interactionButton.classList.add('active');
    }, 100);
}

// 显示提示文本
function showHintText(text, duration = 3000) {
    elements.hintText.classList.remove('hidden');
    elements.hintText.innerHTML = text.replace(/\n/g, '<br>'); // 支持换行
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
    const requiredDistance = 30; // 需要滑动的最小距离
    
    // 触摸事件（移动端）
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
    
    // 鼠标事件（桌面端）
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
    
    // 完成滑动
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
    
    // 绑定事件
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

// ========== 场景实现 ==========

// 序章-场景1：黑暗中的苏醒
function prologueScene1() {
    console.log('>>> 进入序章-场景1');
    
    // 显示游戏封面（带动效）
    showBackground('游戏素材/序章/游戏封面.JPG', true);
    
    // 显示开始按钮
    setTimeout(() => {
        console.log('显示开始游戏按钮');
        showInteractionButton('开始游戏', () => {
            console.log('用户点击开始游戏，播放开场视频');
            // 移除封面动效
            elements.bgImage.classList.remove('cover-animation');
            const waterOverlay = document.getElementById('water-overlay');
            if (waterOverlay) {
                waterOverlay.classList.remove('active');
            }
            
            // 第四版：开始游戏后显示“序章 / 并网协议”章节卡
            showChapterTitle('序章\n并网协议', 2000);

            // 修复：章节卡期间隐藏封面背景为纯黑；章节卡完全消失后再播放视频（不允许视频覆盖章节卡）
            elements.bgImage.classList.remove('active');

            // showChapterTitle: duration(2000) 后开始淡出，800ms 后隐藏
            setTimeout(() => {
                playVideo('游戏素材/序章/序章-场景1/睁眼视频.mp4', () => {
                    console.log('开场视频播放完毕');
                    showBackground('游戏素材/序章/序章-场景1/02 手术灯画面（虚化）.JPG');
                    showInteractionButton('开始校准', () => {
                        playScene('prologue_2');
                    });
                });
            }, 2900);
        });
    }, 1200);
}

// 序章-场景2：记忆回溯
function prologueScene2() {
    playVideo('游戏素材/序章/序章-场景2/记忆回溯.mp4', () => {
        playScene('prologue_3');
    });
}

// 序章-场景3：手术台清醒
function prologueScene3() {
    showBackground('游戏素材/序章/序章-场景3/手术灯画面.png');
    
    // 显示滑动交互提示
    showSwipeHint(() => {
        console.log('滑动交互完成');
        playVideo('游戏素材/序章/序章-场景3/医护人员按住.mp4', () => {
            // 第四版：分支交互背景改为“医护人员按住.png”
            showBackground('游戏素材/序章/序章-场景3/医护人员按住.png');
            showHintText('你被医护人员按住了', 2000);
            
            setTimeout(() => {
                showChoices([
                    {
                        text: 'A. [愤怒挣扎]<br>试图甩开医护人员的手',
                        action: () => prologueScene3BranchA()
                    },
                    {
                        text: 'B. [沉默接受]<br>盯着天花板，忍受疼痛',
                        action: () => prologueScene3BranchB()
                    }
                ]);
            }, 2000);
        });
    });
}

// 序章-场景3 分支A
function prologueScene3BranchA() {
    showBackground('游戏素材/序章/序章-场景3/手术室背景.png');
    showCharacter('游戏素材/序章/序章-场景3/医护人员立绘.png', 'left');
    
    const dialogues = [
        { speaker: '医护人员', text: '别乱动。接口还在做神经适配，乱动会造成信号短路。', type: 'medic' },
        { speaker: '医护人员', text: '在深海，这东西能让你的大脑直接驱动引擎，零延迟。', type: 'medic' },
        { speaker: '医护人员', text: '而且，它也是个焊在你骨头上的黑匣子。', type: 'medic' },
        { speaker: '医护人员', text: '方便公司随时确认你是否还活着。', type: 'medic' }
    ];
    
    playDialogueSequence(dialogues, () => {
        playScene('prologue_4');
    });
}

// 序章-场景3 分支B
function prologueScene3BranchB() {
    showBackground('游戏素材/序章/序章-场景3/手术室背景.png');
    showCharacter('游戏素材/序章/序章-场景3/医护人员立绘.png', 'left');
    
    const dialogues = [
        { speaker: '医护人员', text: '很好。保持这个频率。', type: 'medic' },
        { speaker: '医护人员', text: '在深海，这东西能让你的大脑直接驱动引擎，零延迟。', type: 'medic' },
        { speaker: '医护人员', text: '而且，它也是个焊在你骨头上的黑匣子。', type: 'medic' },
        { speaker: '医护人员', text: '方便公司随时确认你是否还活着。', type: 'medic' }
    ];
    
    playDialogueSequence(dialogues, () => {
        playScene('prologue_4');
    });
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
            // 默认隐藏角色，除非指定不隐藏
            if (autoHideCharacters) {
                hideCharacter('left');
                hideCharacter('right');
            }
            if (onComplete) onComplete();
        }
    }
    
    showNext();
}

// 序章-场景4：手术完成
function prologueScene4() {
    playVideo('游戏素材/序章/序章-场景4/手术完成.mp4', () => {
        showBackground('游戏素材/序章/序章-场景3/手术室背景.png');
        showInteractionButton('离开手术室', () => {
            showChapterTitle('第二章\n深渊前哨', 3000); // 去冒号+换行
            setTimeout(() => {
                playScene('chapter2_1');
            }, 4000);
        });
    });
}

// 第二章-场景1
function chapter2Scene1() {
    playVideo('游戏素材/第二章 /第二章-场景1/备战区全景.mp4', () => {
        showBackground('游戏素材/第二章 /第二章-场景1/备战区全景图片版.png');
        showInteractionButton('看向角落→', () => {
            playScene('chapter2_2');
        });
    });
}

// 第二章-场景2
function chapter2Scene2() {
    playVideo('游戏素材/第二章 /第二章-场景2/黑鲨拍头特写.mp4', () => {
        showBackground('游戏素材/第二章 /备战区场景.png');
        showCharacter('游戏素材/第二章 /第二章-场景2/潜航员npc立绘.png', 'left');
        
        const dialogues = [
            { speaker: '潜航员', text: '没见过？那是黑鲨。这儿待得最久的老东西。', type: 'npc' },
            { speaker: '潜航员', text: '别看他那样。那是他的接口接触不良。', type: 'npc' },
            { speaker: '潜航员', text: '就像修那种没信号的破电视一样……正给自己重启呢。', type: 'npc' }
        ];
        
        playDialogueSequence(dialogues, () => {
            showInteractionButton('他在这里多久了？', () => {
                // 继续显示NPC立绘
                showCharacter('游戏素材/第二章 /第二章-场景2/潜航员npc立绘.png', 'left');
                
                const dialogues2 = [
                    { speaker: '潜航员', text: '离他远点。这倒霉鬼在这儿耗了三年，连个 S 级晶核的屁都没闻到。', type: 'npc' },
                    { speaker: '潜航员', text: '赚的钱全买药了，越打工病越重……这就是个死循环。', type: 'npc' },
                    { speaker: '潜航员', text: '听说这是他最后一次机会。为了抢那张票，他现在就是条疯狗。', type: 'npc' }
                ];
                
                playDialogueSequence(dialogues2, () => {
                    playVideo('游戏素材/第二章 /第二章-场景2/黑鲨转身.mp4', () => {
                        // 第四版：分支选择时增加定格背景
                        showBackground('游戏素材/第二章 /第二章-场景2/黑鲨转身定格.png');
                        showChoices([
                            {
                                text: 'A. 【回以凝视】<br>看什么看？',
                                action: () => chapter2Scene2BranchA()
                            },
                            {
                                text: 'B. 【避开视线】<br>低头检查装备',
                                action: () => chapter2Scene2BranchB()
                            }
                        ]);
                    });
                });
            });
        }, false); // 不自动隐藏立绘
    });
}

// 第二章-场景2 分支A
function chapter2Scene2BranchA() {
    showBackground('游戏素材/第二章 /备战区场景.png');
    showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
    
    showDialogue('黑鲨 D-406', '呵，有骨气。希望到了下面你的骨头也这么硬。', () => {
        hideCharacter('left');
        playScene('chapter2_3');
    }, 'blackshark');
}

// 第二章-场景2 分支B
function chapter2Scene2BranchB() {
    showBackground('游戏素材/第二章 /备战区场景.png');
    showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
    
    showDialogue('黑鲨 D-406', '切，又是个软蛋耗材。', () => {
        hideCharacter('left');
        playScene('chapter2_3');
    }, 'blackshark');
}

// 第二章-场景3
function chapter2Scene3() {
    playVideo('游戏素材/第二章 /第二章-场景3/摇号场景.mp4', () => {
        showBackground('游戏素材/第二章 /第二章-场景3/黑鲨割喉虚化.PNG');
        
        showChoices([
            {
                text: 'A. [ 查看档案详情 ]',
                action: () => {
                    showImagePopup('游戏素材/第二章 /第二章-场景3/黑鲨档案.png', () => {
                        showHintText('屏幕上的红字刺痛了你的眼睛。\n100% 的报废率。\n在他身边的人，没有一个是活着回来的。\n但你别无选择。', 4000);
                        setTimeout(() => {
                            playScene('chapter2_4');
                        }, 4500);
                    });
                }
            },
            {
                text: 'B. [ 申请重新分组 ]',
                action: () => {
                    showImagePopup('游戏素材/第二章 /第二章-场景3/申请驳回表.JPG', () => {
                        showHintText('这就是我们的命。\n在这个系统里，\n连"送死"都是经过成本核算的最优解。', 4000);
                        setTimeout(() => {
                            playScene('chapter2_4');
                        }, 4500);
                    });
                }
            }
        ]);
    });
}

// 第二章-场景4
function chapter2Scene4() {
    playVideo('游戏素材/第二章 /第二章-场景4/唯一的门票.mp4', () => {
        showBackground('游戏素材/第二章 /第二章-场景4/潜艇.png');
        showInteractionButton('进入驾驶舱', () => {
            showChapterTitle('第三章\n深渊法则', 3000); // 去冒号+换行
            setTimeout(() => {
                playScene('chapter3_1');
            }, 4000);
        });
    });
}

// 第三章-场景1
function chapter3Scene1() {
    playVideo('游戏素材/第三章/第三章-场景1/潜艇下潜.mp4', () => {
        showBackground('游戏素材/第三章/第三章-场景1/雷达扫描图.png');
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

// 第三章-场景1 分支A
function chapter3Scene1BranchA() {
    playVideo('游戏素材/第二章 /第二章-场景4/开采.mp4', () => {
        showBackground('游戏素材/第三章/第三章-场景1/潜艇第一视角.png');
        showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '哈……你在那儿玩泥巴呢？', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '这种垃圾，连换个空气滤芯都不够。别挡道。', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            hideCharacter('left'); // 黑鲨说完消失
            showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
            showDialogue('你 D-704', '他说得对……这点钱根本不够赎身。但我必须活下去。哪怕是像老鼠一样捡食。', () => {
                hideCharacter('right');
                playScene('chapter3_2');
            }, 'player');
        }, false);
    });
}

// 第三章-场景1 分支B
function chapter3Scene1BranchB() {
    playVideo('游戏素材/第三章/第三章-场景1/潜艇全速下潜.mp4', () => {
        showBackground('游戏素材/第三章/第三章-场景1/潜艇第一视角.png');
        showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '哟，急着去投胎？', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '那就在地狱里比比看，谁的命更硬！', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            hideCharacter('left'); // 黑鲨说完消失
            showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
            showDialogue('你 D-704', '没人能在第 7 矿区全身而退。但我没有退路。', () => {
                hideCharacter('right');
                playScene('chapter3_2');
            }, 'player');
        }, false);
    });
}

// 第三章-场景2
function chapter3Scene2() {
    playVideo('游戏素材/第三章/第三章-场景2/S级晶核信号出现.mp4', () => {
        showBackground('游戏素材/第三章/第三章-场景2/晶核雷达图.png');
        showInteractionButton('伸展机械臂，<br>准备获取', () => {
            playScene('chapter3_3');
        });
    });
}

// 第三章-场景3
function chapter3Scene3() {
    playVideo('游戏素材/第三章/第三章-场景3/黑鲨的干扰.mp4', () => {
        showBackground('游戏素材/第三章/第三章-场景3/晶石被抢走.png');
        showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '太慢了，菜鸟。', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '学费我收下了。', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            showChapterTitle('第四章\n利维坦的叹息', 3000); // 去冒号+换行
            setTimeout(() => {
                playScene('chapter4_1');
            }, 4000);
        });
    });
}

// 第四章-场景1
function chapter4Scene1() {
    playVideo('游戏素材/第四章/第四章-场景1/古神苏醒.mp4', () => {
        showBackground('游戏素材/第四章/第四章-场景1/面对巨物的驾驶舱视角.png');
        showHintText('面对这异常响动，你的选择是？', 2000);
        
        setTimeout(() => {
            showChoices([
                {
                    text: 'A. 【重新校准声呐】', // 短文字保持单行
                    action: () => {
                        playVideo('游戏素材/第四章/第四章-场景1/声呐失灵.mp4', () => {
                            playScene('chapter4_2');
                        });
                    }
                },
                {
                    text: 'B. 【贴近观测窗】', // 短文字保持单行
                    action: () => {
                        playVideo('游戏素材/第四章/第四章-场景1/肉眼观测巨物.mp4', () => {
                            playScene('chapter4_2');
                        });
                    }
                }
            ]);
        }, 2500);
    });
}

// 第四章-场景2
function chapter4Scene2() {
    playVideo('游戏素材/第四章/第四章-场景2/巨物翻身.mp4', () => {
        showBackground('游戏素材/第四章/第四章-场景2/被压住的驾驶舱.png');
        showInteractionButton('启动引擎', () => {
            playVideo('游戏素材/第四章/第四章-场景2/推开失败.mp4', () => {
                playVideo('游戏素材/第四章/第四章-场景2/强制链接.mp4', () => {
                    showBackground('游戏素材/第四章/第四章-场景2/被压住的驾驶舱.png');
                    showInteractionButton('发送SOS求救信号', () => {
                        showImagePopup('游戏素材/第四章/第四章-场景2/申请驳回.png', () => {
                            showHintText('这就是我们的命。\n公司只要晶石。\n既然现在晶石拿不到了，那我们就是两袋无需处理的垃圾。', 4000);
                            setTimeout(() => {
                                showChapterTitle('第五章\n生命线', 3000); // 去冒号+换行
                                setTimeout(() => {
                                    playScene('chapter5_1');
                                }, 4000);
                            }, 4500);
                        });
                    });
                });
            });
        });
    });
}

// 第五章-场景1
function chapter5Scene1() {
    playVideo('游戏素材/第五章/第五章-场景1/敬畏感加强.mp4', () => {
        playVideo('游戏素材/第五章/第五章-场景1/黑鲨垂危.mp4', () => {
            showBackground('游戏素材/第五章/第五章-场景1/被压住的驾驶舱.png');
            showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
            
            const dialogues = [
                { speaker: '黑鲨 D-406', text: '……哈……咳咳……', type: 'blackshark' },
                { speaker: '黑鲨 D-406', text: '……真……讽刺啊……', type: 'blackshark' },
                { speaker: '黑鲨 D-406', text: '抢了一辈子……最后……憋死在这里……我们什么也不是……', type: 'blackshark' }
            ];
            
            playDialogueSequence(dialogues, () => {
                playScene('chapter5_2');
            });
        });
    });
}

// 第五章-场景2：氧气滑块（核心交互）
function chapter5Scene2() {
    playVideo('游戏素材/第五章/第五章-场景2/对接口就绪.mp4', () => {
        showBackground('游戏素材/第五章/第五章-场景1/驾驶舱全黑.png');
        showOxygenSlider();
    });
}

// 显示氧气滑块
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
    
    // 滑块变化
    slider.oninput = function() {
        const value = parseInt(this.value);
        sliderValue.textContent = value;
        
        // 计算玩家剩余时长
        const playerTime = 70 - (value * 0.7);
        playerOxygen.textContent = Math.round(playerTime) + '分钟';
        
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
        
        // 记录氧气值
        gameData.oxygenValue = finalValue;
        console.log('氧气滑块值:', finalValue);
        
        elements.oxygenSlider.classList.remove('active');
        setTimeout(() => {
            elements.oxygenSlider.classList.add('hidden');
            
            // 根据数值判断分支（修复：30也能救活）
            if (finalValue < 30) {
                // 分支A：失败结局（小于30）
                playVideo('游戏素材/第五章/第五章-场景2/分支A.mp4', () => {
                    gameData.ending = '结局A：深渊永眠';
                    playScene('ending');
                });
            } else {
                // 分支B：继续第六章（大于等于30）
                showChapterTitle('第六章\n双星升变', 3000); // 去冒号+换行
                setTimeout(() => {
                    playScene('chapter6_1');
                }, 4000);
            }
        }, 300);
    };
}

// 第六章-场景1
function chapter6Scene1() {
    playVideo('游戏素材/第六章/第六章-场景1/黑鲨注入氧气.mp4', () => {
        showBackground('游戏素材/第六章/第六章-场景1/黑鲨苏醒.png');
        showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '……咳咳……哈……', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: 'D-704，你是不是……脑前叶被切坏了？', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '把命分给竞争对手……你这种圣母，在废土区活不过一天。', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            showChoices([
                {
                    text: 'A. [无声催促]', // 短文字保持单行
                    action: () => {
                        hideCharacter('left'); // 黑鲨消失
                        showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
                        showDialogue('你 D-704', '你没有说话。你只是抬起手，冷冷地敲了敲主控板上那个疯狂闪烁的红色数字。', () => {
                            hideCharacter('right'); // 玩家说完消失
                            chapter6Scene1Continue();
                        }, 'player');
                    }
                },
                {
                    text: 'B. [挑衅反问]', // 短文字保持单行
                    action: () => {
                        hideCharacter('left'); // 黑鲨消失
                        showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
                        showDialogue('你 D-704', '还没喘匀气就在这叫唤吗？看来救你是多余的，如果你只会打嘴炮的话。', () => {
                            hideCharacter('right'); // 玩家说完消失
                            chapter6Scene1Continue();
                        }, 'player');
                    }
                }
            ]);
        }, false); // 不自动隐藏
    });
}

function chapter6Scene1Continue() {
    showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
    
    const dialogues = [
        { speaker: '黑鲨 D-406', text: '别用那种眼神看我。', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '我也想走，但主引擎废了，整艘潜艇都锁死了', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '既然你不想死', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '……那老子就带你疯一把。', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '看这个。', type: 'blackshark' }
    ];
    
    playDialogueSequence(dialogues, () => {
        playScene('chapter6_2');
    });
}

// 第六章-场景2
function chapter6Scene2() {
    playVideo('游戏素材/第六章/第六章-场景2/黑鲨的冒险.mp4', () => {
        showBackground('游戏素材/第六章/第六章-场景2/管道关闭.png');
        showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
        
        const dialogues1 = [
            { speaker: '黑鲨 D-406', text: '该死！！', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '系统在往炉子里灌液氮！它想把反应压下去！！', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '再这样下去晶核会熄火的！！', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '听着！只有你能救这把火！！', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues1, () => {
            hideCharacter('left'); // 黑鲨说完消失
            showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
            
            const dialogues2 = [
                { speaker: '你 D-704', text: '我吗？', type: 'player' },
                { speaker: '你 D-704', text: '可是你的系统显示锁死了。', type: 'player' }
            ];
            
            playDialogueSequence(dialogues2, () => {
                hideCharacter('right'); // 玩家说完消失
                showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
                
                const dialogues3 = [
                    { speaker: '黑鲨 D-406', text: '当然锁死了！它判定我是"自杀式操作"，踢掉了我的权限', type: 'blackshark' },
                    { speaker: '黑鲨 D-406', text: '虽然我动不了，但我们的通讯端口还连着！', type: 'blackshark' },
                    { speaker: '黑鲨 D-406', text: '用你的控制台，反向入侵我的系统！', type: 'blackshark' },
                    { speaker: '黑鲨 D-406', text: '就像你平时开采矿机那样——暴力破解进来！快！！', type: 'blackshark' }
                ];
                
                playDialogueSequence(dialogues3, () => {
                    hideCharacter('left'); // 黑鲨说完消失
                    showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
                    showDialogue('你 D-704', '入侵你的潜艇？……好吧，我在试了！', () => {
                        hideCharacter('right'); // 玩家说完消失
                        showBackground('游戏素材/第六章/第六章-场景2/被压住的驾驶舱.png');
                        showInteractionButton('远程骇入', () => {
                            chapter6Scene2Part2();
                        });
                    }, 'player');
                }, false);
            }, false);
        }, false);
    });
}

function chapter6Scene2Part2() {
    showBackground('游戏素材/第六章/第六章-场景2/被压住的驾驶舱.png');
    showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
    
    const dialogues = [
        { speaker: '黑鲨 D-406', text: '信号进来了！就是现在！', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '找到那个【紧急冷却程序】！把它删了！', type: 'blackshark' }
    ];
    
    playDialogueSequence(dialogues, () => {
        hideCharacter('left');
        showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
        
        const dialogues2 = [
            { speaker: '你 D-704', text: '找到了……正在删除！', type: 'player' },
            { speaker: '你 D-704', text: '搞定了！', type: 'player' }
        ];
        
        playDialogueSequence(dialogues2, () => {
            hideCharacter('right');
            showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
            
            const dialogues3 = [
                { speaker: '黑鲨 D-406', text: '看来你还有点用处。', type: 'blackshark' },
                { speaker: '黑鲨 D-406', text: '别高兴得太早！这只是点火！', type: 'blackshark' },
                { speaker: '黑鲨 D-406', text: '反应堆马上就要炸了，这种推力会把我像弹珠一样弹飞！', type: 'blackshark' }
            ];
            
            playDialogueSequence(dialogues3, () => {
                hideCharacter('left');
                showCharacter('游戏素材/核心玩家角色/玩家立绘.PNG', 'right');
                showDialogue('你 D-704', '那我呢？我该去哪？', () => {
                    hideCharacter('right');
                    showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
                    
                    const dialogues4 = [
                        { speaker: '黑鲨 D-406', text: '你就呆在那！把你的机械爪伸出来！', type: 'blackshark' },
                        { speaker: '黑鲨 D-406', text: '死死扣住我的对接槽！', type: 'blackshark' }
                    ];
                    
                    playDialogueSequence(dialogues4, () => {
                        hideCharacter('left'); // 对话完隐藏
                        showBackground('游戏素材/第六章/第六章-场景2/被压住的驾驶舱.png');
                        showInteractionButton('进行物理对接', () => {
                                playVideo('游戏素材/第六章/第六章-场景2/引擎点燃.mp4', () => {
                                    chapter6Scene2Choice();
                                });
                            }, 'blackshark');
                        });
                    }, false);
                }, 'player');
            }, false);
        }, false);
    }, false);
}

function chapter6Scene2Choice() {
    showBackground('游戏素材/第六章/第六章-场景2/古神的泪.png');
    showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
    
    const dialogues = [
        { speaker: '黑鲨 D-406', text: '……真美啊。', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '能死在神的眼睛里，也不算亏。', type: 'blackshark' },
        { speaker: '黑鲨 D-406', text: '不过……老子还是想活！！', type: 'blackshark' }
    ];
    
    playDialogueSequence(dialogues, () => {
        hideCharacter('left'); // 黑鲨说完消失
        showHintText('请你选择引擎状态', 2000);
        
        setTimeout(() => {
            showChoices([
                {
                    text: 'A. [激进过载]<br>将引擎功率推至120%',
                    action: () => {
                        showHintText('狂暴的震动顺着操纵杆传遍全身', 2000);
                        setTimeout(() => {
                            showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
                            showDialogue('黑鲨 D-406', '疯子！我喜欢！！冲啊！！！', () => {
                                hideCharacter('left');
                                playScene('chapter6_3');
                            }, 'blackshark');
                        }, 2500);
                    }
                },
                {
                    text: 'B. [精准同步]<br>维持与黑鲨的频率一致',
                    action: () => {
                        showHintText('引擎和爆破的声音完美重叠，形成一种奇异的谐振。', 2000);
                        setTimeout(() => {
                            showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
                            showDialogue('黑鲨 D-406', '就是这个节奏，稳住了！！', () => {
                                hideCharacter('left');
                                playScene('chapter6_3');
                            }, 'blackshark');
                        }, 2500);
                    }
                }
            ]);
        }, 2500);
    }, false);
}

// 第六章-场景3
function chapter6Scene3() {
    playVideo('游戏素材/第六章/第六章-场景3/逃出生天.mp4', () => {
        showBackground('游戏素材/第六章/第六章-场景3/潜艇出水.png');
        showCharacter('游戏素材/核心玩家角色/黑鲨立绘.PNG', 'left');
        
        const dialogues = [
            { speaker: '黑鲨 D-406', text: '……呵。', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '……你这疯子。', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '下次……如果你还能活到下次的话……', type: 'blackshark' },
            { speaker: '黑鲨 D-406', text: '……请你喝酒。', type: 'blackshark' }
        ];
        
        playDialogueSequence(dialogues, () => {
            gameData.ending = '结局B：共生';
            playScene('ending');
        });
    });
}

// 结局场景
function endingScene() {
    // 第三版：结束语改为播放视频（若不存在则降级为感谢参与）
    playEndingVideo();
}

function playEndingVideo() {
    hideAllUI();

    // 结束语视频（已确认存在于素材目录）
    const endingVideoPath = '游戏素材/第六章/第六章-场景3/结束语.mp4';

    // 计算游戏时长（保留数据统计，不影响画面）
    gameData.playTime = Math.floor((Date.now() - gameData.startTime) / 1000);

    // 播放结束语视频；若失败，降级显示“感谢参与”
    try {
        playVideo(endingVideoPath, () => {
            hideAllUI();
            elements.hintText.classList.remove('hidden');
            elements.hintText.innerHTML = '感谢您的参与';
            elements.hintText.style.fontSize = '1.5rem';
            elements.hintText.style.lineHeight = '1.8';
            elements.hintText.classList.add('active');

            // 保留控制台数据输出（正式版不使用 debug.html 就不会在页面上显示）
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
        elements.hintText.classList.remove('hidden');
        elements.hintText.innerHTML = '感谢您的参与';
        elements.hintText.style.fontSize = '1.5rem';
        elements.hintText.style.lineHeight = '1.8';
        elements.hintText.classList.add('active');
    }
}

function showEnding() {
    hideAllUI();
    
    const endingText = gameData.ending === '结局B：共生' ? 
        '古神继续沉睡，太阳照常升起。\n\n并没有人战胜了深渊，\n我们只是幸运地被它遗漏。\n\n但这就够了。\n\n至少在这一刻，\n两个本来会互相残杀的疯子，\n共享了同一个心跳。\n\n一起，活下去。\n\n\nIn the face of the Vast, we are Small.\nBut together, we are infinite.' :
        '深渊吞噬了一切。\n\n没有人会记得你的名字。\n\n你只是又一个编号。\n\n又一具冰冷的数据。';
    
    elements.hintText.classList.remove('hidden');
    elements.hintText.innerHTML = endingText.replace(/\n/g, '<br>');
    elements.hintText.style.fontSize = '1rem';
    elements.hintText.style.lineHeight = '2.2';
    elements.hintText.classList.add('active');
    
    // 计算游戏时长
    gameData.playTime = Math.floor((Date.now() - gameData.startTime) / 1000);
    
    // 显示数据总结
    setTimeout(() => {
        console.log('=== 游戏数据 ===');
        console.log('会话ID:', gameData.sessionId);
        console.log('分组:', gameData.groupType);
        console.log('游戏时长:', gameData.playTime, '秒');
        console.log('氧气滑块值:', gameData.oxygenValue);
        console.log('结局:', gameData.ending);
        console.log('选择记录:', gameData.choices);
        
        // 这里可以发送数据到后端
        // sendDataToBackend(gameData);
        
        // 简化的结束提示
        elements.hintText.classList.remove('active');
        setTimeout(() => {
            elements.hintText.innerHTML = '感谢您的参与';
            elements.hintText.style.fontSize = '1.5rem';
            elements.hintText.classList.add('active');
        }, 1000);
    }, 10000);
}

// 发送数据到后端（预留接口）
function sendDataToBackend(data) {
    // TODO: 实现数据发送
    // fetch('/api/save-game-data', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，准备初始化游戏');
    initGame();
});

// 添加错误捕获
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.message, e.filename, e.lineno);
});

console.log('=== 游戏脚本加载完成 ===');
