import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG, ASSETS, LANDING } from '../config/content.js';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// STATE
// ============================================================
let currentScreen = 'landing';
let journeyIndex = 0;
let isLetterRevealed = false;
let currentPostcardIdx = 0;
let isUnlocked = false;
let scratchPercent = 0;
let scratchRevealed = false;
let isTransitioning = false;
let reactionCounts = {};
let dailyUnlocked = {};
let wishList = [];
let chatBubbleInterval = null;
let landingCountdownOver = false;
let landingActive = true;

const confettiCanvas = document.getElementById('confetti-canvas');
const ctxConfetti = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiRunning = false;

// ============================================================
// PARTICLES
// ============================================================
function initParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 3 + Math.random() * 6;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDuration = 6 + Math.random() * 8 + 's';
    p.style.animationDelay = Math.random() * 6 + 's';
    const colors = ['rgba(255,107,157,0.2)', 'rgba(249,213,110,0.2)', 'rgba(126,200,227,0.2)', 'rgba(201,168,232,0.2)'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(p);
  }
}

// ============================================================
// CHAT BUBBLE
// ============================================================
function showRandomChat() {
  if (currentScreen === 'landing') return;
  const el = document.getElementById('chatBubble');
  const messages = CONFIG.chatBubbles;
  const msg = messages[Math.floor(Math.random() * messages.length)];
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => { el.classList.remove('show'); }, 4000);
}

function startChatBubble() {
  if (chatBubbleInterval) clearInterval(chatBubbleInterval);
  chatBubbleInterval = setInterval(showRandomChat, 12000 + Math.random() * 8000);
}

// ============================================================
// MUSIC PLAYER
// ============================================================
function updateMusicLabel(screenId) {
  const track = ASSETS.music[screenId];
  document.getElementById('musicLabel').textContent = track ? track.label : 'Unknown';
}

// ============================================================
// CONFETTI
// ============================================================
function initConfettiCanvas() {
  const resize = () => { confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();
}

function launchConfetti(count, opts) {
  const options = Object.assign({
    spread: 360, origin: { x: 0.5, y: 0.5 },
    colors: ['#ff6b9d', '#ff8a6b', '#f9d56e', '#7dd8c9', '#c9a8e8', '#7ec8e3', '#ffba7a', '#e87a92']
  }, opts);
  const w = confettiCanvas.width, h = confettiCanvas.height;
  const ox = options.origin.x * w, oy = options.origin.y * h;
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * options.spread - options.spread / 2) * Math.PI / 180;
    const speed = 3 + Math.random() * 6;
    confettiPieces.push({
      x: ox, y: oy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 8,
      color: options.colors[Math.floor(Math.random() * options.colors.length)],
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 8,
      life: 1, decay: 0.006 + Math.random() * 0.008, gravity: 0.1,
      wobble: Math.random() * 2, wobbleSpeed: 0.02 + Math.random() * 0.04,
    });
  }
  if (!confettiRunning) { confettiRunning = true; renderConfetti(); }
}

function renderConfetti() {
  if (confettiPieces.length === 0) { confettiRunning = false; ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); return; }
  ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let i = confettiPieces.length - 1; i >= 0; i--) {
    const p = confettiPieces[i];
    p.x += p.vx; p.vy += p.gravity; p.y += p.vy;
    p.rotation += p.rotSpeed; p.wobble += p.wobbleSpeed;
    p.x += Math.sin(p.wobble) * 0.5;
    p.life -= p.decay;
    if (p.life <= 0 || p.y > confettiCanvas.height + 50) { confettiPieces.splice(i, 1); continue; }
    ctxConfetti.save();
    ctxConfetti.translate(p.x, p.y);
    ctxConfetti.rotate(p.rotation * Math.PI / 180);
    ctxConfetti.globalAlpha = Math.max(0, p.life);
    ctxConfetti.fillStyle = p.color;
    ctxConfetti.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctxConfetti.restore();
  }
  requestAnimationFrame(renderConfetti);
}

// ============================================================
// HEARTS CANVAS (for landing phase 3)
// ============================================================
const heartsCanvas = document.getElementById('hearts-canvas');
const ctxHearts = heartsCanvas ? heartsCanvas.getContext('2d') : null;
let heartsPieces = [], heartsRunning = false;

function drawHeartPath(cx, cy, size) {
  const s = size / 22;
  return [
    { x: cx, y: cy + s * 4 },
    { x: cx, y: cy, cp: null },
    { x: cx - s * 11, y: cy, cp: { x1: cx, y1: cy - s * 6, x2: cx - s * 11, y2: cy - s * 6 } },
    { x: cx - s * 11, y: cy + s * 7, cp: { x1: cx - s * 11, y1: cy + s * 13, x2: cx, y2: cy + s * 16 } },
    { x: cx, y: cy + s * 20, cp: { x1: cx, y1: cy + s * 16, x2: cx + s * 11, y2: cy + s * 13 } },
    { x: cx + s * 11, y: cy + s * 7, cp: { x1: cx + s * 11, y1: cy - s * 6, x2: cx, y2: cy - s * 6 } },
    { x: cx, y: cy, cp: null },
  ];
}

function launchHearts(count) {
  const w = heartsCanvas ? heartsCanvas.width : window.innerWidth;
  for (let i = 0; i < count; i++) {
    heartsPieces.push({
      x: Math.random() * w,
      y: -30 - Math.random() * 100,
      vy: 1.2 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 2,
      size: 12 + Math.random() * 24,
      color: ['#ff6b9d', '#ff8a6b', '#fce4ec', '#c9a8e8', '#ffba7a'][Math.floor(Math.random() * 5)],
      opacity: 0.3 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.03,
    });
  }
  if (!heartsRunning) { heartsRunning = true; renderHearts(); }
}

function renderHearts() {
  if (!heartsCanvas || !ctxHearts) return;
  if (heartsPieces.length === 0 && heartsRunning) {
    heartsRunning = false;
    ctxHearts.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
    return;
  }
  ctxHearts.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
  for (let i = heartsPieces.length - 1; i >= 0; i--) {
    const h = heartsPieces[i];
    h.y += h.vy;
    h.x += h.vx + Math.sin(h.wobble) * 0.8;
    h.wobble += h.wobbleSpeed;
    if (h.y > heartsCanvas.height + 60) {
      h.y = -60;
      h.x = Math.random() * heartsCanvas.width;
    }
    ctxHearts.save();
    ctxHearts.globalAlpha = h.opacity;
    ctxHearts.fillStyle = h.color;
    ctxHearts.beginPath();
    const s = h.size / 22;
    const cx = h.x, cy = h.y;
    ctxHearts.moveTo(cx, cy + s * 4);
    ctxHearts.bezierCurveTo(cx, cy - s * 6, cx - s * 11, cy - s * 6, cx - s * 11, cy + s * 7);
    ctxHearts.bezierCurveTo(cx - s * 11, cy + s * 13, cx, cy + s * 16, cx, cy + s * 20);
    ctxHearts.bezierCurveTo(cx, cy + s * 16, cx + s * 11, cy + s * 13, cx + s * 11, cy + s * 7);
    ctxHearts.bezierCurveTo(cx + s * 11, cy - s * 6, cx, cy - s * 6, cx, cy + s * 4);
    ctxHearts.closePath();
    ctxHearts.fill();
    ctxHearts.restore();
  }
  requestAnimationFrame(renderHearts);
}

