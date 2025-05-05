const WheelManager = {
    selectedSong: null,
    isSpinning: false,
    filteredSongs: [],
    currentLevel: 'all',
    leftOffset: -90,

    createSector(index, total, song) {
        const angle = 360 / total;
        const startAngle = index * angle;
        const endAngle = startAngle + angle;

        // 创建扇形SVG元素
        const sector = document.createElementNS("http://www.w3.org/2000/svg", "path");

        // 计算扇形的路径
        const centerX = 150;
        const centerY = 150;
        const radius = 150;

        // 扇形路径
        const x1 = centerX + radius * Math.cos((startAngle + this.leftOffset) * Math.PI / 180);
        const y1 = centerY + radius * Math.sin((startAngle + this.leftOffset) * Math.PI / 180);
        const x2 = centerX + radius * Math.cos((endAngle + this.leftOffset) * Math.PI / 180);
        const y2 = centerY + radius * Math.sin((endAngle + this.leftOffset) * Math.PI / 180);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const d = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;

        sector.setAttribute("d", d);

        // 随机颜色
        const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6B5B95', '#88D8B0', '#FF8C94', '#FFAAA5', '#B5EAD7'];
        const color = colors[index % colors.length];
        sector.setAttribute("fill", color);
        sector.setAttribute("stroke", "#333");
        sector.setAttribute("stroke-width", "1");

        // 文本标签
        const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

        // 计算文本位置 (在扇形中间位置)
        const midAngle = startAngle + angle / 2;
        const textDistance = radius * 0.6; // 文本距离中心的距离
        const textX = centerX + textDistance * Math.cos((midAngle + this.leftOffset) * Math.PI / 180);
        const textY = centerY + textDistance * Math.sin((midAngle + this.leftOffset) * Math.PI / 180);

        text.setAttribute("x", textX);
        text.setAttribute("y", textY);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "#000");
        text.setAttribute("font-size", "10px");
        text.setAttribute("transform", `rotate(${midAngle + this.leftOffset}, ${textX}, ${textY})`);

        // 显示歌曲名称，长度限制
        const displayTitle = song.title.length > 10 ? song.title.substring(0, 10) + '...' : song.title;
        text.textContent = displayTitle;

        textGroup.appendChild(text);

        // 创建一个组合元素
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.appendChild(sector);
        group.appendChild(textGroup);

        return group;
    },

    async initialize() {
        const wheel = document.getElementById('wheel');
        wheel.innerHTML = '';
        wheel.style.transform = 'rotate(0deg)';

        // 显示加载中提示
        wheel.innerHTML = '<div class="wheel-empty">加载歌曲中...</div>';

        // 确保歌曲数据已加载
        if (SongManager.songs.length === 0) {
            await SongManager.fetchSongs();
        }

        // 获取当前等级的歌曲
        this.filteredSongs = SongManager.getSongsByLevel(this.currentLevel);

        if (this.filteredSongs.length === 0) {
            wheel.innerHTML = '<div class="wheel-empty">没有找到歌曲</div>';
            return;
        }

        // 清空wheel并创建SVG元素
        wheel.innerHTML = '';
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "300");
        svg.setAttribute("height", "300");
        svg.setAttribute("viewBox", "0 0 300 300");
        wheel.appendChild(svg);

        // 添加扇形
        this.filteredSongs.forEach((song, index) => {
            const sector = this.createSector(index, this.filteredSongs.length, song);
            svg.appendChild(sector);
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

        // 获取歌曲的所有难度等级
        const levelText = this.selectedSong.level.join(', ');

        resultContainer.innerHTML = `
            <div class="song-info">
                <div class="song-title">${this.selectedSong.title}</div>
                <div class="song-artist">${this.selectedSong.basic_info.artist}</div>
                <div class="song-level">难度: ${levelText}</div>
                <div class="song-bpm">BPM: ${this.selectedSong.basic_info.bpm}</div>
                <div class="song-genre">类型: ${this.selectedSong.basic_info.genre}</div>
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
    },

    // 切换难度等级
    switchLevel(level) {
        if (this.isSpinning) return;

        this.currentLevel = level;
        this.initialize();

        // 更新标签激活状态
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.tab[data-level="${level}"]`).classList.add('active');
    }
};