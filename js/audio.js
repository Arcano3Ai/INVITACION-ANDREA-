/**
 * Reproductor de música ambiental con reproducción en bucle continuo (loop).
 * Reproduce "Dos Añitos de Magia" desde assets/music.mp3.
 */
(function (global) {
  'use strict';

  const AUDIO_SRC = 'assets/music.mp3';

  class MusicBoxPlayer {
    constructor(buttonId) {
      this.btn = document.getElementById(buttonId);
      this.isPlaying = false;

      this.audio = new Audio(AUDIO_SRC);
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = 0.65;

      // Respaldo explícito por si algún navegador ignora la propiedad loop
      this.audio.addEventListener('ended', () => {
        if (this.isPlaying) {
          this.audio.currentTime = 0;
          this.audio.play().catch(() => {});
        }
      });
    }

    syncUI() {
      if (!this.btn) return;
      this.btn.classList.toggle('is-playing', this.isPlaying);
    }

    play() {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.syncUI();

      const playPromise = this.audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Si el navegador bloquea reproducción sin gesto previo, revertir estado
          this.isPlaying = false;
          this.syncUI();
        });
      }
    }

    pause() {
      this.isPlaying = false;
      this.audio.pause();
      this.syncUI();
    }

    toggle() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
      return this.isPlaying;
    }
  }

  global.MusicBoxPlayer = MusicBoxPlayer;
})(window);
