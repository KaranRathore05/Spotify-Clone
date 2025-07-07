console.log("Script loaded successfully!");

let currFolder = "Spotify clone/songs";
let currentSong = new Audio();
let songs = [];

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/").pop());
        }
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.querySelector("#playSong").src = "../img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    console.log("📂 Displaying albums...");
    let a = await fetch("/Spotify clone/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.endsWith("/")) {
            let folder = decodeURIComponent(e.href.split("/").slice(-2)[0]);

            try {
                let meta = await fetch(`/Spotify clone/songs/${folder}/info.json`);
                let info = await meta.json();

                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/Spotify clone/songs/${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
            } catch (err) {
                console.warn(`⚠️ Skipping '${folder}' – Missing or invalid info.json`);
            }
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        let folder = item.currentTarget.dataset.folder;
        songs = await getSongs(`Spotify clone/songs/${folder}`);
        console.log("📀 Songs fetched:", songs);

        // ✅ update songlist UI
        let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songsUL.innerHTML = "";

        for (const song of songs) {
            songsUL.innerHTML += `<li data-file="${song}">
                <img class="invert" src="../img/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(song.replace(".mp3", ""))}</div>
                    <div>Karan</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="../img/play.svg" alt="">
                </div>
            </li>`;
        }

        // ✅ bind song click
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                let trackName = e.dataset.file;
                playMusic(trackName);
            });
        });

        // ✅ play first song
        if (songs.length > 0) {
            playMusic(songs[0]);
        } else {
            alert("⚠️ No songs found in this folder.");
        }
    });
});

}

async function main() {
    songs = await getSongs("Spotify clone/songs/hindi");
    playMusic(songs[0], true);

    let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songsUL.innerHTML = "";

    for (const song of songs) {
        songsUL.innerHTML += `<li data-file="${song}">
            <img class="invert" src="../img/music.svg" alt="">
            <div class="info">
                <div>${decodeURIComponent(song.replace(".mp3", ""))}</div>
                <div>Karan</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="../img/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let trackName = e.dataset.file;
            playMusic(trackName);
        });
    });
}

currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
        `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    main();
    displayAlbums();

    const play = document.getElementById("playSong");
    const previous = document.getElementById("prevsong");
    const next = document.getElementById("nextsong");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.setAttribute("src", "../img/pause.svg");
        } else {
            currentSong.pause();
            play.setAttribute("src", "../img/play.svg");
        }
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index - 1) >= 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index + 1) < songs.length) playMusic(songs[index + 1]);
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
});
