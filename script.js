/* script.js
   AudioLibrary: abre modal con tarjeta ampliada y reproduce audio al abrir.
   - Requiere que el HTML tenga: #audioModal, #modalTitle, #modalDuration, #visualizer, .close-btn
   - Mantiene el grid y las demás tarjetas intactas.
*/

class AudioLibrary {
    constructor() {
        this.currentAudio = null;
        this.currentCard = null;
        this.audioElements = new Map();

        // Referencias al modal
        this.modal = document.getElementById('audioModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalDuration = document.getElementById('modalDuration');
        this.visualizer = document.getElementById('visualizer');
        this.closeBtn = document.querySelector('.close-btn');

        this.init();
    }

    init() {
        const cards = document.querySelectorAll('.audio-card');
        if (!cards.length) {
            console.warn('AudioLibrary: no se encontraron .audio-card en la página.');
        }

        cards.forEach(card => {
            const audioSrc = card.dataset.audio;
            if (!audioSrc) {
                console.warn('AudioLibrary: tarjeta sin data-audio ->', card);
                return;
            }

            // Crear elemento audio y mantener referencia
            const audio = new Audio(audioSrc);
            audio.preload = 'metadata'; // solo metadatos al inicio
            this.audioElements.set(card, audio);

            // Cuando se cargue la metadata mostramos duración en la tarjeta
            audio.addEventListener('loadedmetadata', () => {
                const dur = this.formatTime(audio.duration);
                const durEl = card.querySelector('[data-duration]');
                if (durEl) durEl.textContent = dur;
            });

            // Manejo de errores (archivo no encontrado o CORS)
            audio.addEventListener('error', (e) => {
                const durEl = card.querySelector('[data-duration]');
                if (durEl) durEl.textContent = 'Error al cargar';
                console.error('AudioLibrary: error cargando audio:', audioSrc, e);
            });

            // Click en la tarjeta -> abrir modal y reproducir SOLO al abrir
            card.addEventListener('click', () => this.openModal(card));
        });

        // Close modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Cerrar modal haciendo click fuera del contenido
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    formatTime(seconds) {
        if (!isFinite(seconds) || seconds <= 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    openModal(card) {
        const audio = this.audioElements.get(card);
        if (!audio) {
            console.error('AudioLibrary: no hay audio para la tarjeta', card);
            return;
        }

        // Detener cualquier audio anterior
        if (this.currentAudio && this.currentAudio !== audio) {
            try { this.currentAudio.pause(); } catch (e) { /* ignore */ }
        }

        this.currentAudio = audio;
        this.currentCard = card;

        // Set modal contenido
        const title = card.querySelector('.audio-title')?.textContent || 'Audio';
        const durationText = card.querySelector('[data-duration]')?.textContent || this.formatTime(audio.duration || 0);

        this.modalTitle.textContent = title;
        this.modalDuration.textContent = durationText;

        // Si quieres mostrar una imagen grande, puedes setear .modal-artwork background con JS aquí
        const artworkEl = document.getElementById('modalArtwork');
        // Preferimos data-artwork (configurable), si no existe usamos la imagen dentro de la tarjeta
        let artSrc = '';
        if (card.dataset && card.dataset.artwork) artSrc = card.dataset.artwork;
        else {
            const img = card.querySelector('.card-image');
            if (img) artSrc = img.getAttribute('src') || '';
        }

        if (artworkEl) {
            if (artSrc) {
                // Usar comillas simples para evitar romper si la URL tiene dobles
                artworkEl.style.backgroundImage = `url("${artSrc}")`;
                artworkEl.style.backgroundSize = 'cover';
                artworkEl.style.backgroundPosition = 'center';
            } else {
                artworkEl.style.backgroundImage = '';
            }
        }

        // (Re)iniciar visualizador animado (decorativo)
        if (this.visualizer) {
            // reconstruye spans para asegurar animación limpia
            this.visualizer.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
        }

        // Mostrar modal y reproducir
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.style.display = 'flex';

        // Asegurar que audio empiece desde 0 y reproducir
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                // Error de reproducción (autoplay bloqueado, CORS, etc.)
                console.warn('AudioLibrary: reproducción bloqueada o error', err);
                // Informar visualmente que el audio necesita interacción si ocurre
                this.modalDuration.textContent = 'Toca para reproducir';
                // permitir que el usuario toque el modal para forzar play
                this.modal.addEventListener('click', this._clickToPlayFallback);
            });
        }

        // Opcional: cuando termina, ocultar visual (pero no cerrar modal automáticamente)
        audio.onended = () => {
            // reset visual si se desea
            if (this.visualizer) {
                // pausa la animación visual (simple)
                this.visualizer.querySelectorAll('span').forEach(s => s.style.animationPlayState = 'paused');
            }
        };
    }


    closeModal() {
        // Pausar audio si hay uno
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (e) { /* ignore */ }
            this.currentAudio = null;
        }

        // Ocultar modal
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.style.display = 'none';
        // limpiar artwork
        const artworkEl = document.getElementById('modalArtwork');
        if (artworkEl) artworkEl.style.backgroundImage = '';
    }
}

/* Iniciar cuando DOM listo */
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AudioLibrary();
        console.info('AudioLibrary inicializado correctamente.');
    } catch (err) {
        console.error('AudioLibrary: error al inicializar ->', err);
    }
});
