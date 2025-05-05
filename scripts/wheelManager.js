const WheelManager = {
    selectedSong: null,
    isSpinning: false,
    filteredSongs: [],
    currentLevel: 'all',
    leftOffset: -90,

    createSector(index, total, song) {
        const angle = 360 / total;
        const startAngle = index * angle;
        const sector = document.createElementNS("http://www.w3.org/2000/svg", "g");
        // ... 其余createSector代码 ...
    },

    initialize() {
        const wheel = document.getElementById('wheel');
        wheel.innerHTML = '';
        wheel.style.transform = 'rotate(0deg)';

        this.filteredSongs = this.currentLevel === 'all'
            ? songs
            : songs.filter(song => Math.floor(song.level) === this.currentLevel);

        if (this.filteredSongs.length === 0) {
            wheel.innerHTML = '<div class="wheel-empty">没有找到歌曲</div>';
            return;
        }

        this.filteredSongs.forEach((song, index) => {
            const sector = this.createSector(index, this.filteredSongs.length, song);
            wheel.appendChild(sector);
        });
    },

    spin() {
        // ... spin相关代码 ...
    },

    reset() {
        // ... reset相关代码 ...
    }
};