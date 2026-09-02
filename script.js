// ─────────────────────────────────────────────────────────────────
//  HOW TO ADD YOUR OWN PHOTOS
//  Put your image files in the SAME folder as this HTML file, then
//  list the filenames inside the "photos" array for each card.
//  Empty string "" = tap-to-upload placeholder slot.
// ─────────────────────────────────────────────────────────────────
const postsData = [
  {
    badge: 'Student Council Family',
    photos: ['src/sets.jpeg', 'src/acets.jpeg'],
    caption: 'Grateful to be part of SETS and ACETS, thank you sa tiwala',
  },
  {
    badge: 'TTEC Family',
    photos: ['src/ttc1.jpg', 'src/ttec.jpeg'],
    caption: 'Most memorable OJT experience, super babait',
  },
  {
    badge: 'TESDA PTC Family',
    photos: ['src/tesda.jpeg', 'src/marie1.jpg', 'src/marie2.jpg'],
    caption: 'Daming ganap dito HAHAHAHAHAHA',
  },
  {
    badge: 'Belen & Friends',
    photos: [ 'src/grad.JPG', 'src/gradd.JPG', 'src/group1.jpg', 'src/group.jpg', 'src/group2.jpg', 'src/group3.jpg', 'src/mau.jpg', 'src/celeste.jpg', 'src/kholyn.jpg'],
    caption: "Basta pag sinabing kasama ang Belen & Friends 'to na yun LOL",
  },
];

// Shared hidden file input — reused for each empty slot click
const sharedInput = document.createElement('input');
sharedInput.type = 'file';
sharedInput.accept = 'image/*';
sharedInput.style.display = 'none';
document.body.appendChild(sharedInput);

function fillSlot(placeholder, file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    let img = placeholder.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = 'Uploaded photo';
      placeholder.appendChild(img);
    }
    img.src = ev.target.result;
    img.onload = () => img.classList.add('loaded');
    const icon = placeholder.querySelector('.upload-icon');
    const label = placeholder.querySelector('.upload-label');
    if (icon) icon.style.display = 'none';
    if (label) label.style.display = 'none';
    placeholder.classList.remove('empty');
    placeholder.style.cursor = 'default';
  };
  reader.readAsDataURL(file);
}

function buildCard(post, index) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.style.transitionDelay = `${index * 0.05}s`;

  const numSlides = post.photos.length;

  const slidesHTML = post.photos.map((filename, i) => {
    if (filename && filename.trim() !== '') {
      return `
        <div class="slide${i === 0 ? ' active' : ''}" data-index="${i}">
          <div class="slide-placeholder">
            <img src="${filename.trim()}" alt="Photo ${i + 1}" class="loaded">
          </div>
        </div>`;
    }
    return `
      <div class="slide${i === 0 ? ' active' : ''}" data-index="${i}">
        <div class="slide-placeholder empty">
          <svg class="upload-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="12" width="40" height="30" rx="4" stroke="#8a9bb0" stroke-width="1.5"/>
            <circle cx="18" cy="22" r="4" stroke="#8a9bb0" stroke-width="1.5"/>
            <path d="M6 34 l10-10 8 8 6-6 16 14" stroke="#8a9bb0" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          </svg>
          <span class="upload-label">Tap to add photo</span>
        </div>
      </div>`;
  }).join('');

  const dotsHTML = Array.from({ length: numSlides }, (_, i) =>
    `<button class="dot${i === 0 ? ' active' : ''}" data-dot="${i}" aria-label="Slide ${i+1}"></button>`
  ).join('');

  card.innerHTML = `
    <div class="card-badge-wrap">
      <span class="card-badge">${post.badge}</span>
    </div>
    <div class="slideshow-wrap">
      ${slidesHTML}
      ${numSlides > 1 ? `
      <button class="slide-btn prev" aria-label="Previous">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="slide-btn next" aria-label="Next">
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="dots">${dotsHTML}</div>
      ` : ''}
    </div>
    <div class="caption-area">
      <div class="caption-text">${post.caption}</div>
    </div>
  `;

  // Attach click-to-upload on each empty slot individually (does NOT block nav buttons)
  card.querySelectorAll('.slide-placeholder.empty').forEach(placeholder => {
    placeholder.addEventListener('click', () => {
      sharedInput.onchange = (e) => {
        if (e.target.files[0]) fillSlot(placeholder, e.target.files[0]);
        sharedInput.value = '';
      };
      sharedInput.click();
    });
  });

  return card;
}

function initSlideshow(card, numSlides) {
  if (numSlides <= 1) return;
  const slides = card.querySelectorAll('.slide');
  const dots = card.querySelectorAll('.dot');
  const wrap = card.querySelector('.slideshow-wrap');
  let current = 0;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + numSlides) % numSlides;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  card.querySelector('.slide-btn.prev').addEventListener('click', () => goTo(current - 1));
  card.querySelector('.slide-btn.next').addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Touch + mouse swipe support
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let isHorizontal = false;

  function onDragStart(x, y) {
    startX = x;
    startY = y;
    isDragging = true;
    isHorizontal = false;
    wrap.style.cursor = 'grabbing';
  }

  function onDragMove(x, y) {
    if (!isDragging) return;
    const dx = x - startX;
    const dy = y - startY;
    if (!isHorizontal && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isHorizontal = true;
    }
  }

  function onDragEnd(x) {
    if (!isDragging) return;
    isDragging = false;
    wrap.style.cursor = 'grab';
    const dx = x - startX;
    if (isHorizontal && Math.abs(dx) > 40) {
      goTo(dx < 0 ? current + 1 : current - 1);
    }
    isHorizontal = false;
  }

  // Mouse events
  wrap.addEventListener('mousedown', (e) => { e.preventDefault(); onDragStart(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => { if (isDragging) onDragMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup', (e) => { if (isDragging) onDragEnd(e.clientX); });

  // Touch events
  wrap.addEventListener('touchstart', (e) => {
    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    onDragMove(e.touches[0].clientX, e.touches[0].clientY);
    if (isHorizontal) e.preventDefault();
  }, { passive: false });

  wrap.addEventListener('touchend', (e) => {
    onDragEnd(e.changedTouches[0].clientX);
  }, { passive: true });

  wrap.style.cursor = 'grab';
}

const container = document.getElementById('cards-container');
postsData.forEach((post, i) => {
  const card = buildCard(post, i);
  container.appendChild(card);
  initSlideshow(card, post.photos.length);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Page loader
(function () {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  const MIN_VISIBLE = 2600; // ms, so the loader doesn't just flash
  const start = Date.now();

  function revealContent() {
    // Kick off the header entrance animations and start watching
    // cards for scroll-in reveals only once the loader is gone.
    document.body.classList.add('content-ready');
    document.querySelectorAll('.post-card').forEach(c => observer.observe(c));
  }

  function hideLoader() {
    const elapsed = Date.now() - start;
    const wait = Math.max(0, MIN_VISIBLE - elapsed);
    setTimeout(() => {
      loader.classList.add('loader-hidden');
      document.documentElement.classList.remove('is-loading');
      revealContent();
      setTimeout(() => loader.remove(), 650);
    }, wait);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
})();

// Back to top button
const backToTopBtn = document.getElementById('backToTop');

function toggleBackToTop() {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const nearBottom = window.innerHeight + scrollY >= document.documentElement.scrollHeight - 200;
  if (nearBottom) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

window.addEventListener('scroll', toggleBackToTop, { passive: true });
toggleBackToTop();

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Vercel Analytics: tracks visitors & page views
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
