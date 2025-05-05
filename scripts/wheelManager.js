window.RandomSelector = {
    songs: [],
    wheel: null,
    canvasContext: null,
    wheelSize: 0,
    segments: [],
    segColors: ['#FF4C89', '#FF85AA', '#FFA8C1', '#FFCCD8', '#FFE0E9'],
    spinTimeout: null,
    spinTime: 0,
    spinTimeTotal: 0,
    startAngle: 0,
    selectedSong: null,

    // 初始化转盘
    initialize() {
        console.log('初始化随机选择器...');

        // 加载已选择的歌曲
        this.loadSongs();

        // 创建转盘容器
        this.createWheelContainer();

        // 初始化Canvas
        this.initCanvas();

        // 创建转盘区段
        this.createSegments();

        // 绘制转盘
        this.drawWheel();

        // 添加旋转按钮
        this.addSpinButton();
    },

    // 从localStorage加载已选择的歌曲
    loadSongs() {
        const savedSongs = localStorage.getItem('selectedSongs');
        if (savedSongs) {
            try {
                this.songs = JSON.parse(savedSongs);
                console.log(`已加载 ${this.songs.length} 首歌曲`);

                // 如果没有选择的歌曲，显示提示
                if (this.songs.length === 0) {
                    this.showNoSongsMessage();
                }
            } catch (error) {
                console.error('加载歌曲失败:', error);
                this.showErrorMessage('加载歌曲数据失败，请返回选歌页面重新选择。');
            }
        } else {
            this.showNoSongsMessage();
        }
    },

    // 显示没有歌曲的提示
    showNoSongsMessage() {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="no-songs-message">
                    <h2>没有找到选择的歌曲</h2>
                    <p>请先返回选歌页面选择歌曲。</p>
                    <a href="index.html" class="return-button">返回选歌</a>
                </div>
            `;
        }
    },

    // 显示错误消息
    showErrorMessage(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>出错了</h2>
                    <p>${message}</p>
                    <a href="index.html" class="return-button">返回选歌</a>
                </div>
            `;
        }
    },

    // 创建转盘容器
    createWheelContainer() {
        // 确保容器存在
        const container = document.querySelector('.container');
        if (!container) {
            console.error('找不到容器元素');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 创建转盘区域
        const wheelArea = document.createElement('div');
        wheelArea.className = 'wheel-area';
        wheelArea.innerHTML = `
        <h2>歌曲抽取转盘</h2>
        <div class="wheel-container">
            <canvas id="wheel" width="500" height="500"></canvas>
            <div class="wheel-pointer"></div>
        </div>
        <div id="result" class="result-display"></div>
        <div class="wheel-controls">
            <button id="spinButton" class="spin-button">转动转盘</button>
            <a href="index.html" class="return-button">返回选歌</a>
        </div>
    `;

        container.appendChild(wheelArea);

        // 获取Canvas元素
        this.wheel = document.getElementById('wheel');
    },

    // 修改停止转盘旋转方法中的角度计算
    stopRotateWheel() {
        clearTimeout(this.spinTimeout);
        this.spinTimeout = null;

        // 计算指针指向的区段 - 修改角度计算方式
        const arc = Math.PI * 2 / this.segments.length;
        const degrees = this.startAngle * 180 / Math.PI + 90; // 保持+90度使指针指向顶部中心
        const arcd = arc * 180 / Math.PI;
        const index = Math.floor((360 - degrees % 360) / arcd);

        // 确保索引在有效范围内
        const winningIndex = (index >= this.segments.length) ? 0 : index;
        this.selectedSong = this.segments[winningIndex].song;

        // 显示结果
        this.showResult();

        // 启用旋转按钮
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.disabled = false;
        }
    },

    // 初始化Canvas
    initCanvas() {
        if (!this.wheel) {
            console.error('找不到转盘Canvas元素');
            return;
        }

        this.canvasContext = this.wheel.getContext('2d');

        // 计算转盘大小（取width和height的较小值）
        this.wheelSize = Math.min(this.wheel.width, this.wheel.height);

        // 设置转盘中心点
        this.canvasContext.translate(this.wheel.width / 2, this.wheel.height / 2);
    },

    // 创建转盘区段
    createSegments() {
        if (this.songs.length === 0) {
            return;
        }

        // 限制最多显示20个区段，太多会显示不清楚
        const maxSegments = Math.min(20, this.songs.length);

        // 创建区段数组
        this.segments = [];
        const step = this.songs.length / maxSegments;

        for (let i = 0; i < maxSegments; i++) {
            const index = Math.floor(i * step);
            if (index < this.songs.length) {
                this.segments.push({
                    song: this.songs[index],
                    color: this.segColors[i % this.segColors.length]
                });
            }
        }

        console.log(`已创建 ${this.segments.length} 个转盘区段`);
    },

    // 绘制转盘
    drawWheel() {
        if (!this.canvasContext || this.segments.length === 0) {
            return;
        }

        // 清除画布
        this.canvasContext.clearRect(-this.wheel.width/2, -this.wheel.height/2, this.wheel.width, this.wheel.height);

        // 计算每个区段的角度
        const arc = Math.PI * 2 / this.segments.length;

        // 绘制区段
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const angle = this.startAngle + i * arc;

            // 绘制扇形
            this.canvasContext.beginPath();
            this.canvasContext.arc(0, 0, this.wheelSize/2 - 10, angle, angle + arc, false);
            this.canvasContext.lineTo(0, 0);
            this.canvasContext.fillStyle = segment.color;
            this.canvasContext.fill();

            // 绘制边框
            this.canvasContext.strokeStyle = '#fff';
            this.canvasContext.lineWidth = 2;
            this.canvasContext.stroke();

            // 绘制文字
            this.canvasContext.save();

            // 旋转Canvas使文字垂直于半径
            this.canvasContext.rotate(angle + arc / 2);

            this.canvasContext.fillStyle = '#333';
            this.canvasContext.font = 'bold 14px Arial';
            this.canvasContext.textAlign = 'right';
            this.canvasContext.textBaseline = 'middle';

            // 截取歌曲名（太长会显示不下）
            let title = segment.song.title;
            if (title.length > 15) {
                title = title.substring(0, 12) + '...';
            }

            // 计算文字位置（距离圆心的距离）
            const textRadius = this.wheelSize/2 - 30;
            this.canvasContext.fillText(title, textRadius, 0);

            this.canvasContext.restore();
        }
    },

    // 添加旋转按钮
    addSpinButton() {
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spinWheel());
        }
    },

    // 旋转转盘
    spinWheel() {
        // 如果正在旋转，不做任何操作
        if (this.spinTimeout !== null) {
            return;
        }

        // 重置结果显示
        const resultDisplay = document.getElementById('result');
        if (resultDisplay) {
            resultDisplay.innerHTML = '<p>转盘旋转中...</p>';
        }

        // 禁用旋转按钮
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.disabled = true;
        }

        // 旋转参数
        this.spinTime = 0;
        this.spinTimeTotal = Math.random() * 3000 + 3000; // 3-6秒的旋转时间

        this.rotateWheel();
    },

    // 转盘旋转动画
    rotateWheel() {
        this.spinTime += 30;
        if (this.spinTime >= this.spinTimeTotal) {
            this.stopRotateWheel();
            return;
        }

        // 计算旋转速度（开始快，结束慢）
        const spinFactor = this.easeOut(this.spinTime, 0, 1, this.spinTimeTotal);
        this.startAngle += (spinFactor * Math.PI / 8);

        this.drawWheel();

        this.spinTimeout = setTimeout(() => this.rotateWheel(), 30);
    },

    // 停止转盘旋转
    stopRotateWheel() {
        clearTimeout(this.spinTimeout);
        this.spinTimeout = null;

        // 计算指针指向的区段
        const arc = Math.PI * 2 / this.segments.length;
        const degrees = this.startAngle * 180 / Math.PI + 90; // 加90度使指针指向顶部中心
        const arcd = arc * 180 / Math.PI;
        const index = Math.floor((360 - degrees % 360) / arcd);

        // 确保索引在有效范围内
        const winningIndex = (index >= this.segments.length) ? 0 : index;
        this.selectedSong = this.segments[winningIndex].song;

        // 显示结果
        this.showResult();

        // 启用旋转按钮
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.disabled = false;
        }
    },

    // 显示结果
    showResult() {
        if (!this.selectedSong) {
            return;
        }

        const resultDisplay = document.getElementById('result');
        if (!resultDisplay) {
            return;
        }

        // 处理歌曲ID格式问题 - 根据位数添加前缀
        let coverId = this.selectedSong.id;
        if (/^\d{1}$/.test(coverId)) {
            coverId = "0000" + coverId;
        } else if (/^\d{2}$/.test(coverId)) {
            coverId = "000" + coverId;
        } else if (/^\d{3}$/.test(coverId)) {
            coverId = "00" + coverId;
        }

        // 准备默认图像以防封面加载失败
        const coverUrl = `https://www.diving-fish.com/covers/${coverId}.png`;
        const defaultSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3E无封面%3C/text%3E%3C/svg%3E`;

        // 获取歌曲信息
        const artist = this.selectedSong.basic_info && this.selectedSong.basic_info.artist ? this.selectedSong.basic_info.artist : '未知';
        const levels = this.selectedSong.level && Array.isArray(this.selectedSong.level) ? this.selectedSong.level.join(', ') : '未知';

        // 显示结果
        resultDisplay.innerHTML = `
            <div class="selected-song">
                <h3>抽取结果</h3>
                <div class="song-details">
                    <img src="${coverUrl}" onerror="this.src='${defaultSvg}'" class="result-cover">
                    <div class="song-info">
                        <h4>${this.selectedSong.title}</h4>
                        <p>歌手: ${artist}</p>
                        <p>难度: ${levels}</p>
                    </div>
                </div>
            </div>
        `;
    },

    // 缓动函数 - 使动画更自然
    easeOut(t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }
};

// 当页面加载完成时初始化转盘
document.addEventListener('DOMContentLoaded', () => {
    if (window.RandomSelector) {
        window.RandomSelector.initialize();
    }
});