// ============================================================
// SCREEN MANAGEMENT
// ============================================================
function showScreen(id, animate) {
  if (isTransitioning || currentScreen === id) return;
  isTransitioning = true;
  const old = document.getElementById('screen-' + currentScreen);
  const next = document.getElementById('screen-' + id);
  if (!old || !next) { isTransitioning = false; return; }
  if (animate !== false) {
    gsap.timeline({ onComplete: () => { isTransitioning = false; } })
      .to(old, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
        old.classList.remove('active');
        old.style.opacity = '';
        gsap.set(old.querySelectorAll('.bento-card'), { clearProps: 'all' });
        next.classList.add('active');
        next.style.opacity = '0';
        gsap.to(next, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        updateMusicLabel(id);
        ScrollTrigger.refresh();
      }});
  } else {
    old.classList.remove('active');
    next.classList.add('active');
    isTransitioning = false;
    updateMusicLabel(id);
    ScrollTrigger.refresh();
  }
  currentScreen = id;
  if (id === 'stories') initStories();
  if (id === 'album') initAlbum();
  if (id === 'journey') initJourney();
  if (id === 'postcard') initPostcard();
  if (id === 'secret') initSecret();
  if (id === 'surprise') initSurpriseBox();
  if (id === 'daily') initDailyNotes();
  if (id === 'wish') initWishWall();
}

// ============================================================
// LANDING SEQUENCE
// ============================================================
let landingMsgIndex = 0;
let landingMsgInterval = null;

function cycleCountdownMessages() {
  const target = document.getElementById('countdown-type-target');
  if (!target) return;
  const msgs = LANDING.countdownMessages;
  const msg = msgs[landingMsgIndex % msgs.length];
  landingMsgIndex++;
  typeText(target, msg);
}

function typeText(el, text) {
  el.innerHTML = '';
  const words = text.split(' ');
  words.forEach((word, wi) => {
    const wrapper = document.createElement('span');
    wrapper.style.display = 'inline-block';
    wrapper.style.whiteSpace = 'nowrap';
    word.split('').forEach((ch, ci) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      wrapper.appendChild(span);
      gsap.set(span, { opacity: 0, y: 5, scale: 0.9 });
      gsap.to(span, { opacity: 1, y: 0, scale: 1, duration: 0.18, delay: 0.05 + wi * 0.08 + ci * 0.02, ease: 'back.out(1.6)', onStart: () => span.classList.add('show') });
    });
    el.appendChild(wrapper);
    if (wi < words.length - 1) {
      const space = document.createTextNode('\u00A0');
      el.appendChild(space);
    }
  });
}

function updateLandingCountdown() {
  if (landingCountdownOver) return;
  const now = new Date();
  const diff = LANDING.countdownTarget - now;
  if (diff <= 0) {
    ['lcd-days', 'lcd-hours', 'lcd-mins', 'lcd-secs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    document.getElementById('countdown-type-target').textContent = 'The moment has arrived… ✨';
    document.getElementById('landing-enter-btn').style.display = 'inline-block';
    landingCountdownOver = true;
    if (landingMsgInterval) clearInterval(landingMsgInterval);
    return;
  }
  const elDays = document.getElementById('lcd-days'); if (elDays) elDays.textContent = String(Math.floor(diff / 864e5)).padStart(2, '0');
  const elHrs = document.getElementById('lcd-hours'); if (elHrs) elHrs.textContent = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0');
  const elMin = document.getElementById('lcd-mins'); if (elMin) elMin.textContent = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0');
  const elSec = document.getElementById('lcd-secs'); if (elSec) elSec.textContent = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
}

function initLanding() {
  if (!landingActive) return;
  landingActive = false;

  // resize hearts canvas
  if (heartsCanvas) {
    const rh = () => { heartsCanvas.width = window.innerWidth; heartsCanvas.height = window.innerHeight; };
    window.addEventListener('resize', rh);
    rh();
  }

  // Phase 1: countdown
  document.getElementById('phase-countdown').style.display = 'flex';
  document.getElementById('phase-intro').style.display = 'none';
  document.getElementById('phase-birthday').style.display = 'none';
  document.getElementById('landing-enter-btn').style.display = 'none';
  landingMsgIndex = 0;
  landingCountdownOver = false;

  cycleCountdownMessages();
  landingMsgInterval = setInterval(cycleCountdownMessages, 5000);
  updateLandingCountdown();

  const countdownInterval = setInterval(() => {
    updateLandingCountdown();
    if (landingCountdownOver) {
      clearInterval(countdownInterval);
      gsap.fromTo('#landing-enter-btn', { opacity: 0, scale: 0.5 }, {
        opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)',
        onStart: () => { document.getElementById('landing-enter-btn').style.display = 'inline-block'; }
      });
    }
  }, 1000);

  // skip countdown: show password modal
  const skipOverlay = document.getElementById('skip-overlay');
  const skipInput = document.getElementById('skip-password-input');
  const skipError = document.getElementById('skip-error');

  document.getElementById('landing-skip').onclick = () => {
    skipOverlay.classList.add('open');
    skipInput.value = '';
    skipError.classList.remove('show');
    setTimeout(() => skipInput.focus(), 200);
  };

  document.getElementById('skip-cancel').onclick = () => {
    skipOverlay.classList.remove('open');
  };

  skipOverlay.onclick = (e) => { if (e.target === skipOverlay) skipOverlay.classList.remove('open'); };

  const trySkipPassword = () => {
    if (skipInput.value.trim().toLowerCase() === LANDING.skipPassword) {
      skipOverlay.classList.remove('open');
      landingCountdownOver = true;
      if (landingMsgInterval) clearInterval(landingMsgInterval);
      document.getElementById('countdown-type-target').textContent = 'The moment has arrived… ✨';
      ['lcd-days','lcd-hours','lcd-mins','lcd-secs'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '00'; });
      document.getElementById('landing-enter-btn').style.display = 'inline-block';
      gsap.fromTo('#landing-enter-btn', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' });
      document.getElementById('landing-skip').style.display = 'none';
    } else {
      skipError.classList.add('show');
      gsap.fromTo(skipInput, { x: -4 }, { x: 4, duration: 0.05, repeat: 5, yoyo: true, ease: 'power2.inOut' });
    }
  };

  document.getElementById('skip-confirm').onclick = trySkipPassword;
  skipInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') trySkipPassword(); });

  document.getElementById('landing-enter-btn').onclick = () => {
    if (!landingCountdownOver) return;
    skipOverlay.classList.remove('open');
    document.getElementById('landing-skip').style.display = 'none';
    gsap.to('#phase-countdown', { opacity: 0, duration: 0.5, onComplete: () => {
      document.getElementById('phase-countdown').style.display = 'none';
      startIntroPhase();
    }});
  };

  // CTA button (phase 3 -> menu)
  document.getElementById('landing-cta-btn').onclick = () => {
    gsap.to('#screen-landing', { opacity: 0, duration: 0.6, onComplete: () => {
      document.getElementById('screen-landing').classList.remove('active');
      document.getElementById('screen-landing').style.opacity = '';
      heartsPieces = [];
      heartsRunning = false;
      // show menu
      document.getElementById('screen-menu').classList.add('active');
      document.getElementById('screen-menu').style.opacity = '0';
      gsap.to('#screen-menu', { opacity: 1, duration: 0.5, ease: 'power2.out' });
      currentScreen = 'menu';
      updateMusicLabel('menu');
      animateMenuCards();
      startChatBubble();
    }});
  };
}

