document.addEventListener('DOMContentLoaded', () => {
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
        document.getElementById('spinButton').addEventListener('click', () => WheelManager.spin());
        document.querySelector('.tab[data-level="all"]').onclick = () => switchLevel('all');
        initializeTabs();
        WheelManager.initialize();
    }
});