import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Mouse state
    let mouse = { x: null, y: null, radius: 150 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    class Particle {
      constructor() {
        // Spawn only in the left 25% or right 25% of the screen
        let isLeftSide = Math.random() < 0.5;
        this.x = isLeftSide ? Math.random() * (canvas.width * 0.25) : canvas.width - (Math.random() * (canvas.width * 0.25));
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 14 + 6; // Even bigger pixels (6 to 20 radius)
        this.density = (Math.random() * 20) + 1;
        this.glow = Math.random() * 0.5 + 0.2;
        this.baseGlow = this.glow;
        this.vx = (Math.random() - 0.5) * 0.4; // ambient drift
        this.vy = (Math.random() - 0.5) * 0.4;
      }

      draw() {
        ctx.fillStyle = `rgba(201, 168, 76, ${this.glow})`; // Gold/Yellow (--gold-mid)
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#c9a84c'; // Gold glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0; // reset for performance
      }

      update() {
        // Ambient movement
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges but restrict to the sides (left 25% and right 25%)
        let isLeftSide = this.x < canvas.width / 2;
        if (isLeftSide) {
            if (this.x < 0) this.x = canvas.width * 0.25;
            if (this.x > canvas.width * 0.25) this.x = 0;
        } else {
            if (this.x < canvas.width * 0.75) this.x = canvas.width;
            if (this.x > canvas.width) this.x = canvas.width * 0.75;
        }

        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Mouse interaction
        if (mouse.x !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            
            // Repel from mouse
            this.x -= directionX;
            this.y -= directionY;
            
            // Glow bright when interacted with
            this.glow = Math.min(1, this.glow + 0.1); 
          } else {
            // slowly return to base glow
            if (this.glow > this.baseGlow) this.glow -= 0.02;
          }
        } else {
           if (this.glow > this.baseGlow) this.glow -= 0.02;
        }

        this.draw();
      }
    }

    const initParticles = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 4000; // Increased density (3x more particles)
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'var(--bg-void)' // Fallback deep background
      }}
    />
  );
};

export default ParticlesBackground;