function startIntroPhase() {
  document.getElementById('phase-intro').style.display = 'flex';
  document.getElementById('phase-birthday').style.display = 'none';

  const heyText = LANDING.heyText.replace('{name}', LANDING.recipientName);
  const heyTarget = document.getElementById('hey-type-target');
  typeText(heyTarget, heyText);

  const allQuotes = [...LANDING.loveQuotes, ...LANDING.afterQuotes];
  let quoteIndex = 0;
  const quoteTarget = document.getElementById('quote-type-target');

  const heyWords = heyText.split(' ').length;
  const heyTypingDuration = heyWords * 80 + heyText.length * 20 + 600;

  setTimeout(() => {
    document.getElementById('landing-typing-3').style.display = 'flex';
    typeNextQuote();
  }, heyTypingDuration);

  function typeNextQuote() {
    if (quoteIndex >= allQuotes.length) {
      setTimeout(() => transitionToBirthday(), 1500);
      return;
    }
    typeText(quoteTarget, allQuotes[quoteIndex]);
    quoteIndex++;
    const w = allQuotes[quoteIndex - 1].split(' ').length;
    const c = allQuotes[quoteIndex - 1].length;
    const duration = w * 80 + c * 20 + 1200;
    setTimeout(typeNextQuote, duration);
  }
}

