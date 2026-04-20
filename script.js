/* ─────────────────────────────────────────────
   RAJJN — Video Editor Portfolio
   script.js
───────────────────────────────────────────── */

// ─── CUSTOM CURSOR (Dot + Ring) ───
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX  = mouseX;
let ringY  = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // Dot segue istantaneamente, usando transform per evitare reflow
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});

// Ring insegue con inerzia (lerp)
function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover glow su elementi cliccabili + Hero Title Spans
const hoverTargets = 'a, button, [role="button"], input, textarea, select, label, .hero-title span';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// Movimento Parallasse Light Leaks (Hero)
const leaks = document.querySelectorAll('.leak');
let parallaxRAF = null;
document.addEventListener('mousemove', e => {
  if (parallaxRAF) cancelAnimationFrame(parallaxRAF);
  parallaxRAF = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    leaks.forEach((leak, index) => {
      const factor = (index + 1) * 0.5;
      // Usiamo translate3d hardware accelerato
      leak.style.transform = `translate3d(${x * factor}px, ${y * factor}px, 0)`;
    });
  });
});


// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  });
});

// ─── SIDE NAV: sezione attiva (Scroll Logic) ───
const sideLinks = document.querySelectorAll('.side-link');
const sections = document.querySelectorAll('section[id]');

// Caching delle posizioni delle sezioni per evitare reflow durante lo scroll
let sectionsData = [];
function calculateSections() {
  const offset = window.innerHeight / 3;
  sectionsData = Array.from(sections).map(section => ({
    id: section.getAttribute('id'),
    top: section.offsetTop - offset,
    bottom: section.offsetTop - offset + section.offsetHeight
  }));
}
window.addEventListener('load', calculateSections);
window.addEventListener('resize', calculateSections);

let scrollTimeout;
function updateActiveSection() {
  if (!sectionsData.length) calculateSections();
  
  let current = '';
  const scrollY = window.scrollY;

  sectionsData.forEach(sec => {
    if (scrollY >= sec.top && scrollY < sec.bottom) {
      current = sec.id;
    }
  });

  // Se raggiungiamo la fine della pagina, forziamo l'attiva su "contact"
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
    current = 'contact';
  }

  sideLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

// Throttle event listeners for performance
window.addEventListener('scroll', () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(updateActiveSection);
}, { passive: true });
updateActiveSection();

// ─── SCROLL REVEAL (Intersection Observer) ───
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ─── VIDEO/IMAGE MODAL ───
const modalOverlay = document.getElementById('modalOverlay');
const modalIframe  = document.getElementById('modalIframe');
const modalImage   = document.getElementById('modalImageElem');
const modalClose   = document.getElementById('modalClose');

function openModalVideo(videoUrl) {
  modalImage.style.display = 'none';
  modalIframe.style.display = 'block';
  // Ripristina l'aspect ratio 16:9 per il video
  const videoContainer = document.querySelector('.modal-video');
  videoContainer.style.paddingBottom = '56.25%';
  videoContainer.style.height = '0';
  modalIframe.style.position = 'absolute';
  
  const url = videoUrl.includes('?') ? videoUrl + '&autoplay=1' : videoUrl + '?autoplay=1';
  modalIframe.src = url;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openModalImage(imageUrl) {
  modalIframe.style.display = 'none';
  modalImage.style.display = 'block';
  // Adatta il box alle dimensioni dell'immagine senza spazi vuoti
  const videoContainer = document.querySelector('.modal-video');
  videoContainer.style.paddingBottom = '0';
  videoContainer.style.height = 'auto';
  modalImage.style.position = 'relative';
  modalImage.style.maxHeight = '85vh';
  
  modalImage.src = imageUrl;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  modalIframe.src = '';
  modalImage.src = '';
  document.body.style.overflow = '';
}

// Open modal on card click
document.querySelectorAll('.portfolio-card').forEach(card => {
  card.addEventListener('click', () => {
    const videoUrl = card.dataset.video;
    const imageUrl = card.dataset.image;
    
    if (videoUrl) {
      openModalVideo(videoUrl);
    } else if (imageUrl) {
      openModalImage(imageUrl);
    }
  });
});

// Close on button, overlay click, or ESC
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ─── PORTFOLIO FILTER ───
const filterBtns  = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    portfolioCards.forEach(card => {
      const cat = card.dataset.category;
      if (filter === 'all' || cat === filter) {
        card.classList.remove('hidden');
        // Re-trigger reveal animation
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 50);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});
// ─── HERO: trigger initial reveals on load ───
window.addEventListener('load', () => {
  document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
});

// ─── TYPEWRITER ───
(function () {
  const words = [
    'Video Editor',
    'Storyteller visivo',
    'YouTube Specialist',
    'Motion Graphics'
  ];

  const el     = document.getElementById('typedText');
  if (!el) return;

  let wordIndex  = 0;
  let charIndex  = 0;
  let deleting   = false;

  const SPEED_TYPE   = 80;   // ms per lettera in scrittura
  const SPEED_DELETE = 45;   // ms per lettera in cancellazione
  const PAUSE_AFTER  = 1800; // pausa a fine parola
  const PAUSE_BEFORE = 400;  // pausa prima di riscrivere

  function tick() {
    const current = words[wordIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Parola completata → pausa poi cancella
        deleting = true;
        setTimeout(tick, PAUSE_AFTER);
        return;
      }
      setTimeout(tick, SPEED_TYPE);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        // Cancellazione finita → prossima parola
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, PAUSE_BEFORE);
        return;
      }
      setTimeout(tick, SPEED_DELETE);
    }
  }

  // Avvia dopo l'animazione dell'hero
  setTimeout(tick, 1200);
})();

// ─── PLAYHEAD BLUR EFFECT ───
const playheadEl = document.querySelector('.hero-playhead');
const titleSpansBlur = document.querySelectorAll('.hero-title span, .hero-logo, .hero-eyebrow, .hero-typed');

function checkPlayhead() {
  if (!playheadEl || titleSpansBlur.length === 0) return;
  const playheadRect = playheadEl.getBoundingClientRect();
  
  let allFocused = true;

  titleSpansBlur.forEach(span => {
    if (span.classList.contains('focused')) return;
    allFocused = false;

    const spanRect = span.getBoundingClientRect();
    
    // Si sblocca non appena la testina tocca il bordo sinistro
    if (playheadRect.left > spanRect.left - 10) {
      span.classList.add('focused');
    }
  });
  
  // Continua a controllare finché non sono tutte a fuoco (succede solo una volta)
  if (!allFocused) {
    requestAnimationFrame(checkPlayhead);
  }
}
requestAnimationFrame(checkPlayhead);
