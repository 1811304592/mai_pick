document.addEventListener('DOMContentLoaded', async () => {
    // 设置页面初始化
    if (document.getElementById('playerList')) {
        Settings.load();
        document.getElementById('banLimit').addEventListener('change', Settings.save);
        document.getElementById('pickLimit').addEventListener('change', Settings.save);

        const players = JSON.parse(localStorage.getItem('players') || '[]');
        PlayerManager.updateList(players);
    }

    // 转盘页面初始化
    if (document.getElementById('wheel')) {
        // 先获取歌曲数据
        await SongManager.fetchSongs();

        // 创建难度标签
        initializeLevelTabs();

        // 设置事件监听
        document.getElementById('spinButton').addEventListener('click', () => WheelManager.spin());

        // 初始化转盘
        WheelManager.initialize();
    }
});

// 初始化难度标签
function initializeLevelTabs() {
    const tabsContainer = document.getElementById('levelTabs');
    tabsContainer.innerHTML = '<div class="tab active" data-level="all">全部歌曲</div>';

    // 添加1-15级标签
    for (let i = 1; i <= 15; i++) {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.setAttribute('data-level', i.toString());
        tab.textContent = `${i}级`;
        tab.onclick = () => WheelManager.switchLevel(i.toString());
        tabsContainer.appendChild(tab);
    }

    // 设置全部标签的点击事件
    document.querySelector('.tab[data-level="all"]').onclick = () => WheelManager.switchLevel('all');
}