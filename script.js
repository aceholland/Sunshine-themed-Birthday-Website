/* ===== DIGITAL SCRAPBOOK - INTERACTIVE ENGINE ===== */

(function () {
  'use strict';

  // ===== CONFIG =====
  const BIRTHDAY_NAME = 'Adi'; // Change this to personalize!

  // ===== PARTICLES SYSTEM =====
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 45;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedY = -(Math.random() * 0.3 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.type = Math.random() > 0.5 ? 'star' : 'sunflower';
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.005;
    }
    update() {
      this.y += this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.3;
      if (this.y < -10) { this.reset(); this.y = canvas.height + 10; }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.type === 'star') {
        ctx.fillStyle = '#FFC857';
        ctx.font = this.size * 4 + 'px serif';
        ctx.fillText('✦', this.x, this.y);
      } else {
        ctx.fillStyle = '#FFB385';
        ctx.font = this.size * 3.5 + 'px serif';
        ctx.fillText('🌻', this.x, this.y);
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ===== CURSOR SPARKLE TRAIL =====
  let lastSparkle = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkle < 80) return;
    lastSparkle = now;
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = e.clientX + 'px';
    sparkle.style.top = e.clientY + 'px';
    sparkle.style.background = ['#FFC857', '#FFB385', '#F1E3D3', '#FBEA9E'][Math.floor(Math.random() * 4)];
    sparkle.style.width = sparkle.style.height = (Math.random() * 5 + 3) + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  });

  // ===== OPEN SCRAPBOOK =====
  const openBtn = document.getElementById('openBtn');
  const scrapbookContent = document.getElementById('scrapbookContent');
  const landing = document.getElementById('landing');

  openBtn.addEventListener('click', () => {
    scrapbookContent.classList.add('visible');
    landing.style.transition = 'opacity 1s ease';
    landing.style.opacity = '0';
    setTimeout(() => {
      landing.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Trigger scroll-based animations
      observeElements();
    }, 1000);
  });

  // ===== SCROLL ANIMATIONS (IntersectionObserver) =====
  function observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Typewriter effect for tiny notes
          if (entry.target.classList.contains('tiny-note')) {
            typewriterEffect(entry.target);
          }
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-scroll]').forEach(el => observer.observe(el));
  }

  // Run on load too for non-scrapbook elements
  observeElements();

  // ===== TYPEWRITER EFFECT =====
  function typewriterEffect(el) {
    if (el.dataset.typed) return;
    el.dataset.typed = 'true';
    const text = el.textContent;
    el.textContent = '';
    el.style.opacity = '1';
    el.style.transform = `translateY(0) rotate(${getComputedStyle(el).getPropertyValue('--rot')})`;
    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, 25 + Math.random() * 20);
      }
    }
    type();
  }

  // ===== REASON CARDS EXPAND =====
  document.querySelectorAll('.reason-card').forEach(card => {
    card.addEventListener('click', () => {
      const wasExpanded = card.classList.contains('expanded');
      // Close all others
      document.querySelectorAll('.reason-card.expanded').forEach(c => c.classList.remove('expanded'));
      if (!wasExpanded) card.classList.add('expanded');
    });
  });

  // ===== VINYL MUSIC PLAYER =====
  const vinylDisc = document.getElementById('vinylDisc');
  const playPauseBtn = document.getElementById('playPause');
  const trackListEl = document.getElementById('trackList');
  const audioProgress = document.getElementById('audioProgress');
  const timeCurrent = document.querySelector('.time-current');
  const timeDuration = document.querySelector('.time-duration');
  let isPlaying = false;
  let currentTrack = 0;

  // Real MP3 tracks list - renamed to match the user's uploaded songs
  const tracks = [
    'assets/audio/yellow.mp3',
    'assets/audio/daylight.mp3',
    'assets/audio/line_without_a_hook.mp3',
    'assets/audio/fate_of_ophelia.mp3'
  ];

  const vinylAudio = new Audio();
  vinylAudio.volume = 0.55;

  // Format time (seconds to M:SS)
  function formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Update progress bar & current time
  vinylAudio.addEventListener('timeupdate', () => {
    if (vinylAudio.duration) {
      const pct = (vinylAudio.currentTime / vinylAudio.duration) * 100;
      audioProgress.value = pct;
      timeCurrent.textContent = formatTime(vinylAudio.currentTime);
    }
  });

  // Load duration when metadata is ready
  vinylAudio.addEventListener('loadedmetadata', () => {
    timeDuration.textContent = formatTime(vinylAudio.duration);
  });

  // Seek audio progress
  audioProgress.addEventListener('input', () => {
    if (vinylAudio.duration) {
      const seekTime = (audioProgress.value / 100) * vinylAudio.duration;
      vinylAudio.currentTime = seekTime;
    }
  });

  playPauseBtn.addEventListener('click', () => {
    if (!vinylAudio.src) {
      vinylAudio.src = tracks[currentTrack];
    }
    
    isPlaying = !isPlaying;
    vinylDisc.classList.toggle('spinning', isPlaying);
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
      // Pause ambient bg music if playing to prevent overlay clash
      if (musicPlaying) {
        musicToggle.click(); // Trigger ambient music toggle off
      }

      vinylAudio.play().catch(err => {
        console.warn(`Track file "${tracks[currentTrack]}" not found. Place MP3 files in assets/audio/ to play sound.`, err);
      });
    } else {
      vinylAudio.pause();
    }
  });

  document.getElementById('prevTrack').addEventListener('click', () => {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    updateTrack();
  });
  
  document.getElementById('nextTrack').addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    updateTrack();
  });

  // Click a track in the list to play it immediately
  trackListEl.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li) { 
      currentTrack = parseInt(li.dataset.track); 
      
      // Auto-start play state when selecting a track directly
      isPlaying = true;
      vinylDisc.classList.add('spinning');
      playPauseBtn.textContent = '⏸';
      
      // Pause ambient bg music to avoid clash
      if (musicPlaying) {
        musicToggle.classList.add('muted');
        ambientAudio.pause();
        musicPlaying = false;
        if (oscillator) {
          oscillator.stop();
          if (oscillator._osc2) oscillator._osc2.stop();
          oscillator = null;
        }
      }

      updateTrack(); 
    }
  });

  function updateTrack() {
    trackListEl.querySelectorAll('li').forEach((li, i) => {
      li.classList.toggle('active', i === currentTrack);
    });

    const wasPlaying = isPlaying;
    vinylAudio.src = tracks[currentTrack];
    
    // Reset progress slider when track changes
    audioProgress.value = 0;
    timeCurrent.textContent = '0:00';
    timeDuration.textContent = '0:00';

    if (wasPlaying) {
      vinylAudio.play().catch(err => {
        console.warn(`Track file "${tracks[currentTrack]}" not found. Place MP3 files in assets/audio/ to play sound.`, err);
      });
    }
  }

  // Auto play next track when current ends
  vinylAudio.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    updateTrack();
  });

  // ===== EASTER EGGS =====
  const secretPopup = document.getElementById('secretPopup');
  const secretText = document.getElementById('secretText');
  let eggsFound = 0;

  document.querySelectorAll('.easter-egg').forEach(egg => {
    egg.addEventListener('click', () => {
      secretText.textContent = egg.dataset.secret;
      secretPopup.classList.add('show');
      egg.style.opacity = '1';
      egg.style.filter = 'drop-shadow(0 0 12px rgba(255,200,87,0.8))';
      eggsFound++;
      if (eggsFound >= 5) {
        setTimeout(() => {
          secretText.textContent = '🎉 You found ALL the hidden secrets! You really went looking for every little thing. That says a lot about you — you never miss the details. 💛';
          secretPopup.classList.add('show');
        }, 1500);
      }
    });
  });

  document.getElementById('closeSecret').addEventListener('click', () => {
    secretPopup.classList.remove('show');
  });
  secretPopup.addEventListener('click', (e) => {
    if (e.target === secretPopup) secretPopup.classList.remove('show');
  });

  // ===== ENVELOPE / FINAL LETTER =====
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const envelope = document.getElementById('envelope');

  envelope.addEventListener('click', () => {
    envelope.classList.add('open');
    setTimeout(() => envelopeWrapper.classList.add('opened'), 300);
  });

  // Finale trigger — observe the letter being fully read
  const letter = document.getElementById('letter');
  const finaleOverlay = document.getElementById('finaleOverlay');
  let finaleTriggered = false;

  // Trigger finale when user scrolls past the final letter section
  const finaleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && envelopeWrapper.classList.contains('opened') && !finaleTriggered) {
        finaleTriggered = true;
        setTimeout(() => {
          finaleOverlay.classList.add('active');
          // Create finale stars on the overlay
          for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
              position:absolute;font-size:${Math.random()*16+8}px;
              left:${Math.random()*100}%;top:${Math.random()*100}%;
              opacity:0;animation:fadeInUp ${Math.random()*3+2}s ease ${Math.random()*3}s forwards;
              color:#FFC857;
            `;
            star.textContent = ['✦','🌻','✨','⭐','☀️'][Math.floor(Math.random()*5)];
            finaleOverlay.appendChild(star);
          }
        }, 3000);
      }
    });
  }, { threshold: 0.5 });

  // We'll observe the letter element once the scrapbook opens
  const letterSection = document.getElementById('final-letter');
  finaleObserver.observe(letterSection);

  // ===== MUSIC TOGGLE (ambient) =====
  const musicToggle = document.getElementById('musicToggle');
  let musicPlaying = false;
  let audioCtx, gainNode, oscillator;

  // Ambient MP3 audio object - using Coldplay's Yellow as default background track
  const ambientAudio = new Audio('assets/audio/yellow.mp3');
  ambientAudio.loop = true;
  ambientAudio.volume = 0.3;

  // Initialize music button with custom icon and initial muted state
  musicToggle.innerHTML = '<span class="music-icon">♫</span>';
  musicToggle.classList.add('muted');

  musicToggle.addEventListener('click', () => {
    musicPlaying = !musicPlaying;
    
    if (musicPlaying) {
      musicToggle.classList.remove('muted');
      
      // Pause vinyl audio if it was playing to avoid overlay clash
      if (isPlaying) {
        playPauseBtn.click(); // Pause the vinyl player
      }

      // Try playing actual MP3 first
      ambientAudio.play().catch(err => {
        console.warn("Ambient background MP3 not found. Falling back to synthetic drone sound.", err);
        
        // Fallback Web Audio drone
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          gainNode = audioCtx.createGain();
          gainNode.gain.value = 0.03;
          gainNode.connect(audioCtx.destination);
        }
        if (!oscillator) {
          oscillator = audioCtx.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.value = 220;
          oscillator.connect(gainNode);
          oscillator.start();
          
          const osc2 = audioCtx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.value = 330;
          const g2 = audioCtx.createGain();
          g2.gain.value = 0.015;
          osc2.connect(g2);
          g2.connect(audioCtx.destination);
          osc2.start();
          oscillator._osc2 = osc2;
          oscillator._g2 = g2;
        }
      });
    } else {
      musicToggle.classList.add('muted');
      ambientAudio.pause();
      
      if (oscillator) {
        oscillator.stop();
        if (oscillator._osc2) oscillator._osc2.stop();
        oscillator = null;
      }
    }
  });

  // ===== PARALLAX ON SCROLL =====
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      heroImg.style.transform = `translateY(${scrolled * 0.05}px)`;
    }
    // Parallax on polaroids
    document.querySelectorAll('.polaroid').forEach((p, i) => {
      const rect = p.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (rect.top - window.innerHeight / 2) * 0.03;
        p.style.marginTop = offset + 'px';
      }
    });
  });

  // ===== DRAGGABLE POLAROIDS =====
  document.querySelectorAll('.polaroid').forEach(polaroid => {
    let isDragging = false, startX, startY, origX, origY;

    polaroid.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = polaroid.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      polaroid.style.zIndex = '100';
      polaroid.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      polaroid.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.05}deg)`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        polaroid.style.zIndex = '';
        polaroid.style.cursor = '';
        polaroid.style.transition = 'transform 0.5s ease';
        polaroid.style.transform = '';
        setTimeout(() => { polaroid.style.transition = ''; }, 500);
      }
    });
  });

  // ===== CLICK FINALE OVERLAY TO CLOSE =====
  finaleOverlay.addEventListener('click', () => {
    finaleOverlay.style.transition = 'opacity 2s';
    finaleOverlay.style.opacity = '0';
    setTimeout(() => { finaleOverlay.classList.remove('active'); finaleOverlay.style.opacity = ''; }, 2000);
  });

})();
