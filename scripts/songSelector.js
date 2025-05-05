window.SongSelector = {
    selectedSongs: [],
    currentLevel: 'all',

    // 初始化选歌界面
    async initialize() {
        console.log('初始化选歌界面...');

        // 从本地存储加载已选择的歌曲
        this.loadSelectedSongs();

        // 添加搜索栏
        this.addSearchBar();

        // 显示歌曲列表
        this.filterSongs('');
    },

    // 添加搜索栏
    addSearchBar() {
        console.log('添加搜索栏...');

        // 检查是否已经有搜索栏
        if (document.getElementById('songSearch')) {
            return;
        }

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="songSearch" placeholder="搜索歌曲..." />
            <div class="search-info">已选择: <span id="selectedCount">${this.selectedSongs.length}</span> 首歌曲</div>
        `;

        // 在歌曲列表前插入搜索栏
        const tabsContainer = document.getElementById('levelTabs');
        tabsContainer.parentNode.insertBefore(searchContainer, tabsContainer.nextSibling);

        // 设置搜索事件
        document.getElementById('songSearch').addEventListener('input', (e) => {
            this.filterSongs(e.target.value);
        });
    },

    // 根据搜索词和当前等级过滤歌曲
    filterSongs(searchTerm) {
        console.log(`过滤歌曲，搜索词: "${searchTerm}", 等级: ${this.currentLevel}`);

        const songListContainer = document.getElementById('songList');
        songListContainer.innerHTML = '';

        if (SongManager.songs.length === 0) {
            songListContainer.innerHTML = '<div class="no-results">没有可用的歌曲数据</div>';
            return;
        }

        const term = searchTerm.toLowerCase();
        let filteredSongs = SongManager.songs.filter(song =>
            song.title.toLowerCase().includes(term) ||
            (song.basic_info && song.basic_info.artist && song.basic_info.artist.toLowerCase().includes(term))
        );

        // 按级别过滤
        if (this.currentLevel !== 'all') {
            const level = parseInt(this.currentLevel);
            filteredSongs = filteredSongs.filter(song => {
                return song.level && song.level.some(lvl => {
                    const levelNum = parseInt(lvl);
                    return levelNum === level;
                });
            });
        }

        console.log(`过滤后的歌曲数量: ${filteredSongs.length}`);

        if (filteredSongs.length === 0) {
            songListContainer.innerHTML = '<div class="no-results">没有找到匹配的歌曲</div>';
            return;
        }

        filteredSongs.forEach(song => {
            const isSelected = this.selectedSongs.some(s => s.id === song.id);

            const songItem = document.createElement('div');
            songItem.className = `song-item ${isSelected ? 'selected' : ''}`;
            songItem.dataset.id = song.id;

            // 确保basic_info存在
            const artist = song.basic_info && song.basic_info.artist ? song.basic_info.artist : '未知';
            const bpm = song.basic_info && song.basic_info.bpm ? song.basic_info.bpm : '未知';
            const levels = song.level && Array.isArray(song.level) ? song.level.join(', ') : '未知';

            songItem.innerHTML = `
                <img src="https://www.diving-fish.com/covers/${song.id}.png" class="song-cover" onerror="this.src='img/default_cover.png'">
                <div class="song-details">
                    <div class="song-title">${song.title || '未知歌曲'}</div>
                    <div class="song-info">
                        歌手: ${artist} |
                        BPM: ${bpm} |
                        难度: ${levels}
                    </div>
                </div>
            `;

            songItem.addEventListener('click', () => this.toggleSongSelection(song, songItem));
            songListContainer.appendChild(songItem);
        });
    },

    // 切换歌曲选择状态
    toggleSongSelection(song, element) {
        const index = this.selectedSongs.findIndex(s => s.id === song.id);

        if (index === -1) {
            // 添加到选中列表
            this.selectedSongs.push(song);
            element.classList.add('selected');
        } else {
            // 从选中列表移除
            this.selectedSongs.splice(index, 1);
            element.classList.remove('selected');
        }

        // 更新选中数量显示
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = this.selectedSongs.length;
        }
    },

    // 保存选中的歌曲到本地存储
    saveSelection() {
        if (this.selectedSongs.length === 0) {
            alert('请至少选择一首歌曲');
            return;
        }

        localStorage.setItem('selectedSongs', JSON.stringify(this.selectedSongs));
        alert(`已保存 ${this.selectedSongs.length} 首歌曲，现在可以进行抽选了！`);

        // 启用随机选歌按钮
        const randomButton = document.getElementById('randomButton');
        if (randomButton) {
            randomButton.disabled = false;
        }
    },

    // 从本地存储加载已选择的歌曲
    loadSelectedSongs() {
        console.log('加载已选择的歌曲...');
        const savedSongs = localStorage.getItem('selectedSongs');
        if (savedSongs) {
            try {
                this.selectedSongs = JSON.parse(savedSongs);
                console.log(`已加载 ${this.selectedSongs.length} 首已选择的歌曲`);

                // 启用随机按钮
                const randomButton = document.getElementById('randomButton');
                if (randomButton) {
                    randomButton.disabled = this.selectedSongs.length === 0;
                }
            } catch (error) {
                console.error('加载已选择的歌曲失败:', error);
                this.selectedSongs = [];
            }
        }
    },

    // 切换难度等级
    switchLevel(level) {
        console.log(`切换难度等级: ${level}`);
        this.currentLevel = level;

        // 更新标签激活状态
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.level == level) {
                tab.classList.add('active');
            }
        });

        // 重新过滤显示歌曲
        const searchInput = document.getElementById('songSearch');
        this.filterSongs(searchInput ? searchInput.value : '');
    }
};

console.log('SongSelector已加载');