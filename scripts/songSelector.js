window.SongSelector = {
    selectedSongs: [],
    currentLevel: 'all',
    currentPage: 1,      // 当前页码
    pageSize: 10,        // 每页显示歌曲数
    totalPages: 1,       // 总页数
    filteredSongs: [],   // 过滤后的歌曲列表

    // 初始化选歌界面
    async initialize() {
        console.log('初始化选歌界面...');

        // 从本地存储加载已选择的歌曲
        this.loadSelectedSongs();

        // 添加搜索栏
        this.addSearchBar();

        // 添加难度选择下拉菜单
        this.addLevelSelector();

        // 显示歌曲列表
        this.filterSongs('');
    },

    // 添加搜索栏
    addSearchBar() {
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
            this.currentPage = 1; // 搜索时重置到第一页
            this.filterSongs(e.target.value);
        });
    },


    addLevelSelector() {
        // 获取现有的标签容器
        const tabsContainer = document.getElementById('levelTabs');
        if (!tabsContainer) return;

        // 清空现有内容
        tabsContainer.innerHTML = '';

        // 创建下拉菜单容器
        const selectorWrapper = document.createElement('div');
        selectorWrapper.className = 'level-selector-wrapper';

        // 创建标签
        const label = document.createElement('label');
        label.textContent = '选择难度: ';
        label.htmlFor = 'levelSelector';
        selectorWrapper.appendChild(label);

        // 创建下拉菜单
        const levelSelector = document.createElement('select');
        levelSelector.id = 'levelSelector';
        levelSelector.className = 'level-selector';

        // 添加"所有"选项
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '所有难度';
        levelSelector.appendChild(allOption);

        // 获取所有可能的难度级别
        const allLevels = new Set();
        if (window.SongManager && window.SongManager.songs) {
            window.SongManager.songs.forEach(song => {
                if (song.level && Array.isArray(song.level)) {
                    song.level.forEach(lvl => allLevels.add(lvl));
                }
            });
        }

        // 将难度级别转换成数组并排序
        const sortedLevels = Array.from(allLevels).sort((a, b) => {
            // 处理带+号的难度
            const numA = parseFloat(a.replace('+', '.5'));
            const numB = parseFloat(b.replace('+', '.5'));
            return numA - numB;
        });

        // 添加所有难度选项
        sortedLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = `难度 ${level}`;
            levelSelector.appendChild(option);
        });

        selectorWrapper.appendChild(levelSelector);
        tabsContainer.appendChild(selectorWrapper);

        // 添加事件监听器
        levelSelector.addEventListener('change', (e) => {
            this.switchLevel(e.target.value);
        });
    },


    // 根据搜索词和当前等级过滤歌曲
    filterSongs(searchTerm) {
        console.log(`过滤歌曲，搜索词: "${searchTerm}", 等级: ${this.currentLevel}`);

        const songListContainer = document.getElementById('songList');
        songListContainer.innerHTML = '';

        // 添加对SongManager的安全检查
        if (!window.SongManager || !window.SongManager.songs || window.SongManager.songs.length === 0) {
            songListContainer.innerHTML = '<div class="no-results">没有可用的歌曲数据</div>';
            return;
        }

        const term = searchTerm.toLowerCase();
        this.filteredSongs = SongManager.songs.filter(song =>
            song.title.toLowerCase().includes(term) ||
            (song.basic_info && song.basic_info.artist && song.basic_info.artist.toLowerCase().includes(term))
        );

        // 按级别过滤（支持带+号）
        if (this.currentLevel !== 'all') {
            this.filteredSongs = this.filteredSongs.filter(song => {
                return song.level && song.level.some(lvl => lvl === this.currentLevel);
            });
        }

        // 计算总页数
        this.totalPages = Math.ceil(this.filteredSongs.length / this.pageSize);
        if (this.totalPages === 0) this.totalPages = 1;

        // 确保当前页在有效范围内
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }

        console.log(`过滤后的歌曲数量: ${this.filteredSongs.length}, 总页数: ${this.totalPages}, 当前页: ${this.currentPage}`);

        if (this.filteredSongs.length === 0) {
            songListContainer.innerHTML = '<div class="no-results">没有找到匹配的歌曲</div>';
            this.updatePagination(); // 更新分页控件（显示为禁用状态）
            return;
        }

        // 只显示当前页的歌曲
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredSongs.length);
        const currentPageSongs = this.filteredSongs.slice(startIndex, endIndex);

        currentPageSongs.forEach(song => {
            const isSelected = this.selectedSongs.some(s => s.id === song.id);

            const songItem = document.createElement('div');
            songItem.className = `song-item ${isSelected ? 'selected' : ''}`;
            songItem.dataset.id = song.id;


            // 为什么要这样？
            //
            // dx的曲子都是五位数id，水鱼他为了实现兼容，给旧的曲子前面加上00就是新id。
            // 但是这个逻辑在api里面没体现，所以返回歌曲信息错了。
            // 比如潘多拉是“834”，但是他的封面其实是00834。
            // 于此同时潘和系经典的系，系是新曲，他是11663，所以他的封面是11663。
            // 只能他屎山我也屎山了，通过正则表达匹配三位数的歌曲id然后在前面拼接00的方法解决。
            // 同时也会出现如“8”和“70”的一位数和两位数，所以也对他们分别添加0000和000。

            // 处理歌曲ID格式问题 - 根据位数添加前缀
            let coverId = song.id;
            if (/^\d{1}$/.test(coverId)) {
                // 一位数ID，如"8"，添加0000前缀
                coverId = "0000" + coverId;
            } else if (/^\d{2}$/.test(coverId)) {
                // 两位数ID，如"70"，添加000前缀
                coverId = "000" + coverId;
            } else if (/^\d{3}$/.test(coverId)) {
                // 三位数ID，如"834"，添加00前缀
                coverId = "00" + coverId;
            }

            // 使用调整后的ID构建封面URL
            const coverUrl = `https://www.diving-fish.com/covers/${coverId}.png`;

            // 确保basic_info存在
            const artist = song.basic_info && song.basic_info.artist ? song.basic_info.artist : '未知';
            const bpm = song.basic_info && song.basic_info.bpm ? song.basic_info.bpm : '未知';
            const levels = song.level && Array.isArray(song.level) ? song.level.join(', ') : '未知';

            // 使用内联SVG作为默认封面和加载图标
            const defaultSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3E无封面%3C/text%3E%3C/svg%3E`;
            const loadingSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f8f8f8'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23aaa'%3E加载中...%3C/text%3E%3C/svg%3E`;

            songItem.innerHTML = `
        <img data-src="${coverUrl}" class="song-cover" src="${loadingSvg}" onerror="this.src='${defaultSvg}'">
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

        // 延迟加载当前页的图片
        this.loadCurrentPageImages();

        // 更新分页控件
        this.updatePagination();
    },

    // 加载当前页的图片
    loadCurrentPageImages() {
        const lazyImages = document.querySelectorAll('.song-cover[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    },

    // 创建或更新分页控件
    updatePagination() {
        let paginationContainer = document.getElementById('pagination');

        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination';
            paginationContainer.className = 'pagination';

            const songList = document.getElementById('songList');
            songList.parentNode.appendChild(paginationContainer);
        }

        // 清空现有内容
        paginationContainer.innerHTML = '';

        // 总歌曲数和页面信息
        const infoSpan = document.createElement('span');
        infoSpan.className = 'pagination-info';
        infoSpan.textContent = `共 ${this.filteredSongs.length} 首歌曲，第 ${this.currentPage}/${this.totalPages} 页`;
        paginationContainer.appendChild(infoSpan);

        // 首页按钮
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'pagination-btn';
        firstPageBtn.textContent = '首页';
        firstPageBtn.disabled = this.currentPage === 1;
        firstPageBtn.addEventListener('click', () => this.goToPage(1));
        paginationContainer.appendChild(firstPageBtn);

        // 上一页按钮
        const prevPageBtn = document.createElement('button');
        prevPageBtn.className = 'pagination-btn';
        prevPageBtn.textContent = '上一页';
        prevPageBtn.disabled = this.currentPage === 1;
        prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        paginationContainer.appendChild(prevPageBtn);

        // 页码按钮
        const maxPageButtons = 5; // 最多显示的页码按钮数
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(this.totalPages, startPage + maxPageButtons - 1);

        // 调整startPage，确保显示maxPageButtons个按钮
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => this.goToPage(i));
            paginationContainer.appendChild(pageBtn);
        }

        // 下一页按钮
        const nextPageBtn = document.createElement('button');
        nextPageBtn.className = 'pagination-btn';
        nextPageBtn.textContent = '下一页';
        nextPageBtn.disabled = this.currentPage === this.totalPages;
        nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        paginationContainer.appendChild(nextPageBtn);

        // 末页按钮
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'pagination-btn';
        lastPageBtn.textContent = '末页';
        lastPageBtn.disabled = this.currentPage === this.totalPages;
        lastPageBtn.addEventListener('click', () => this.goToPage(this.totalPages));
        paginationContainer.appendChild(lastPageBtn);
    },

    // 跳转到指定页
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
            return;
        }

        this.currentPage = pageNumber;
        console.log(`跳转到第 ${this.currentPage} 页`);

        // 重新过滤显示歌曲（实际上只是重新显示当前页）
        const searchInput = document.getElementById('songSearch');
        this.filterSongs(searchInput ? searchInput.value : '');
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
        this.currentPage = 1; // 切换难度时重置到第一页

        // 更新下拉菜单选中值
        const levelSelector = document.getElementById('levelSelector');
        if (levelSelector) {
            levelSelector.value = level;
        }

        // 重新过滤显示歌曲
        const searchInput = document.getElementById('songSearch');
        this.filterSongs(searchInput ? searchInput.value : '');
    }
};

console.log('SongSelector已加载');