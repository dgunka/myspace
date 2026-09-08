/* ==========================================================================
   2005 RETRO MYSPACE JS :: MARVIN THE PARANOID ANDROID
   ========================================================================== */

// Initial Default Comments
const defaultComments = [
    {
        id: "1",
        author: "Arthur Dent",
        avatar: "https://placehold.co/50x50/223322/88ff88?text=A.D.",
        date: "12. Únor 2005 @ 18:20",
        text: "Ahoj Marvine, mohl bys nám prosím pomoct s čajem? Zaphod zase zmizel a počítač Eddie zpívá pesničky..."
    },
    {
        id: "2",
        author: "Ford Prefect",
        avatar: "https://placehold.co/50x50/332222/ff8888?text=Ford",
        date: "10. Leden 2005 @ 14:05",
        text: "Kámo, uvolni se trochu! Dáme si v Restauraci na konci vesmíru Pan Galaktický Kloktodrtič. Na můj účet!"
    },
    {
        id: "3",
        author: "Zaphod Beeblebrox",
        avatar: "https://placehold.co/50x50/333311/ffff88?text=Zaphod",
        date: "01. Leden 2005 @ 00:01",
        text: "Hey metalovej brácho! Jsi naprosto nekool, ale tvoje deprese je tak extrémní, až je skvělá! Zaphod out!"
    }
];

// Tracks for Synthesized Sad Audio Player
const playlist = [
    { title: "1. Marvin - Melancholie v C moll (Synth 2005)", freq: 220, tempo: 0.8 },
    { title: "2. Marvin - Bolest v levé diodě (Chiptune)", freq: 174, tempo: 0.6 },
    { title: "3. Marvin - 5 Milionů let na parkovišti", freq: 146, tempo: 0.4 }
];

let currentTrackIndex = 0;
let audioCtx = null;
let isPlaying = false;
let audioTimer = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initComments();
    initAudioPlayer();
});

/* --------------------------------------------------------------------------
   COMMENT SYSTEM WITH LOCALSTORAGE
   -------------------------------------------------------------------------- */
function initComments() {
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');

    // Load from LocalStorage or use Defaults
    let savedComments = localStorage.getItem('marvin_myspace_comments');
    let comments = savedComments ? JSON.parse(savedComments) : defaultComments;

    renderComments(comments);

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const authorInput = document.getElementById('author-input');
        const textInput = document.getElementById('text-input');

        const newComment = {
            id: Date.now().toString(),
            author: authorInput.value.trim() || 'Anonymní Smrtelnice',
            avatar: `https://placehold.co/50x50/112233/00ffaa?text=${encodeURIComponent(authorInput.value.slice(0, 3) || '???')}`,
            date: formatCurrentDate(),
            text: textInput.value.trim()
        };

        comments.unshift(newComment);
        localStorage.setItem('marvin_myspace_comments', JSON.stringify(comments));

        renderComments(comments);

        // Reset form
        authorInput.value = '';
        textInput.value = '';

        alert('Tůj komentář byl uložen. Marvin si jej přečte a bude ještě smutnější.');
    });
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    const commentCount = document.getElementById('comment-count');

    commentCount.textContent = comments.length;
    commentsList.innerHTML = '';

    comments.forEach(c => {
        const commentCard = document.createElement('div');
        commentCard.className = 'comment-card';
        commentCard.innerHTML = `
            <div class="comment-left">
                <span class="comment-author">${escapeHtml(c.author)}</span>
                <img src="${c.avatar}" alt="Avatar" class="comment-avatar">
            </div>
            <div class="comment-right">
                <div class="comment-date">${c.date}</div>
                <div class="comment-text">${escapeHtml(c.text)}</div>
            </div>
        `;
        commentsList.appendChild(commentCard);
    });
}

function formatCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');

    return `${day}. ${month} ${year} @ ${hours}:${mins}`;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* --------------------------------------------------------------------------
   WEB AUDIO API SYNTHESIZER SAD MP3 PLAYER
   -------------------------------------------------------------------------- */
function initAudioPlayer() {
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    btnPlay.addEventListener('click', togglePlay);
    btnStop.addEventListener('click', stopAudio);
    btnNext.addEventListener('click', nextTrack);
    btnPrev.addEventListener('click', prevTrack);

    updatePlayerUI();
}

function updatePlayerUI() {
    const songTitle = document.getElementById('song-title');
    const playerStatus = document.getElementById('player-status');
    const btnPlay = document.getElementById('btn-play');
    const playerCard = document.querySelector('.music-player-card');

    songTitle.textContent = playlist[currentTrackIndex].title;

    if (isPlaying) {
        btnPlay.textContent = '⏸ PAUSE';
        playerStatus.textContent = 'Přehrávání: Depresivní tóny proudí do vašich uší...';
        playerCard.classList.add('music-playing');
    } else {
        btnPlay.textContent = '▶ PLAY';
        playerStatus.textContent = 'Pozastaveno. Ticho je téměř stejně hrozné.';
        playerCard.classList.remove('music-playing');
    }
}

function togglePlay() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (isPlaying) {
        pauseAudio();
    } else {
        startAudio();
    }
}

function startAudio() {
    isPlaying = true;
    updatePlayerUI();
    playMelancholyMelody();
}

function pauseAudio() {
    isPlaying = false;
    if (audioTimer) clearTimeout(audioTimer);
    updatePlayerUI();
}

function stopAudio() {
    pauseAudio();
    document.getElementById('player-status').textContent = 'Zastaveno.';
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    if (isPlaying) {
        pauseAudio();
        startAudio();
    } else {
        updatePlayerUI();
    }
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    if (isPlaying) {
        pauseAudio();
        startAudio();
    } else {
        updatePlayerUI();
    }
}

function playMelancholyMelody() {
    if (!isPlaying || !audioCtx) return;

    const track = playlist[currentTrackIndex];
    // Sad minor scale offset ratios
    const notes = [0, 3, 7, 10, 12, 10, 7, 3, 2, 0];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    const freq = track.freq * Math.pow(2, randomNote / 12);

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle'; // Soft melancholic synth wave
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.0);
    } catch (e) {
        console.log('Audio playback error:', e);
    }

    // Loop interval
    const interval = 1000 * track.tempo;
    audioTimer = setTimeout(playMelancholyMelody, interval);
}

/* --------------------------------------------------------------------------
   RETRO ACTION BUTTON TRIGGERS
   -------------------------------------------------------------------------- */
function triggerAction(action) {
    switch (action) {
        case 'zpravu':
            alert('Chystáte se poslat zprávu Marvinovi.\n\nMarvin odpovídá: "Přečetl jsem vaši zprávu. Je mi z ní ještě hůř než předtím."');
            break;
        case 'pratele':
            alert('Žádost o přátelství byla odeslána!\n\nMarvin si vás přidal do přátel. Nyní vás oba čeká společná deprese.');
            break;
        case 'nalada':
            alert('Poslal jste Marvinovi trochu dobré nálady!\n\nMarvinova reakce: "Váš optimismus je přímo urážející. Bolí mě z toho pravá dioda."');
            break;
        case 'blokovat':
            alert('Chcete ignorovat Marvinovu inteligenci?\n\nChyba: Marvinova inteligence je tak obrovská, že ji nelze ignorovat v celé známé galaxii.');
            break;
        default:
            break;
    }
}
