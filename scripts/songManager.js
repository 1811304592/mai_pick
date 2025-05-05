// 确保SongManager在全局作用域中定义
window.SongManager = {
    songs: [],

    // 从API获取歌曲数据
    async fetchSongs() {
        try {
            console.log('正在获取歌曲数据...');

            // 检查本地缓存是否有效
            const cachedData = localStorage.getItem('songsData');
            const cachedTime = localStorage.getItem('songsDataTime');

            // 如果缓存存在且未过期（24小时内）
            if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < 24 * 60 * 60 * 1000) {
                this.songs = JSON.parse(cachedData);
                console.log(`使用缓存的歌曲数据: ${this.songs.length}首歌曲`);
                return this.songs;
            }

            // 从API获取数据
            console.log('从API获取数据...');
            const response = await fetch('https://www.diving-fish.com/api/maimaidxprober/music_data');

            if (!response.ok) {
                throw new Error(`获取歌曲数据失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('获取到的数据格式错误');
            }

            this.songs = data;

            // 保存到本地缓存
            localStorage.setItem('songsData', JSON.stringify(this.songs));
            localStorage.setItem('songsDataTime', Date.now().toString());

            console.log(`已获取新歌曲数据: ${this.songs.length}首歌曲`);
            return this.songs;
        } catch (error) {
            console.error('获取歌曲数据出错:', error);

            // 如果有缓存数据，在出错时使用缓存
            const cachedData = localStorage.getItem('songsData');
            if (cachedData) {
                this.songs = JSON.parse(cachedData);
                console.log(`使用缓存的歌曲数据（API获取失败）: ${this.songs.length}首歌曲`);
                return this.songs;
            }

            // 如果没有缓存，抛出错误
            throw error;
        }
    },

    // 获取特定等级的歌曲
    getSongsByLevel(level) {
        if (level === 'all') {
            return this.songs;
        }

        // 过滤歌曲，找出包含指定等级的歌曲
        return this.songs.filter(song => {
            // 检查歌曲是否包含指定等级
            return song.level && song.level.some(lvl => {
                // 处理+ -符号，比较整数部分
                const levelNum = parseInt(lvl);
                return levelNum === parseInt(level);
            });
        });
    }
};

console.log('SongManager已加载');