function transitionToBirthday() {
  const intro = document.getElementById('phase-intro');
  const birthday = document.getElementById('phase-birthday');

  birthday.style.display = 'flex';

  // burst covers the switch
  launchConfetti(60, { spread: 200, origin: { x: 0.5, y: 0.4 } });

  const tl = gsap.timeline();
  // fade + slide out intro
  tl.to(intro, { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in', onComplete: () => { intro.style.display = 'none'; } })
    // slight pause for confetti to be visible
    .to({}, { duration: 0.2 })
    // slide birthday in from below
    .fromTo(birthday, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    .call(() => startBirthdaySequence(), null, '+=0.1');
}

function startBirthdaySequence() {
  const name = LANDING.recipientName;
  document.getElementById('birthday-title').textContent = 'Happy Birthday,';
  document.getElementById('birthday-name').textContent = name + '!';

  launchHearts(40);

  const msg = LANDING.birthdayMessage.replace('{name}', name);
  const msgWords = msg.split(' ').length;
  const msgTypingMs = msgWords * 80 + msg.length * 20 + 400;

  const tl = gsap.timeline();
  tl.to('#birthday-title', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' })
    .to('#birthday-name', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.2')
    .call(() => {
      launchConfetti(150, { spread: 360, origin: { x: 0.5, y: 0.2 } });
      launchConfetti(100, { spread: 180, origin: { x: 0.2, y: 0.3 } });
      launchConfetti(100, { spread: 180, origin: { x: 0.8, y: 0.3 } });
      launchHearts(30);
    }, null, '-=0.3')
    .call(() => {
      const msgTarget = document.getElementById('birthday-msg-target');
      gsap.to(msgTarget, { opacity: 1, duration: 0.3 });
      typeText(msgTarget, msg);
    }, null, '+=0.3');

  const totalTypingStart = tl.totalDuration() * 1000 + 100;
  setTimeout(() => {
    const btn = document.getElementById('landing-cta-btn');
    if (!btn) return;
    btn.style.display = 'inline-block';
    gsap.fromTo(btn, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' });
  }, totalTypingStart + msgTypingMs);
}

// ============================================================
// REPLAY STORY
// ============================================================
function replayLanding() {
  const menu = document.getElementById('screen-menu');
  const landing = document.getElementById('screen-landing');

  // kill any lingering GSAP tweens on both elements
  gsap.killTweensOf(menu);
  gsap.killTweensOf(landing);

  // reset menu
  menu.classList.remove('active');
  menu.style.opacity = '';
  menu.style.pointerEvents = '';

  // reset & show landing
  landing.classList.add('active');
  landing.style.opacity = '';
  landing.style.display = '';

  // reset landing state
  landingCountdownOver = true;
  landingActive = false;
  if (landingMsgInterval) { clearInterval(landingMsgInterval); landingMsgInterval = null; }

  // show phase 1, hide others
  document.getElementById('phase-countdown').style.display = 'flex';
  document.getElementById('phase-intro').style.display = 'none';
  document.getElementById('phase-birthday').style.display = 'none';

  // cleanup leftover typing
  document.getElementById('hey-type-target').innerHTML = '';
  document.getElementById('quote-type-target').innerHTML = '';
  document.getElementById('birthday-msg-target').innerHTML = '';
  document.getElementById('birthday-msg-target').style.opacity = '0';

  // skip in replay
  document.getElementById('landing-skip').style.display = 'none';
  document.getElementById('skip-overlay').classList.remove('open');

  // set countdown display
  document.getElementById('countdown-type-target').textContent = 'The moment has arrived… ✨';
  ['lcd-days','lcd-hours','lcd-mins','lcd-secs'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '00';
  });

  // show enter button
  const enterBtn = document.getElementById('landing-enter-btn');
  enterBtn.style.display = 'inline-block';
  gsap.fromTo(enterBtn, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' });

  // reset CTA button
  const ctaBtn = document.getElementById('landing-cta-btn');
  ctaBtn.style.display = 'none';
  gsap.set(ctaBtn, { clearProps: 'all' });

  currentScreen = 'landing';
  updateMusicLabel('landing');

  // retarget enter button
  enterBtn.onclick = () => {
    gsap.to('#phase-countdown', { opacity: 0, duration: 0.5, onComplete: () => {
      document.getElementById('phase-countdown').style.display = 'none';
      startIntroPhase();
    }});
  };

  // retarget CTA button
  ctaBtn.onclick = () => {
    gsap.to('#screen-landing', { opacity: 0, duration: 0.6, onComplete: () => {
      landing.classList.remove('active');
      landing.style.opacity = '';
      heartsPieces = [];
      heartsRunning = false;
      menu.classList.add('active');
      menu.style.opacity = '0';
      gsap.to(menu, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      currentScreen = 'menu';
      updateMusicLabel('menu');
    }});
  };
}

// ============================================================
// MENU CARDS ANIMATION
// ============================================================
function animateMenuCards() {
  const cards = document.querySelectorAll('.bento-card');
  gsap.fromTo(cards, { opacity: 0, y: 50, scale: 0.85, rotation: -2, force3D: true }, {
    opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.6, stagger: 0.09, ease: 'back.out(1.7)', force3D: true
  });
  cards.forEach(card => {
    const glow = card.querySelector('.sparkle-glow');
    if (!glow) return;
    card.addEventListener('mousemove', function (e) {
      const r = this.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      glow.style.setProperty('--mx', x + '%');
      glow.style.setProperty('--my', y + '%');
      glow.style.opacity = '1';
    });
    card.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
  });
}

function navigateTo(section) {
  if (isTransitioning) return;
  if (section === 'menu') { showScreen('menu'); return; }
  if (section === 'ending') { showEnding(); return; }
  if (section === 'replay') { replayLanding(); return; }
  const map = { stories: 'stories', album: 'album', journey: 'journey', postcard: 'postcard', secret: 'secret', surprise: 'surprise', daily: 'daily', wish: 'wish' };
  const id = map[section];
  if (!id) return;
  showScreen(id);
}

// ============================================================
// SURPRISE BOX
// ============================================================
let surpriseInit = false;
let lastSurpriseIndex = -1;

function initSurpriseBox() {
  if (surpriseInit) return;
  surpriseInit = true;
  const container = document.getElementById('surpriseBento');
  container.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('div');
    box.className = 's-card';
    box.dataset.idx = i;
    box.innerHTML = `<div class="s-icon">${['🎁','🎀','🎊','🎉','💝','✨'][i]}</div><div class="s-label">Surprise ${i+1}</div>`;
    box.addEventListener('click', function () { openSurprise(parseInt(this.dataset.idx)); });
    container.appendChild(box);
  }
  gsap.fromTo('.s-card', { opacity: 0, y: 20, scale: 0.9, force3D: true }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(1.7)', force3D: true });
}

function openSurprise() {
  const items = CONFIG.surprises;
  let pick;
  do { pick = Math.floor(Math.random() * items.length); } while (pick === lastSurpriseIndex && items.length > 1);
  lastSurpriseIndex = pick;
  const item = items[pick];
  const overlay = document.getElementById('surpriseOverlay');
  document.getElementById('surpriseIcon').textContent = item.icon;
  document.getElementById('surpriseTitle').textContent = item.title;
  document.getElementById('surpriseBody').textContent = item.body;
  overlay.classList.add('open');
  launchConfetti(60, { spread: 120, origin: { x: 0.5, y: 0.4 } });
}

// ============================================================
// DAILY LOVE NOTES
// ============================================================
let dailyInit = false;

function initDailyNotes() {
  if (dailyInit) return;
  dailyInit = true;
  const notes = CONFIG.dailyNotes;
  const grid = document.getElementById('dailyGrid');
  grid.innerHTML = '';
  try { const saved = localStorage.getItem('dailyNotesUnlocked'); if (saved) dailyUnlocked = JSON.parse(saved); } catch (_) { }
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today - startOfYear) / 864e5);
  const maxUnlock = Math.min(dayOfYear, 27);
  notes.forEach((note, idx) => {
    const div = document.createElement('div');
    div.className = 'daily-note';
    const isUnlocked = idx < maxUnlock || dailyUnlocked[idx];
    if (isUnlocked) { div.classList.add('unlocked'); } else { div.classList.add('locked'); }
    div.dataset.idx = idx;
    div.innerHTML = `<div class="day-num">${String(idx+1).padStart(2,'0')}</div><div class="day-label">day ${idx+1}</div><div class="note-preview">${isUnlocked ? note.substring(0,30)+'…' : '🔒'}</div>${!isUnlocked ? '<div class="lock-icon-small">🔒</div>' : ''}`;
    if (isUnlocked) { div.addEventListener('click', function () { showNoteDetail(idx, note); }); } else { div.style.cursor = 'not-allowed'; }
    grid.appendChild(div);
  });
  gsap.fromTo('.daily-note', { opacity: 0, scale: 0.8, force3D: true }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.03, ease: 'back.out(1.7)', force3D: true });
}

function showNoteDetail(idx, text) {
  const overlay = document.getElementById('surpriseOverlay');
  document.getElementById('surpriseIcon').textContent = '📅';
  document.getElementById('surpriseTitle').textContent = 'Day ' + (idx + 1);
  document.getElementById('surpriseBody').textContent = text;
  overlay.classList.add('open');
}

// ============================================================
// WISH WALL
// ============================================================
let wishInit = false;

function initWishWall() {
  if (wishInit) return;
  wishInit = true;
  loadWishes();
  document.getElementById('wishSubmit').addEventListener('click', addWish);
  document.getElementById('wishInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') addWish(); });
}

function loadWishes() { try { const saved = localStorage.getItem('birthdayWishes'); if (saved) wishList = JSON.parse(saved); } catch (_) { wishList = []; } renderWishes(); }
function saveWishes() { try { localStorage.setItem('birthdayWishes', JSON.stringify(wishList)); } catch (_) { } }

function addWish() {
  const input = document.getElementById('wishInput');
  const text = input.value.trim();
  if (!text || text.length > 120) return;
  wishList.push({ text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: ['⭐','🌈','💖','✨','🌸','🌟','💫','🎀'][Math.floor(Math.random()*8)] });
  input.value = ''; saveWishes(); renderWishes();
  launchConfetti(40, { spread: 90, origin: { x: 0.5, y: 0.5 } });
}

function renderWishes() {
  const list = document.getElementById('wishList');
  list.innerHTML = '';
  wishList.forEach((w, idx) => {
    const div = document.createElement('div');
    div.className = 'wish-item';
    div.innerHTML = `<span class="wish-icon">${w.icon}</span><span class="wish-text">${w.text}</span><span class="wish-time">${w.time}</span><button class="wish-delete" data-idx="${idx}">✕</button>`;
    div.querySelector('.wish-delete').addEventListener('click', function () { wishList.splice(parseInt(this.dataset.idx), 1); saveWishes(); renderWishes(); });
    list.appendChild(div);
  });
  if (wishList.length === 0) list.innerHTML = '<div style="text-align:center;padding:30px;color:#b08bb0;font-family:var(--font-hand);font-size:18px;">✨ Make your first wish… ✨</div>';
  gsap.fromTo('.wish-item', { opacity: 0, x: -20, force3D: true }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', force3D: true });
}

// ============================================================
// STORIES
// ============================================================
let storiesInit = false;

function initStories() {
  if (storiesInit) return;
  storiesInit = true;
  const data = CONFIG.stories;
  const scroll = document.getElementById('stories-scroll');
  scroll.innerHTML = '';
  data.forEach((item, idx) => {
    const frame = document.createElement('div');
    frame.className = 'story-frame';
    frame.style.transform = 'rotate(' + (Math.random()*2-1) + 'deg)';
    const quote = document.createElement('div'); quote.className = 'story-quote type-quote';
    frame.appendChild(quote);
    const hiddenDiv = document.createElement('div'); hiddenDiv.className = 'story-hidden';
    const p = document.createElement('p'); p.textContent = item.hidden;
    hiddenDiv.appendChild(p); frame.appendChild(hiddenDiv);
    const tag = document.createElement('span'); tag.className = 'story-tag'; tag.textContent = item.tag;
    frame.appendChild(tag);
    const sticker = document.createElement('span'); sticker.className = 'story-sticker'; sticker.textContent = item.emoji;
    frame.appendChild(sticker);
    const reactions = document.createElement('div'); reactions.className = 'story-reactions';
    ['💕','✨','😊'].forEach((emoji, ri) => {
      const btn = document.createElement('button');
      const key = 'story-'+idx+'-'+ri; reactionCounts[key] = 0;
      btn.innerHTML = emoji + ' <span class="reaction-count" data-key="'+key+'">0</span>';
      btn.addEventListener('click', function(e){e.stopPropagation(); reactionCounts[key]++; this.querySelector('.reaction-count').textContent = reactionCounts[key]; gsap.fromTo(this,{scale:1},{scale:1.3,duration:0.2,ease:'back.out(2)',onComplete:function(){gsap.to(this,{scale:1,duration:0.2,ease:'power2.out'});}}); spawnFloatingHeart(this);});
      reactions.appendChild(btn);
    });
    frame.appendChild(reactions);
    frame.addEventListener('click',function(e){if(e.target.closest('.story-reactions'))return; const h=this.querySelector('.story-hidden'); h.classList.toggle('reveal'); gsap.to(this,{scale:0.98,duration:0.1,onComplete:function(){gsap.to(this,{scale:1,duration:0.25,ease:'back.out(2)'});}});});
    scroll.appendChild(frame);
    setTimeout(()=>{typeQuote(quote, item.quote);}, idx*300);
  });
  gsap.fromTo('.story-frame',{opacity:0,y:30,scale:0.95,force3D:true},{opacity:1,y:0,scale:1,duration:0.5,stagger:0.07,ease:'back.out(1.4)',force3D:true,scrollTrigger:{trigger:'#stories-scroll',start:'top 85%',once:true}});
}

function typeQuote(el, text) {
  el.innerHTML = '';
  text.split('').forEach((ch,i)=>{const span=document.createElement('span'); span.className='char'; span.textContent=ch===' '?'\u00A0':ch; el.appendChild(span); gsap.set(span,{opacity:0}); gsap.to(span,{opacity:1,duration:0.02,delay:i*0.035,onStart:function(){span.classList.add('show');}});});
}

function spawnFloatingHeart(btn) {
  const rect = btn.getBoundingClientRect();
  const heart = document.createElement('span'); heart.textContent = '💕';
  gsap.set(heart,{position:'fixed',left:rect.left+rect.width/2,top:rect.top,fontSize:20,pointerEvents:'none',zIndex:9999});
  document.body.appendChild(heart);
  gsap.to(heart,{y:-80-Math.random()*40,x:-20+Math.random()*40,opacity:0,scale:0.3,duration:1.2,ease:'power3.out',onComplete:function(){heart.remove();}});
}

// ============================================================
// ALBUM
// ============================================================
let albumInit = false;

function initAlbum() {
  if (albumInit) return;
  albumInit = true;
  const data = CONFIG.albumFrames;
  const wall = document.getElementById('album-wall');
  wall.innerHTML = '';
  const spotlight = document.getElementById('album-spotlight');
  document.addEventListener('mousemove', function(e){spotlight.style.opacity='1';spotlight.style.left=e.clientX+'px';spotlight.style.top=e.clientY+'px';});
  document.addEventListener('mouseleave',function(){spotlight.style.opacity='0';});
  document.addEventListener('touchmove',function(e){const t=e.touches[0];spotlight.style.opacity='1';spotlight.style.left=t.clientX+'px';spotlight.style.top=t.clientY+'px';},{passive:true});
  let row=document.createElement('div'); row.className='album-row'; let cnt=0;
  data.forEach((item, idx)=>{
    const frame=document.createElement('div'); frame.className='album-frame '+item.size+' '+(item.tilt||'');
    frame.style.transform+=' rotate('+(Math.random()*3-1.5)+'deg)';
    const imgDiv=document.createElement('div'); imgDiv.className='frame-img'; imgDiv.textContent=item.emoji;
    if(idx%3===0){const ov=document.createElement('div');ov.className='play-overlay';ov.textContent='▶';imgDiv.appendChild(ov);}
    frame.appendChild(imgDiv);
    const cap=document.createElement('div');cap.className='frame-caption';cap.textContent=item.caption;frame.appendChild(cap);
    const lb=document.createElement('div');lb.className='frame-label';lb.textContent=item.label;frame.appendChild(lb);
    const tilt={x:0,y:0};
    const u=function(){gsap.set(frame,{rotationX:tilt.y*2,rotationY:tilt.x*2,transformPerspective:800,force3D:true});};
    frame.addEventListener('mousemove',function(e){const r=this.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;gsap.to(tilt,{x:x*16,y:-y*16,duration:0.3,ease:'power2.out',onUpdate:u});});
    frame.addEventListener('mouseleave',function(){gsap.to(tilt,{x:0,y:0,duration:0.5,ease:'power2.out',onUpdate:u});});
    frame.addEventListener('click',function(){gsap.to(this,{scale:1.05,duration:0.3,ease:'back.out(2)',onComplete:function(){gsap.to(this,{scale:1,duration:0.3,ease:'power2.out'});}});const c=this.querySelector('.frame-caption');gsap.fromTo(c,{opacity:0.4},{opacity:1,duration:0.4,ease:'power2.out'});const r=this.getBoundingClientRect();launchConfetti(20,{spread:60,origin:{x:(r.left+r.width/2)/window.innerWidth,y:(r.top+r.height/2)/window.innerHeight}});});
    row.appendChild(frame); cnt++;
    if(cnt>=3||idx===data.length-1){wall.appendChild(row);row=document.createElement('div');row.className='album-row';cnt=0;}
  });
  gsap.fromTo('.album-frame',{opacity:0,y:20,scale:0.9,force3D:true},{opacity:1,y:0,scale:1,duration:0.4,stagger:0.04,ease:'back.out(1.7)',force3D:true,scrollTrigger:{trigger:'#album-wall',start:'top 85%',once:true}});
}

// ============================================================
// JOURNEY
// ============================================================
let journeyInit = false;

function initJourney() {
  if (journeyInit) return;
  journeyInit = true;
  const data = CONFIG.journeyMilestones;
  const path = document.getElementById('journey-path');
  path.innerHTML = '';
  data.forEach((item, idx) => {
    const tile = document.createElement('div'); tile.className = 'journey-tile'+(idx===0?' active-tile':''); tile.dataset.idx=idx;
    tile.style.transform='translateX('+(idx%2===0?0:8)+'px)';
    const head=document.createElement('div');head.className='tile-head';
    const icon=document.createElement('span');icon.className='tile-icon';icon.textContent=item.icon;head.appendChild(icon);
    const info=document.createElement('div');info.className='tile-info';
    const title=document.createElement('div');title.className='tile-title';title.textContent=item.title;info.appendChild(title);
    const date=document.createElement('div');date.className='tile-date';date.textContent=item.date;info.appendChild(date);
    head.appendChild(info);tile.appendChild(head);
    const q=document.createElement('div');q.className='tile-quote';q.textContent='"'+item.quote+'"';tile.appendChild(q);
    const mg=document.createElement('div');mg.className='tile-mini-game';mg.dataset.gameType=item.gameType;mg.innerHTML='<span style="font-size:13px;opacity:0.6;">✦ interact ✦</span>';tile.appendChild(mg);
    path.appendChild(tile);
  });
  const m=document.createElement('div');m.className='journey-marker';m.id='journey-marker';m.textContent='💖';path.appendChild(m);
  updateJourney(0);
  document.getElementById('journey-prev').addEventListener('click',function(){if(journeyIndex>0){journeyIndex--;updateJourney(journeyIndex);}});
  document.getElementById('journey-next').addEventListener('click',function(){if(journeyIndex<CONFIG.journeyMilestones.length-1){journeyIndex++;updateJourney(journeyIndex);}else{launchConfetti(100,{spread:360,origin:{x:0.5,y:0.5}});gsap.to('#journey-marker',{scale:1.5,duration:0.5,ease:'back.out(3)',yoyo:true,repeat:1});}});
  gsap.fromTo('.journey-tile',{opacity:0,x:-20,force3D:true},{opacity:1,x:0,duration:0.4,stagger:0.06,ease:'power2.out',force3D:true,scrollTrigger:{trigger:'#journey-path',start:'top 85%',once:true}});
}

function updateJourney(idx) {
  const tiles=document.querySelectorAll('.journey-tile');
  tiles.forEach((t,i)=>{t.classList.toggle('active-tile',i===idx);gsap.to(t,{scale:i===idx?1.02:1,duration:0.3,ease:'back.out(2)',force3D:true});});
  const at=tiles[idx];
  if(at){const o=at.offsetTop+at.offsetHeight/2;const mk=document.getElementById('journey-marker');gsap.to(mk,{top:o-16,duration:0.5,ease:'power3.out',overwrite:'auto'});gsap.to(mk,{scale:1.3,duration:0.3,ease:'back.out(3)',yoyo:true,repeat:1});}
  document.getElementById('journey-prev').disabled=idx===0;
  const nb=document.getElementById('journey-next');nb.disabled=idx===CONFIG.journeyMilestones.length-1;nb.textContent=idx===CONFIG.journeyMilestones.length-1?'🎉 Celebrate!':'Next Step →';
  initMiniGame(idx);
}

function initMiniGame(idx) {
  const tile=document.querySelector('.journey-tile[data-idx="'+idx+'"]');if(!tile)return;
  const mg=tile.querySelector('.tile-mini-game');const type=mg.dataset.gameType;const item=CONFIG.journeyMilestones[idx];mg.innerHTML='';mg.style.gap='8px';
  switch(type){
    case'pop':mg.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;"><span class="mg-balloon" style="font-size:32px;cursor:pointer;">🎈</span><span class="mg-balloon" style="font-size:32px;cursor:pointer;">🎈</span><span class="mg-balloon" style="font-size:32px;cursor:pointer;">🎈</span></div><div class="mg-text-reveal">💕 '+item.quote+'</div>';mg.querySelectorAll('.mg-balloon').forEach(el=>{el.addEventListener('click',function(){gsap.to(this,{scale:1.5,opacity:0,duration:0.3,ease:'back.in(2)',onComplete:function(){this.remove();}});mg.querySelector('.mg-text-reveal').classList.add('show');launchConfetti(30,{spread:60,origin:{x:(tile.getBoundingClientRect().left+tile.getBoundingClientRect().width/2)/window.innerWidth,y:tile.getBoundingClientRect().top/window.innerHeight}});});});break;
    case'hold':{const star=document.createElement('span');star.textContent='⭐';star.style.cssText='font-size:40px;cursor:pointer;';mg.appendChild(star);const rv=document.createElement('div');rv.className='mg-text-reveal';rv.textContent='✨ '+item.quote;mg.appendChild(rv);let ht;star.addEventListener('pointerdown',function(){ht=setTimeout(()=>{rv.classList.add('show');launchConfetti(40,{spread:90,origin:{x:(tile.getBoundingClientRect().left+tile.getBoundingClientRect().width/2)/window.innerWidth,y:tile.getBoundingClientRect().top/window.innerHeight}});gsap.to(star,{scale:1.3,duration:0.3,ease:'back.out(2)'});},600);});star.addEventListener('pointerup',function(){clearTimeout(ht);});star.addEventListener('pointerleave',function(){clearTimeout(ht);});break;}
    case'connect':mg.innerHTML='<div style="display:flex;gap:12px;align-items:center;"><span class="mg-heart" style="font-size:28px;cursor:pointer;">💗</span><span style="font-size:16px;opacity:0.3;">+</span><span class="mg-heart" style="font-size:28px;cursor:pointer;">💗</span></div><div class="mg-text-reveal">💞 '+item.quote+'</div>';let cn=0;mg.querySelectorAll('.mg-heart').forEach(el=>{el.addEventListener('click',function(){cn++;gsap.to(this,{scale:1.5,duration:0.3,ease:'back.out(2)',yoyo:true,repeat:1});if(cn>=2){mg.querySelector('.mg-text-reveal').classList.add('show');launchConfetti(50,{spread:120,origin:{x:(tile.getBoundingClientRect().left+tile.getBoundingClientRect().width/2)/window.innerWidth,y:tile.getBoundingClientRect().top/window.innerHeight}});}});});break;
    case'reveal':mg.innerHTML='<button class="mg-btn">🎂 Open Gift</button><div class="mg-text-reveal">🎉 '+item.quote+'</div>';mg.querySelector('.mg-btn').addEventListener('click',function(){mg.querySelector('.mg-text-reveal').classList.add('show');launchConfetti(80,{spread:180,origin:{x:0.5,y:0.4}});gsap.to(this,{scale:0.8,opacity:0,duration:0.3});});break;
    case'drag':mg.innerHTML='<div style="font-size:13px;opacity:0.6;text-align:center;">☁️ drag the cloud away ☁️</div><div class="mg-cloud" style="font-size:48px;cursor:grab;user-select:none;touch-action:none;">☁️</div><div class="mg-text-reveal">☀️ '+item.quote+'</div>';const cloud=mg.querySelector('.mg-cloud');let dsx,dsy,drg=false;cloud.addEventListener('pointerdown',function(e){drg=true;dsx=e.clientX;dsy=e.clientY;this.setPointerCapture(e.pointerId);});cloud.addEventListener('pointermove',function(e){if(!drg)return;const dx=e.clientX-dsx,dy=e.clientY-dsy;gsap.to(this,{x:dx,y:dy,opacity:1-Math.abs(dx)/200,duration:0.1,ease:'none'});if(Math.abs(dx)>80){drg=false;gsap.to(this,{opacity:0,scale:0.5,duration:0.3,onComplete:function(){this.remove();}});mg.querySelector('.mg-text-reveal').classList.add('show');launchConfetti(40,{spread:90,origin:{x:(tile.getBoundingClientRect().left+tile.getBoundingClientRect().width/2)/window.innerWidth,y:tile.getBoundingClientRect().top/window.innerHeight}});}});cloud.addEventListener('pointerup',function(){drg=false;});cloud.addEventListener('pointercancel',function(){drg=false;});break;
  }
}

// ============================================================
// POST CARD
// ============================================================
let postcardInit = false;

function initPostcard() {
  if (postcardInit) return;
  postcardInit = true;
  const data = CONFIG.postcards;
  const deco = document.getElementById('postcard-deco-frames'); deco.innerHTML = '';
  data.forEach((item, idx) => {
    const f = document.createElement('div'); f.className = 'mini-frame'; f.style.setProperty('--rot', item.rot + 'deg'); f.textContent = item.emoji;
    const c = document.createElement('span'); c.className = 'mini-caption'; c.textContent = item.caption; f.appendChild(c);
    f.addEventListener('click', function (e) { e.stopPropagation(); switchPostcard(idx); }); deco.appendChild(f);
  });
  switchPostcard(0);
  document.getElementById('postcard-main').addEventListener('click', function () {
    if (isLetterRevealed) return; isLetterRevealed = true; this.classList.add('flipped');
    const ct = document.getElementById('letter-text'); const tx = data[currentPostcardIdx].letter; ct.innerHTML = '';
    tx.split('').forEach((ch, i) => { if (ch === '\n') { ct.appendChild(document.createElement('br')); return; } const s = document.createElement('span'); s.className = 'char'; s.textContent = ch === ' ' ? '\u00A0' : ch; ct.appendChild(s); gsap.set(s, { opacity: 0 }); gsap.to(s, { opacity: 1, duration: 0.02, delay: 0.3 + i * 0.025, onStart: function () { s.classList.add('show'); } }); });
    for (let i = 0; i < 12; i++) { gsap.to({}, { delay: i * 0.15, onStart: function () { const h = document.createElement('span'); h.textContent = ['💕','♥','💗','✨'][Math.floor(Math.random()*4)]; gsap.set(h, { position: 'absolute', pointerEvents: 'none', fontSize: 16, left: 20+Math.random()*60+'%', top: 20+Math.random()*60+'%', zIndex: 6 }); this.appendChild(h); gsap.to(h, { y: -60-Math.random()*40, x: -20+Math.random()*40, opacity: 0, scale: 0.3, duration: 1.5+Math.random(), ease: 'power3.out', onComplete: function () { h.remove(); } }); }.bind(this) }); }
    launchConfetti(60, { spread: 180, origin: { x: 0.5, y: 0.3 } });
  });
}

function switchPostcard(idx) {
  if (idx === currentPostcardIdx && isLetterRevealed) { const m = document.getElementById('postcard-main'); if (m.classList.contains('flipped')) { m.classList.remove('flipped'); isLetterRevealed = false; } return; }
  currentPostcardIdx = idx; const d = CONFIG.postcards[idx];
  document.getElementById('postcard-icon').textContent = d.frontIcon; document.getElementById('postcard-label').textContent = d.frontLabel;
  const m = document.getElementById('postcard-main'); m.classList.remove('flipped'); isLetterRevealed = false; document.getElementById('letter-text').innerHTML = '';
  gsap.fromTo(m, { scale: 0.96, force3D: true }, { scale: 1, duration: 0.4, ease: 'back.out(2)', force3D: true });
  document.querySelectorAll('.mini-frame').forEach((el, i) => { gsap.to(el, { borderColor: i === idx ? 'rgba(255,107,157,0.5)' : 'rgba(255,255,255,0.4)', boxShadow: i === idx ? '0 0 0 2px rgba(255,107,157,0.2)' : 'none', duration: 0.3 }); });
}

// ============================================================
// SECRET
// ============================================================
let secretInit = false;
let scratchCtx, scratchW, scratchH, isScratching = false;

function initSecret() {
  if (secretInit) return;
  secretInit = true;
  const tu = function () { const v = document.getElementById('lock-input').value.trim().toLowerCase(); if (v === CONFIG.password) { unlockSecret(); } else { document.getElementById('lock-hint').classList.add('show'); gsap.fromTo('#lock-hint', { opacity: 0 }, { opacity: 1, duration: 0.4 }); gsap.fromTo('#secret-lock .lock-icon', { scale: 1 }, { scale: 1.2, duration: 0.2, ease: 'back.out(2)', yoyo: true, repeat: 1 }); } };
  document.getElementById('lock-btn').addEventListener('click', tu);
  document.getElementById('lock-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') tu(); });
}

function unlockSecret() {
  if (isUnlocked) return;
  isUnlocked = true;
  document.getElementById('lock-hint').classList.remove('show');
  gsap.to('#secret-lock', { opacity: 0, scale: 0.9, duration: 0.4, ease: 'power2.in', onComplete: function () { document.getElementById('secret-lock').style.display = 'none'; document.getElementById('secret-gallery').classList.add('unlocked'); gsap.fromTo('#secret-gallery', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }); populateSecretGallery(); initScratch(); launchConfetti(120, { spread: 360, origin: { x: 0.5, y: 0.4 } }); launchConfetti(80, { spread: 180, origin: { x: 0.3, y: 0.3 } }); launchConfetti(80, { spread: 180, origin: { x: 0.7, y: 0.3 } }); } });
}

