// 添加检查脚本是否加载的辅助函数
function checkScriptsLoaded() {
    if (typeof window.SongManager === 'undefined') {
        console.error('SongManager未定义！');
        document.getElementById('songList').innerHTML =
            '<div class="error">脚本加载失败: SongManager未定义<br>请刷新页面或检查控制台错误</div>';
        return false;
    }

    if (typeof window.SongSelector === 'undefined') {
        console.error('SongSelector未定义！');
        document.getElementById('songList').innerHTML =
            '<div class="error">脚本加载失败: SongSelector未定义<br>请刷新页面或检查控制台错误</div>';
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('初始化页面...');

        // 显示加载提示
        const songListContainer = document.getElementById('songList');
        songListContainer.innerHTML = '<div class="loading">正在加载歌曲数据...</div>';

        // 检查脚本是否已加载
        if (!checkScriptsLoaded()) {
            return;
        }

        // 加载歌曲数据
        await SongManager.fetchSongs();
        console.log(`已加载 ${SongManager.songs.length} 首歌曲`);

        // 初始化难度标签
        initializeLevelTabs();

        // 初始化选歌界面
        await SongSelector.initialize();

        // 添加操作按钮
        addActionButtons();
    } catch (error) {
        console.error('初始化失败:', error);
        document.getElementById('songList').innerHTML =
            `<div class="error">加载歌曲数据失败: ${error.message}<br>请刷新页面重试</div>`;
    }
});

// 初始化难度标签
function initializeLevelTabs() {
    const tabsContainer = document.getElementById('levelTabs');
    tabsContainer.innerHTML = '<div class="tab active" data-level="all">全部歌曲</div>';

    // 获取所有级别
    const levels = [];
    SongManager.songs.forEach(song => {
        song.level.forEach(lvl => {
            const levelNum = parseInt(lvl);
            if (!isNaN(levelNum) && !levels.includes(levelNum)) {
                levels.push(levelNum);
            }
        });
    });

    // 排序级别
    levels.sort((a, b) => a - b);

    // 添加级别标签
    levels.forEach(level => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.level = level.toString();
        tab.textContent = `${level}级`;
        tab.onclick = () => SongSelector.switchLevel(level);
        tabsContainer.appendChild(tab);
    });

    // 设置全部标签的点击事件
    document.querySelector('.tab[data-level="all"]').onclick = () => SongSelector.switchLevel('all');
}

// 添加操作按钮
function addActionButtons() {
    // 检查是否已经存在按钮
    if (document.getElementById('saveSelection')) {
        return;
    }

    // 创建操作按钮容器
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'action-buttons';
    actionsContainer.innerHTML = `
        <button id="saveSelection" class="action-button">保存选择</button>
        <button id="randomButton" class="action-button" disabled>开始抽取</button>
    `;

    // 添加到页面
    document.querySelector('.container').appendChild(actionsContainer);

    // 设置按钮事件
    document.getElementById('saveSelection').addEventListener('click', () => SongSelector.saveSelection());
    document.getElementById('randomButton').addEventListener('click', () => {
        window.location.href = 'random.html';
    });

    // 设置随机按钮状态
    const selectedSongs = localStorage.getItem('selectedSongs');
    if (selectedSongs) {
        const songs = JSON.parse(selectedSongs);
        document.getElementById('randomButton').disabled = songs.length === 0;
    }
}