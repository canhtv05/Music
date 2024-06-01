/*
    1. Render song
    2. Scroll top
    3. Play / pause / seek
    4. CD rotate
    5. Next / prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    songs: [
        {
            name: 'Anh da tu bo roi day',
            singer: 'Nguyen Tran',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Tro Dua',
            singer: 'Quang Dang Tran',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Suyt nua thi',
            singer: 'Andiez',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Anh thoi nhan nhuong',
            singer: 'Kieu Chi',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Gio van hat',
            singer: 'Long Pham',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'Gap nguoi dung luc',
            singer: 'Ha Linh',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        },
        {
            name: 'Anh thuong em nhat ma',
            singer: 'La, Log, TiB',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg'
        }
    ],

    // render ra view
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function () {
        const cdWidth = cd.offsetWidth;

        // xử lý cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)',
            }
        ], {
            duration: 10000, //10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // xu ly phong to or thu nho cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
        }

        // xu ly khi click play
        playBtn.onclick = () => {
            if (audio.paused) {
                audio.play();
                cdThumbAnimate.play();
            } else {
                audio.pause();
                cdThumbAnimate.pause();
            }
        };

        // Khi bài hát được phát
        audio.onplay = function () {
            player.classList.add('playing');
            cdThumbAnimate.play();
        };

        // Khi bài hát bị tạm dừng
        audio.onpause = function () {
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        };

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                $('#progress').value = progressPercent;
            }
        };

        // Xử lý khi tua
        $('#progress').oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        };

        // khi next bài hát
        nextBtn.onclick = () => {
            if (this.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            audio.play();
            cdThumbAnimate.cancel(); // Reset CD animation
            cdThumbAnimate.play();
            this.updateActiveSong();
        }

        // khi prev bài hát
        prevBtn.onclick = () => {
            if (this.isRandom) {
                app.playRandomSong();
            } else {
                app.prevSong();
            }
            audio.play();
            cdThumbAnimate.cancel(); // Reset CD animation
            cdThumbAnimate.play();
            this.updateActiveSong();
        }

        // khi random bài hát
        randomBtn.onclick = (e) => {
            app.isRandom = !app.isRandom;
            // nếu true toggle-> false và ngược lại
            randomBtn.classList.toggle('active', app.isRandom);
        }

        // xử lý phát lại 1 bài hát
        repeatBtn.onclick = (e) => {
            app.isRepeat = !app.isRepeat;
            repeatBtn.classList.toggle('active', app.isRepeat);
        }

        // xử lý next song khi audio ended
        audio.onended = () => {
            if (app.isRepeat) {
                audio.play();
                cdThumbAnimate.cancel(); // Reset CD animation
                cdThumbAnimate.play();
            } else {
                // tự bấm nút next khi kết thúc audio
                nextBtn.click();
            }
        }

        // Play song when clicking on it
        playlist.onclick = (e) => {
            // closest tìm cha gần nhất có class
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // Handle when clicking on the song
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                    cdThumbAnimate.cancel();
                    cdThumbAnimate.play();
                    this.updateActiveSong();
                }

                // Handle when clicking on the option
                if (e.target.closest('.option')) {
                    // Handle option here
                }
            }
        }
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.currentIndex === newIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    updateActiveSong: function () {
        const songElements = $$('.song');
        songElements.forEach((song, index) => {
            if (index === this.currentIndex) {
                song.classList.add('active');
            } else {
                song.classList.remove('active');
            }
        });
    },

    start: function () {
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
    }
}

app.start();