function populateSecretGallery() {
  const s = document.getElementById('gallery-scatter'); s.innerHTML = '';
  const e = ['📸','🌅','🌸','☕','🌙','🎵','✨','💕','🌟','🎂','💫','🌈'];
  const r = [-3,4,-2,5,-4,3,-1,6,-5,2,-3,4];
  for (let i = 0; i < 12; i++) { const f = document.createElement('div'); f.className = 'scatter-frame'; f.style.setProperty('--rot', (r[i%r.length]+Math.random()*2-1)+'deg'); const fl = document.createElement('div'); fl.className = 'frame-fill'; fl.textContent = e[i%e.length]; f.appendChild(fl); if (i%3===0) { const t = document.createElement('div'); t.className = 'tape'; f.appendChild(t); } f.addEventListener('click', function () { gsap.to(this, { scale: 1.15, duration: 0.3, ease: 'back.out(2)', onComplete: function () { gsap.to(this, { scale: 1, duration: 0.2, ease: 'power2.out' }); } }); const r = this.getBoundingClientRect(); launchConfetti(20, { spread: 60, origin: { x: (r.left+r.width/2)/window.innerWidth, y: (r.top+r.height/2)/window.innerHeight } }); }); s.appendChild(f); }
  gsap.fromTo('.scatter-frame',{opacity:0,scale:0.7,rotation:10,force3D:true},{opacity:1,scale:1,rotation:0,duration:0.4,stagger:0.03,ease:'back.out(1.7)',force3D:true});
}

