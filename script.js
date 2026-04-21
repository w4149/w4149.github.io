(function() {
  const universe = document.getElementById('universe');
  const sentenceElements = [];
  let hoveredId = null;
  let animationId = null;
  let currentAudio = null;

  const GRAVITY_G = 8000;
  const DAMPING = 0.92;
  const RETURN_SPEED = 0.08;
  const REPULSION_STRENGTH = 0.15;

  function init() {
    sentences.forEach((data, index) => {
      const el = document.createElement('div');
      el.className = 'sentence';
      el.textContent = data.text;
      el.dataset.id = data.id;
      if (data.audio) {
        el.dataset.audio = data.audio;
      }
      el.style.left = data.x + '%';
      el.style.top = data.y + '%';
      el.style.opacity = 0.3 + Math.random() * 0.3;
      universe.appendChild(el);

      sentenceElements.push({
        el,
        id: data.id,
        originX: data.x,
        originY: data.y,
        x: data.x,
        y: data.y,
        vx: 0,
        vy: 0,
        isHovered: false
      });

      el.addEventListener('mouseenter', () => handleMouseEnter(data.id));
      el.addEventListener('mouseleave', () => handleMouseLeave(data.id));
      el.addEventListener('click', () => playAudio(data.text));

      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTouchStart(data.id);
      }, { passive: false });
    });

    animationId = requestAnimationFrame(updatePositions);
  }

  function handleMouseEnter(id) {
    hoveredId = id;
    sentenceElements.forEach(s => {
      s.isHovered = s.id === id;
      if (s.id === id) {
        s.el.classList.add('active');
        s.el.classList.remove('dispersing');
      }
    });
  }

  function handleMouseLeave(id) {
    if (hoveredId === id) {
      hoveredId = null;
      sentenceElements.forEach(s => {
        s.isHovered = false;
        s.el.classList.remove('active');
      });
    }
  }

  let touchHoveredId = null;
  let touchTimeout = null;

  function handleTouchStart(id) {
    if (touchHoveredId === id) {
      playAudio(sentenceElements.find(s => s.id === id).el.textContent);
    } else {
      touchHoveredId = id;
      handleMouseEnter(id);
      touchTimeout = setTimeout(() => {
        if (touchHoveredId === id) {
          playAudio(sentenceElements.find(s => s.id === id).el.textContent);
          touchHoveredId = null;
          handleMouseLeave(id);
        }
      }, 500);
    }
  }

  function playAudio(sentence) {
    // 停止当前正在播放的音频
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    const sentenceData = sentenceElements.find(s => s.el.textContent === sentence);
    if (sentenceData && sentenceData.el.dataset.audio) {
      currentAudio = new Audio(sentenceData.el.dataset.audio);
      currentAudio.crossOrigin = 'anonymous';
      currentAudio.play().catch(error => {
        console.log('Audio play error:', error);
        // 显示错误信息以便调试
        console.log('Audio path:', sentenceData.el.dataset.audio);
        // 微信浏览器可能不支持 Web Speech API，尝试直接播放
        fallbackToSpeech(sentence);
      });
    } else {
      fallbackToSpeech(sentence);
    }
  }

  function fallbackToSpeech(text) {
    // 停止语音合成
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
    
    // 检查是否支持 Web Speech API
    if ('speechSynthesis' in window && speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.log('Speech synthesis error:', error);
        // 微信浏览器不支持语音合成时的处理
        console.log('Web Speech API not supported, using audio fallback');
      }
    } else {
      console.log('Web Speech API not available');
    }
  }

  function updatePositions() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    sentenceElements.forEach(s => {
      if (s.isHovered) {
        const targetX = s.originX;
        const targetY = s.originY;
        s.x += (targetX - s.x) * RETURN_SPEED;
        s.y += (targetY - s.y) * RETURN_SPEED;
        s.vx = 0;
        s.vy = 0;
      } else {
        if (hoveredId !== null) {
          const hovered = sentenceElements.find(item => item.id === hoveredId);
          if (hovered) {
            const hx = (hovered.x / 100) * window.innerWidth;
            const hy = (hovered.y / 100) * window.innerHeight;
            const sx = (s.x / 100) * window.innerWidth;
            const sy = (s.y / 100) * window.innerHeight;

            const dx = sx - hx;
            const dy = sy - hy;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist > 1) {
              const force = GRAVITY_G / (distSq + 1000);
              s.vx += (dx / dist) * force * REPULSION_STRENGTH;
              s.vy += (dy / dist) * force * REPULSION_STRENGTH;
            }
          }
        }

        s.vx += (s.originX - s.x) * RETURN_SPEED * 0.3;
        s.vy += (s.originY - s.y) * RETURN_SPEED * 0.3;

        s.vx *= DAMPING;
        s.vy *= DAMPING;

        s.x += s.vx;
        s.y += s.vy;

        s.x = Math.max(0, Math.min(100, s.x));
        s.y = Math.max(0, Math.min(100, s.y));
      }

      s.el.style.left = s.x + '%';
      s.el.style.top = s.y + '%';
    });

    animationId = requestAnimationFrame(updatePositions);
  }

  init();
})();