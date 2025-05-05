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
        if (this.isSpinning || this.filteredSongs.length === 0) return;
        this.isSpinning = true;

        // 清除之前的结果
        document.getElementById('resultSong').innerHTML = '';
        const wheel = document.getElementById('wheel');

        // 随机选择一首歌
        const randomIndex = Math.floor(Math.random() * this.filteredSongs.length);
        this.selectedSong = this.filteredSongs[randomIndex];

        // 计算旋转角度
        // 目标角度 = 选中歌曲的位置角度 + 额外旋转圈数
        const baseAngle = (360 / this.filteredSongs.length) * randomIndex;
        const extraRotations = 5; // 额外旋转5圈
        const targetAngle = -(baseAngle + 360 * extraRotations);

        // 设置动画
        wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
        wheel.style.transform = `rotate(${targetAngle}deg)`;

        // 动画结束后显示结果
        setTimeout(() => {
            this.isSpinning = false;
            this.showResult();
        }, 4000);
    },

    showResult() {
        const resultContainer = document.getElementById('resultSong');
        resultContainer.innerHTML = `
        <div class="song-info">
            <div class="song-title">${this.selectedSong.title}</div>
            <div class="song-level">难度: ${this.selectedSong.level}</div>
        </div>
    `;
    },

    reset() {
        if (this.isSpinning) return;

        const wheel = document.getElementById('wheel');
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';

        document.getElementById('resultSong').innerHTML = '';
        this.selectedSong = null;
    }
};