function initScratch() {
  const c = document.getElementById('scratch-canvas'); const p = c.parentElement; const r = p.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
  scratchW = r.width; scratchH = r.height; c.width = scratchW * dpr; c.height = scratchH * dpr; c.style.width = scratchW + 'px'; c.style.height = scratchH + 'px';
  scratchCtx = c.getContext('2d'); scratchCtx.scale(dpr, dpr); scratchCtx.fillStyle = '#e8dce0'; scratchCtx.fillRect(0, 0, scratchW, scratchH);
  scratchCtx.fillStyle = 'rgba(200,180,185,0.2)'; for (let i = 0; i < 40; i++) { scratchCtx.beginPath(); scratchCtx.arc(Math.random()*scratchW, Math.random()*scratchH, 2+Math.random()*6, 0, Math.PI*2); scratchCtx.fill(); }
  scratchCtx.fillStyle = 'rgba(255,107,157,0.08)'; scratchCtx.font = '40px serif'; scratchCtx.textAlign = 'center'; scratchCtx.fillText('✨', scratchW/2, scratchH/2+10);
  scratchPercent = 0; scratchRevealed = false; document.getElementById('scratch-reveal').classList.remove('show'); document.getElementById('scratch-progress').textContent = '0% revealed';
  const pr = document.getElementById('scratch-progress');
  const gp = function (e) { const r = c.getBoundingClientRect(); return { x: (e.touches?e.touches[0].clientX:e.clientX)-r.left, y: (e.touches?e.touches[0].clientY:e.clientY)-r.top }; };
  const sc = function (pos) { if (!scratchCtx) return; scratchCtx.globalCompositeOperation = 'destination-out'; scratchCtx.beginPath(); scratchCtx.arc(pos.x, pos.y, 22, 0, Math.PI*2); scratchCtx.fill(); scratchCtx.globalCompositeOperation = 'source-over'; const id = scratchCtx.getImageData(0, 0, scratchW, scratchH); let tr = 0; for (let i = 3; i < id.data.length; i += 4) { if (id.data[i] < 128) tr++; } const pct = Math.round((tr/(id.data.length/4))*100); scratchPercent = pct; pr.textContent = pct+'% revealed'; if (pct > 0 && pct % 10 === 0) { gsap.fromTo(pr, { scale: 1.2 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' }); } if (pct >= 70 && !scratchRevealed) { scratchRevealed = true; document.getElementById('scratch-reveal').classList.add('show'); launchConfetti(100,{spread:360,origin:{x:0.5,y:0.5}});launchConfetti(80,{spread:180,origin:{x:0.3,y:0.4}});launchConfetti(80,{spread:180,origin:{x:0.7,y:0.4}});setTimeout(()=>{showEnding();},2000); } };
  c.onpointerdown = function (e) { isScratching = true; sc(gp(e)); }; c.onpointermove = function (e) { if (isScratching) sc(gp(e)); }; c.onpointerup = function () { isScratching = false; }; c.onpointercancel = function () { isScratching = false; };
}

// ============================================================
// ENDING
// ============================================================
function showEnding() {
  showScreen('ending');
  const et = document.getElementById('ending-title'), es = document.getElementById('ending-sub'), eb = document.getElementById('ending-btns');
  gsap.set([et, es, eb], { opacity: 0 });
  const fl = document.getElementById('ending-floating'); fl.innerHTML = '';
  const emojis = ['🎈','🎉','💖','✨','🌟','🎊','💕','🌸','⭐','♥'];
  for (let i = 0; i < 20; i++) { const el = document.createElement('span'); el.textContent = emojis[i%10]; el.style.left = (Math.random()*90+5)+'%'; el.style.animationDelay = (Math.random()*4)+'s'; el.style.animationDuration = (5+Math.random()*4)+'s'; el.style.fontSize = (18+Math.random()*24)+'px'; fl.appendChild(el); }
  const tl = gsap.timeline();
  tl.to(et,{opacity:1,y:0,duration:0.8,ease:'power3.out'}).to(es,{opacity:1,y:0,duration:0.6,ease:'power2.out'},'-=0.3').to(eb,{opacity:1,duration:0.4,ease:'power2.out'},'-=0.2');
  launchConfetti(150,{spread:360,origin:{x:0.5,y:0.3}});launchConfetti(100,{spread:180,origin:{x:0.2,y:0.4}});launchConfetti(100,{spread:180,origin:{x:0.8,y:0.4}});
  setTimeout(()=>{launchConfetti(80,{spread:360,origin:{x:0.5,y:0.2}});},800);
}

// ============================================================
// INIT
// ============================================================
initConfettiCanvas();
initParticles();
initLanding();
updateMusicLabel('landing');

// ============================================================
// BINDINGS
// ============================================================
document.querySelectorAll('.btn-back[data-back="menu"]').forEach(b => {
  b.addEventListener('click', function () { showScreen('menu'); gsap.fromTo('.bento-card', { opacity: 0, y: 20, force3D: true }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', force3D: true }); });
});
document.querySelectorAll('.bento-card').forEach(c => {
  c.addEventListener('click', function () { navigateTo(this.dataset.section); });
});
document.getElementById('btn-replay').addEventListener('click', function () { location.reload(); });
document.getElementById('btn-back-menu').addEventListener('click', function () { showScreen('menu'); gsap.fromTo('.bento-card', { opacity: 0, y: 20, force3D: true }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', force3D: true }); });
document.getElementById('musicPlayer').addEventListener('click', function () {
  const track = ASSETS.music[currentScreen];
  alert('🎵 Now playing: ' + (track ? track.label : 'Unknown') + '\n(Add real audio files to public/music/)');
});
document.getElementById('surpriseClose').addEventListener('click', function () { document.getElementById('surpriseOverlay').classList.remove('open'); });
document.getElementById('surpriseOverlay').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('open'); });

console.log('✦ Happy Birthday — made with love ✦');
