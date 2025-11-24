import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const icons = [
      '📚', '✈️', '🎓', '🌍', '🏛️', '🎒', '📖', '🗺️',
      '🏫', '🛫', '🎯', '🌏', '📝', '🗼', '🏰', '🎨',
      '🔬', '🗽', '🕌', '⛩️', '🏔️', '🌉'
    ];

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.speed = Math.random() * 0.5 + 0.2;
        this.icon = icons[Math.floor(Math.random() * icons.length)];
        this.size = Math.random() * 20 + 15;
        this.swing = Math.random() * 2 - 1;
        this.swingSpeed = Math.random() * 0.02 + 0.01;
        this.swingAmount = Math.random() * 30 + 10;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        this.y += this.speed;
        this.swing += this.swingSpeed;
        this.x += Math.sin(this.swing) * 0.5;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x + Math.sin(this.swing) * this.swingAmount, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        ctx.restore();
      }
    }

    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #dbeafe 100%)' }}
    />
  );
};

export default AnimatedBackground;
