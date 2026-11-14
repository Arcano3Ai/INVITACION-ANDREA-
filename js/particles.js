/**
 * Sistema de partículas y destellos mágicos en Canvas HiDPI.
 */
(function (global) {
  'use strict';

  const COLORS = ['#d4af37', '#fff1b8', '#ff3b82', '#ff85b3', '#ffffff'];
  const SHAPES = ['sparkle', 'heart', 'confetti', 'dot'];

  class SparkleSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.rafId = null;
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);
      this.onVisibilityChange = this.onVisibilityChange.bind(this);

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', this.resize, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      // Partículas ambientales iniciales
      const ambientCount = window.innerWidth < 600 ? 22 : 36;
      for (let i = 0; i < ambientCount; i++) {
        this.particles.push(this.createAmbientParticle(true));
      }

      this.start();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    createAmbientParticle(randomY = false) {
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : this.height + 16,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -(0.25 + Math.random() * 0.55),
        size: 3 + Math.random() * 5,
        alpha: 0.25 + Math.random() * 0.55,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.03,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        isBurst: false,
        life: 1,
        decay: 0
      };
    }

    burst(originX, originY, count = 55) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 2.5 + Math.random() * 6.5;
        this.particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.2,
          size: 4 + Math.random() * 6,
          alpha: 1,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.12,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          isBurst: true,
          life: 1,
          decay: 0.012 + Math.random() * 0.01
        });
      }
    }

    drawSparkle(p) {
      const { ctx } = this;
      const r = p.size;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        ctx.lineTo(
          Math.cos(angle + Math.PI / 4) * (r * 0.32),
          Math.sin(angle + Math.PI / 4) * (r * 0.32)
        );
      }
      ctx.closePath();
      ctx.fill();
    }

    drawHeart(p) {
      const { ctx } = this;
      const s = p.size * 0.7;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s, -s * 0.45, -s * 1.15, s * 0.65, 0, s * 1.25);
      ctx.bezierCurveTo(s * 1.15, s * 0.65, s, -s * 0.45, 0, s * 0.35);
      ctx.closePath();
      ctx.fill();
    }

    drawParticle(p) {
      const { ctx } = this;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.alpha * p.life);
      ctx.fillStyle = p.color;

      if (p.shape === 'sparkle') {
        this.drawSparkle(p);
      } else if (p.shape === 'heart') {
        this.drawHeart(p);
      } else if (p.shape === 'confetti') {
        ctx.fillRect(-p.size * 0.7, -p.size * 0.25, p.size * 1.4, p.size * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    loop() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.isBurst) {
          p.vy += 0.12; // gravedad suave
          p.vx *= 0.985;
          p.life -= p.decay;
          if (p.life <= 0) {
            this.particles.splice(i, 1);
            continue;
          }
        } else {
          // Reciclar partícula ambiental cuando sale por arriba
          if (p.y < -20 || p.x < -20 || p.x > this.width + 20) {
            this.particles[i] = this.createAmbientParticle(false);
          }
        }

        this.drawParticle(p);
      }

      this.rafId = requestAnimationFrame(this.loop);
    }

    start() {
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.loop);
      }
    }

    stop() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    onVisibilityChange() {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    }
  }

  global.SparkleSystem = SparkleSystem;
})(window);

