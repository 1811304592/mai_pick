const SongManager = {
    songs: [],

    // 从API获取歌曲数据
    async fetchSongs() {
        try {
            // 先检查本地存储中是否有缓存的歌曲数据
            const cachedData = localStorage.getItem('songData');
            const cachedTime = localStorage.getItem('songDataTimestamp');

            // 如果有缓存数据且不超过24小时，直接使用缓存
            if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < 24 * 60 * 60 * 1000)) {
                this.songs = JSON.parse(cachedData);
                console.log('使用缓存的歌曲数据');
                return this.songs;
            }

            // 否则从API获取最新数据
            console.log('正在从API获取歌曲数据...');
            const response = await fetch('https://www.diving-fish.com/api/maimaidxprober/music_data');

            if (!response.ok) {
                throw new Error('无法获取歌曲数据，HTTP状态码: ' + response.status);
            }

            const data = await response.json();
            this.songs = data;

            // 缓存数据到本地存储
            localStorage.setItem('songData', JSON.stringify(data));
            localStorage.setItem('songDataTimestamp', Date.now().toString());

            console.log(`成功获取 ${data.length} 首歌曲数据`);
            return data;
        } catch (error) {
            console.error('获取歌曲数据出错:', error);

            // 如果API请求失败，尝试使用缓存数据（即使已过期）
            const cachedData = localStorage.getItem('songData');
            if (cachedData) {
                console.log('使用过期的缓存数据');
                this.songs = JSON.parse(cachedData);
                return this.songs;
            }

            // 如果没有缓存，返回空数组
            return [];
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
            return song.level.some(lvl => {
                // 处理+ -符号，比较整数部分
                const levelNum = parseInt(lvl);
                return levelNum === parseInt(level);
            });
        });
    }
};