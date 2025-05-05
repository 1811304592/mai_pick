const Settings = {
    save() {
        const banLimit = document.getElementById('banLimit').value;
        const pickLimit = document.getElementById('pickLimit').value;
        localStorage.setItem('banLimit', banLimit);
        localStorage.setItem('pickLimit', pickLimit);
    },

    load() {
        const banLimit = localStorage.getItem('banLimit') || 2;
        const pickLimit = localStorage.getItem('pickLimit') || 2;
        document.getElementById('banLimit').value = banLimit;
        document.getElementById('pickLimit').value = pickLimit;
    },

    reset() {
        if (confirm('确定要重置比赛吗？这将清除所有选手和进度。')) {
            localStorage.clear();
            this.load();
            PlayerManager.updateList([]);
        }
    }
};