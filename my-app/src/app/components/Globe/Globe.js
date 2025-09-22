"use client"

import React, { useEffect, useRef } from 'react';
import './Globe.css';

const BusinessNetwork = () => {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const cardsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const createParticles = () => {
      const particles = [];
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        
        particles.push({
          element: particle,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
        
        containerRef.current?.appendChild(particle);
      }
      particlesRef.current = particles;
    };

    const createCards = () => {
      const cardData = [
        { title: 'Business', icon: '💼' },
        { title: 'Analytics', icon: '📊' },
        { title: 'Growth', icon: '📈' },
        { title: 'Innovation', icon: '💡' },
        { title: 'Network', icon: '🌐' }
      ];

      const cards = cardData.map((data, index) => {
        const card = document.createElement('div');
        card.className = 'floating-card';
        card.innerHTML = `
          <div class="card-content">
            <span class="card-icon">${data.icon}</span>
            <span class="card-title">${data.title}</span>
          </div>
        `;

        // Position cards in a pentagon formation with adjusted radius
        const angle = (index / cardData.length) * Math.PI * 2 - Math.PI / 2; // Start from top
        const radius = 25; // Reduced radius for tighter formation
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        card.style.left = `${x}%`;
        card.style.top = `${y}%`;

        containerRef.current?.appendChild(card);
        return { element: card, x, y, angle, data };
      });

      cardsRef.current = cards;
    };

    const drawConnections = () => {
      const canvas = document.createElement('canvas');
      canvas.className = 'connections-canvas';
      containerRef.current?.appendChild(canvas);

      const updateCanvas = () => {
        const ctx = canvas.getContext('2d');
        canvas.width = containerRef.current?.offsetWidth || 0;
        canvas.height = containerRef.current?.offsetHeight || 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Draw connections between cards
        cardsRef.current.forEach((card, i) => {
          const rect1 = card.element.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          
          cardsRef.current.forEach((otherCard, j) => {
            if (i !== j) {
              const rect2 = otherCard.element.getBoundingClientRect();
              
              const x1 = rect1.left - containerRect.left + rect1.width / 2;
              const y1 = rect1.top - containerRect.top + rect1.height / 2;
              const x2 = rect2.left - containerRect.left + rect2.width / 2;
              const y2 = rect2.top - containerRect.top + rect2.height / 2;

              // Draw gradient line
              const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
              gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
              gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
              ctx.strokeStyle = gradient;

              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          });
        });

        requestAnimationFrame(updateCanvas);
      };

      updateCanvas();
    };

    const animate = () => {
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x < 0 || particle.x > 100) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 100) particle.vy *= -1;

        particle.element.style.left = `${particle.x}%`;
        particle.element.style.top = `${particle.y}%`;
      });

      // Rotate cards slightly
      cardsRef.current.forEach((card, index) => {
        const time = Date.now() / 2000;
        const offset = index * (Math.PI * 2 / cardsRef.current.length);
        const rotation = Math.sin(time + offset) * 5;
        card.element.style.transform = `rotate(${rotation}deg)`;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    if (containerRef.current) {
      createParticles();
      createCards();
      drawConnections();
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particlesRef.current.forEach(p => p.element.remove());
      cardsRef.current.forEach(c => c.element.remove());
      particlesRef.current = [];
      cardsRef.current = [];
    };
  }, []);

  return (
    <div className="network-container" ref={containerRef}>
      <div className="glow-background"></div>
    </div>
  );
};

export default BusinessNetwork; 