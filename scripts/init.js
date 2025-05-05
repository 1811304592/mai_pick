document.addEventListener('DOMContentLoaded', async () => {
    // 确保SongManager加载
    if (!window.SongManager) {
        console.error('SongManager未定义！');
        return;
    }

    // 加载歌曲数据
    await SongManager.fetchSongs();

    // 初始化难度标签
    initializeLevelTabs();

    // 初始化选歌界面
    await SongSelector.initialize();

    // 添加操作按钮
    addActionButtons();
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
    // 创建操作按钮容器
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'action-buttons';
    actionsContainer.innerHTML = `
        <button id="saveSelection" class="action-button">保存选择</button>
        <button id="randomButton" class="action-button" disabled>开始抽取</button>
    `;

    // 添加到页面
    document.querySelector('.container').appendChild(actionsContainer);

    // 设置随机按钮状态
    const selectedSongs = localStorage.getItem('selectedSongs');
    if (selectedSongs) {
        const songs = JSON.parse(selectedSongs);
        document.getElementById('randomButton').disabled = songs.length === 0;
    }
}