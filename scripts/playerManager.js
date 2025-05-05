const PlayerManager = {
    add() {
        const name = document.getElementById('playerName').value.trim();
        if (!name) return;

        const players = JSON.parse(localStorage.getItem('players') || '[]');
        players.push({
            name: name,
            bannedCount: 0,
            selectedCount: 0,
            selectedSongs: []
        });
        localStorage.setItem('players', JSON.stringify(players));

        document.getElementById('playerName').value = '';
        this.updateList(players);
    },

    remove(index) {
        const players = JSON.parse(localStorage.getItem('players') || '[]');
        players.splice(index, 1);
        localStorage.setItem('players', JSON.stringify(players));
        this.updateList(players);
    },

    updateList(players) {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '<h2>当前选手</h2>';

        if (players.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'player-item';
            emptyMessage.innerHTML = '<span>暂无选手</span>';
            playerList.appendChild(emptyMessage);
            return;
        }

        players.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = 'player-item';
            div.innerHTML = `
                <span>${index + 1}. ${player.name}</span>
                <button onclick="PlayerManager.remove(${index})">删除</button>
            `;
            playerList.appendChild(div);
        });
    }
};