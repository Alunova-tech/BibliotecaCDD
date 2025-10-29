/* =======================================================
   🎵 AudioLibrary Simplificada (sin botón, solo toque)
   -------------------------------------------------------
   - Reproduce/pausa tocando la tarjeta
   - Sin ícono de play/pause
   - Mantiene animaciones suaves
   ======================================================= */

class AudioLibrary {
    constructor() {
        this.currentAudio = null;
        this.currentCard = null;
        this.audioElements = new Map();
        this.init();
    }

    init() {
        const cards = document.querySelectorAll('.audio-card');

        cards.forEach(card => {
            const audioSrc = card.dataset.audio;
            const audio = new Audio(audioSrc);

            this.audioElements.set(card, audio);

            /* 🕒 Mostrar duración cuando se carga el audio */
            audio.addEventListener('loadedmetadata', () => {
                const duration = this.formatTime(audio.duration);
                card.querySelector('[data-duration]').textContent = duration;
            });

            /* 🔁 Reset al finalizar reproducción */
            audio.addEventListener('ended', () => this.resetCard(card));

            /* ⚠️ Manejo de errores */
            audio.addEventListener('error', () => {
                card.querySelector('[data-duration]').textContent = 'Error al cargar';
            });

            /* 🎧 Clic en toda la tarjeta = reproducir o pausar */
            card.addEventListener('click', () => this.togglePlay(card));

            /* 🌈 Animación de hover suave */
            card.addEventListener('mouseenter', () => this.animateCardHover(card, true));
            card.addEventListener('mouseleave', () => this.animateCardHover(card, false));
        });
    }

    /* 🔢 Formatea el tiempo (min:seg) */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /* 🎧 Controla la reproducción */
    togglePlay(card) {
        const audio = this.audioElements.get(card);

        // Detener cualquier otro audio
        if (this.currentAudio && this.currentAudio !== audio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.resetCard(this.currentCard);
        }

        // Reproducir o pausar con animación suave
        if (audio.paused) {
            audio.play();
            this.currentAudio = audio;
            this.currentCard = card;
            this.animatePlayState(card, true);
        } else {
            audio.pause();
            audio.currentTime = 0;
            this.resetCard(card);
            this.animatePlayState(card, false);
        }
    }

    /* 🔁 Resetear estado */
    resetCard(card) {
        if (this.currentCard === card) {
            this.currentAudio = null;
            this.currentCard = null;
        }
    }

    /* ✨ Animación visual al hacer hover */
    animateCardHover(card, entering) {
        card.animate(
            [
                { transform: entering ? 'translateY(0)' : 'translateY(-5px)', boxShadow: entering ? '0 10px 25px rgba(0,0,0,0.2)' : 'none' },
                { transform: entering ? 'translateY(-5px)' : 'translateY(0)', boxShadow: entering ? '0 10px 25px rgba(0,0,0,0.2)' : 'none' }
            ],
            {
                duration: 300,
                easing: 'ease-in-out',
                fill: 'forwards'
            }
        );
    }

    /* 💫 Animación cuando se reproduce un audio */
    animatePlayState(card, playing) {
        const scale = playing ? 1.05 : 1;
        card.animate(
            [{ transform: `scale(${scale})` }],
            {
                duration: 400,
                easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                fill: 'forwards'
            }
        );
    }
}

/* 🚀 Inicializar una vez cargado el DOM */
document.addEventListener('DOMContentLoaded', () => {
    new AudioLibrary();
});
